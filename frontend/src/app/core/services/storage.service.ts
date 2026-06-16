import { Injectable } from '@angular/core';
import { LoveUniverseData } from '../../shared/models/love-universe-data.model';
import { Memory, MemoryCategory } from '../../shared/models/memory.model';
import {
  Reason,
  ReasonCategory,
  ReasonReaction,
  ReasonReactionType,
} from '../../shared/models/reason.model';
import { Letter, LetterCategory } from '../../shared/models/letter.model';
import { MoodEntry, MoodType } from '../../shared/models/mood.model';
import { Song } from '../../shared/models/song.model';
import { Challenge, ChallengeCategory, ChallengeCompletion } from '../../shared/models/challenge.model';
import {
  FuturePlan,
  FuturePlanStatus,
  FuturePlanType,
  Priority,
} from '../../shared/models/future-plan.model';
import { AppSettings } from '../../shared/models/app-settings.model';
import { AppUser } from '../../shared/models/user.model';
import { CoupleProfile } from '../../shared/models/couple-profile.model';
import { DailyQuestionAnswer } from '../../shared/models/daily-question.model';
import { RelationshipCheckIn } from '../../shared/models/check-in.model';
import { DEFAULT_DATA } from '../constants/default-data';

const STORAGE_KEY = 'love-universe-data-v1';
const CORRUPT_BACKUP_KEY = `${STORAGE_KEY}-corrupt-backup`;

type CollectionName = 'memories' | 'reasons' | 'letters';

type CollectionMap = {
  memories: Memory;
  reasons: Reason;
  letters: Letter;
};

type StoredRecord = Record<string, unknown>;

const MEMORY_CATEGORIES: MemoryCategory[] = [
  'firsts',
  'funny',
  'deep',
  'romantic',
  'special-day',
  'random',
];
const REASON_CATEGORIES: ReasonCategory[] = ['love', 'trust', 'choose-you', 'miss-you', 'future'];
const REASON_REACTION_TYPES: ReasonReactionType[] = [
  'heart',
  'smile',
  'cry',
  'saved',
  'favorite',
];
const LETTER_CATEGORIES: LetterCategory[] = [
  'miss-me',
  'sad',
  'argument',
  'overthinking',
  'birthday',
  'reassurance',
  'future',
];
const MOOD_TYPES: MoodType[] = [
  'happy',
  'tired',
  'missing-you',
  'overthinking',
  'silent',
  'need-attention',
  'sad',
  'excited',
  'angry-but-soft',
  'need-reassurance',
];
const CHALLENGE_CATEGORIES: ChallengeCategory[] = [
  'romantic',
  'funny',
  'deep',
  'reassurance',
  'memory',
  'future',
  'random',
];
const FUTURE_PLAN_TYPES: FuturePlanType[] = [
  'travel',
  'movie',
  'food',
  'date',
  'dream',
  'promise',
  'learning',
];
const FUTURE_PLAN_STATUSES: FuturePlanStatus[] = [
  'one-day',
  'planned',
  'in-progress',
  'done',
  'secret',
];
const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function nowIso(): string {
  return new Date().toISOString();
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private data: LoveUniverseData;

  constructor() {
    this.data = this.readFromStorage();
  }

  loadFullAppData(): LoveUniverseData {
    return this.deepClone(this.data);
  }

  saveFullAppData(data: Partial<LoveUniverseData> | unknown): void {
    this.data = this.normalizeData(data);
    this.persist();
  }

  normalizeFullAppData(data: Partial<LoveUniverseData> | unknown): LoveUniverseData {
    return this.deepClone(this.normalizeData(data));
  }

  resetToDefaults(): LoveUniverseData {
    this.data = this.normalizeData(DEFAULT_DATA);
    this.persist();
    return this.loadFullAppData();
  }

  getAll(): LoveUniverseData {
    return this.loadFullAppData();
  }

  getUsers(): AppUser[] {
    return this.deepClone(this.data.users);
  }

  getMemories(): Memory[] {
    return this.deepClone(this.data.memories);
  }

  getReasons(): Reason[] {
    return this.deepClone(this.data.reasons);
  }

  getLetters(): Letter[] {
    return this.deepClone(this.data.letters);
  }

  getMoods(): MoodEntry[] {
    return this.deepClone(this.data.moods);
  }

  getSongs(): Song[] {
    return this.deepClone(this.data.songs);
  }

  getChallenges(): Challenge[] {
    return this.deepClone(this.data.challenges);
  }

  getFuturePlans(): FuturePlan[] {
    return this.deepClone(this.data.futurePlans);
  }

  getCoupleProfile(): CoupleProfile {
    return this.deepClone(this.data.coupleProfile);
  }

  getDailyQuestionAnswers(): DailyQuestionAnswer[] {
    return this.deepClone(this.data.dailyQuestionAnswers);
  }

  getCheckIns(): RelationshipCheckIn[] {
    return this.deepClone(this.data.checkIns);
  }

  getSettings(): AppSettings {
    return this.deepClone(this.data.settings);
  }

  updateSettings(settings: AppSettings): void {
    this.data.settings = this.normalizeSettings(settings);
    this.persist();
  }

  updateCoupleProfile(changes: Partial<CoupleProfile>): CoupleProfile {
    this.data.coupleProfile = this.normalizeCoupleProfile({
      ...this.data.coupleProfile,
      ...changes,
      updatedAt: nowIso(),
    });

    this.data.users = this.data.users.map(user => {
      if (user.role === 'admin') {
        return { ...user, displayName: this.data.coupleProfile.partnerADisplayName };
      }

      return { ...user, displayName: this.data.coupleProfile.partnerBDisplayName };
    });

    this.persist();
    return this.getCoupleProfile();
  }

  updateUserLastLogin(userId: string): void {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.lastLoginAt = nowIso();
      this.persist();
    }
  }

  updateUser(userId: string, changes: Partial<AppUser>): void {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      if (changes.displayName) user.displayName = changes.displayName;
      if (changes.avatarUrl) user.avatarUrl = changes.avatarUrl;
      this.persist();
    }
  }

  addItemToCollection<K extends CollectionName>(
    collectionName: K,
    input: Omit<CollectionMap[K], 'id' | 'createdAt' | 'updatedAt'>,
    idPrefix: string,
    placement: 'prepend' | 'append' = 'prepend'
  ): CollectionMap[K] {
    const timestamp = nowIso();
    const item = {
      ...input,
      id: `${idPrefix}-${uid()}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    } as CollectionMap[K];

    const collection = this.data[collectionName] as Array<CollectionMap[K]>;
    if (placement === 'append') {
      collection.push(item);
    } else {
      collection.unshift(item);
    }
    this.persist();
    return this.deepClone(item);
  }

  updateItemById<K extends CollectionName>(
    collectionName: K,
    id: string,
    changes: Partial<CollectionMap[K]>
  ): CollectionMap[K] | null {
    const collection = this.data[collectionName] as Array<CollectionMap[K]>;
    const idx = collection.findIndex(item => item.id === id);
    if (idx === -1) return null;

    const existing = collection[idx];
    const updated = {
      ...existing,
      ...changes,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: nowIso(),
    } as CollectionMap[K];

    collection[idx] = updated;
    this.persist();
    return this.deepClone(updated);
  }

  deleteItemById<K extends CollectionName>(collectionName: K, id: string): boolean {
    const collection = this.data[collectionName] as Array<CollectionMap[K]>;
    const filtered = collection.filter(item => item.id !== id);
    if (filtered.length === collection.length) return false;

    this.data[collectionName] = filtered as LoveUniverseData[K];
    this.persist();
    return true;
  }

  addMemory(memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>): Memory {
    return this.addItemToCollection('memories', memory, 'mem');
  }

  updateMemory(id: string, changes: Partial<Memory>): Memory | null {
    return this.updateItemById('memories', id, changes);
  }

  deleteMemory(id: string): boolean {
    return this.deleteItemById('memories', id);
  }

  toggleMemoryFavorite(id: string): Memory | null {
    const memory = this.data.memories.find(item => item.id === id);
    if (!memory) return null;
    return this.updateMemory(id, { isFavorite: !memory.isFavorite });
  }

  addReason(reason: Omit<Reason, 'id' | 'createdAt' | 'updatedAt'>): Reason {
    return this.addItemToCollection('reasons', reason, 'rsn', 'append');
  }

  updateReason(id: string, changes: Partial<Reason>): Reason | null {
    return this.updateItemById('reasons', id, changes);
  }

  deleteReason(id: string): boolean {
    return this.deleteItemById('reasons', id);
  }

  toggleReasonFavorite(id: string): Reason | null {
    const reason = this.data.reasons.find(item => item.id === id);
    if (!reason) return null;
    return this.updateReason(id, { isFavorite: !reason.isFavorite });
  }

  addLetter(letter: Omit<Letter, 'id' | 'createdAt' | 'updatedAt'>): Letter {
    return this.addItemToCollection('letters', letter, 'ltr');
  }

  updateLetter(id: string, changes: Partial<Letter>): Letter | null {
    return this.updateItemById('letters', id, changes);
  }

  deleteLetter(id: string): boolean {
    return this.deleteItemById('letters', id);
  }

  toggleLetterFavorite(id: string): Letter | null {
    const letter = this.data.letters.find(item => item.id === id);
    if (!letter) return null;
    return this.updateLetter(id, { isFavorite: !letter.isFavorite });
  }

  addMood(entry: Omit<MoodEntry, 'id' | 'createdAt'>): MoodEntry {
    const timestamp = nowIso();
    const moodEntry: MoodEntry = {
      ...entry,
      id: `mood-${uid()}`,
      createdAt: timestamp,
    };

    this.data.moods.unshift(moodEntry);
    this.persist();
    return this.deepClone(moodEntry);
  }

  updateMoodResponse(entryId: string, response: string): MoodEntry | null {
    const entry = this.data.moods.find(item => item.id === entryId);
    if (!entry) return null;

    entry.response = response.trim().length > 0 ? response.trim() : undefined;
    this.persist();
    return this.deepClone(entry);
  }

  upsertDailyQuestionAnswer(
    input: Omit<DailyQuestionAnswer, 'id' | 'createdAt' | 'updatedAt'>
  ): DailyQuestionAnswer {
    const timestamp = nowIso();
    const existing = this.data.dailyQuestionAnswers.find(
      answer =>
        answer.questionId === input.questionId &&
        answer.dateKey === input.dateKey &&
        answer.userId === input.userId
    );

    if (existing) {
      existing.answer = input.answer.trim();
      existing.updatedAt = timestamp;
      this.persist();
      return this.deepClone(existing);
    }

    const answer: DailyQuestionAnswer = {
      ...input,
      answer: input.answer.trim(),
      id: `dq-${uid()}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.data.dailyQuestionAnswers.unshift(answer);
    this.persist();
    return this.deepClone(answer);
  }

  upsertCheckIn(
    input: Omit<RelationshipCheckIn, 'id' | 'createdAt' | 'updatedAt'>
  ): RelationshipCheckIn {
    const timestamp = nowIso();
    const existing = this.data.checkIns.find(
      checkIn => checkIn.userId === input.userId && checkIn.dateKey === input.dateKey
    );
    const normalizedInput = this.normalizeCheckInInput(input);

    if (existing) {
      Object.assign(existing, normalizedInput, { updatedAt: timestamp });
      this.persist();
      return this.deepClone(existing);
    }

    const checkIn: RelationshipCheckIn = {
      ...normalizedInput,
      id: `checkin-${uid()}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.data.checkIns.unshift(checkIn);
    this.persist();
    return this.deepClone(checkIn);
  }

  toggleSongFavorite(id: string): Song | null {
    const song = this.data.songs.find(item => item.id === id);
    if (!song) return null;

    song.isFavorite = !song.isFavorite;
    this.persist();
    return this.deepClone(song);
  }

  private readFromStorage(): LoveUniverseData {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = this.normalizeData(DEFAULT_DATA);
      this.persistData(seeded);
      return seeded;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<LoveUniverseData>;
      const normalized = this.normalizeData(parsed);
      this.persistData(normalized);
      return normalized;
    } catch {
      this.backupCorruptedRaw(raw);
      return this.normalizeData(DEFAULT_DATA);
    }
  }

  private persist(): void {
    this.data.updatedAt = nowIso();
    this.persistData(this.data);
  }

  private persistData(data: LoveUniverseData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  private backupCorruptedRaw(raw: string): void {
    try {
      localStorage.setItem(CORRUPT_BACKUP_KEY, raw);
    } catch {
      // If storage is unavailable or full, keep the app usable in memory.
    }
  }

  private normalizeData(input: Partial<LoveUniverseData> | unknown): LoveUniverseData {
    const fallback = this.deepClone(DEFAULT_DATA);
    const record = this.isRecord(input) ? input : {};

    return {
      version: this.asString(record['version'], fallback.version),
      updatedAt: this.asString(record['updatedAt'], fallback.updatedAt),
      settings: this.normalizeSettings(record['settings']),
      users: this.normalizeUsers(record['users']),
      memories: this.normalizeMemories(record['memories']),
      reasons: this.normalizeReasons(record['reasons']),
      letters: this.normalizeLetters(record['letters']),
      moods: this.normalizeMoods(record['moods']),
      songs: this.normalizeSongs(record['songs']),
      challenges: this.normalizeChallenges(record['challenges']),
      futurePlans: this.normalizeFuturePlans(record['futurePlans']),
      coupleProfile: this.normalizeCoupleProfile(record['coupleProfile']),
      dailyQuestionAnswers: this.normalizeDailyQuestionAnswers(record['dailyQuestionAnswers']),
      checkIns: this.normalizeCheckIns(record['checkIns']),
    };
  }

  private normalizeSettings(value: unknown): AppSettings {
    const fallback = this.deepClone(DEFAULT_DATA.settings);
    if (!this.isRecord(value)) return fallback;

    return {
      activeTheme: this.normalizeThemeName(this.asString(value['activeTheme'], fallback.activeTheme)),
      languageMode: this.isLanguageMode(value['languageMode'])
        ? value['languageMode']
        : fallback.languageMode,
      animationsEnabled: this.asBoolean(value['animationsEnabled'], fallback.animationsEnabled),
      musicEnabled: this.asBoolean(value['musicEnabled'], fallback.musicEnabled),
      onboardingCompleted: this.asBoolean(
        value['onboardingCompleted'],
        fallback.onboardingCompleted
      ),
      lastBackupAt: this.optionalString(value['lastBackupAt']),
    };
  }

  private normalizeCoupleProfile(value: unknown): CoupleProfile {
    const fallback = this.deepClone(DEFAULT_DATA.coupleProfile);
    if (!this.isRecord(value)) return fallback;

    return {
      coupleSpaceName: this.asString(value['coupleSpaceName'], fallback.coupleSpaceName),
      partnerADisplayName: this.asString(
        value['partnerADisplayName'],
        fallback.partnerADisplayName
      ),
      partnerBDisplayName: this.asString(
        value['partnerBDisplayName'],
        fallback.partnerBDisplayName
      ),
      importantDate: this.optionalString(value['importantDate']),
      favoriteSharedActivity: this.optionalString(value['favoriteSharedActivity']),
      relationshipIntention: this.optionalString(value['relationshipIntention']),
      updatedAt: this.asString(value['updatedAt'], nowIso()),
    };
  }

  private normalizeUsers(value: unknown): AppUser[] {
    const defaults = this.deepClone(DEFAULT_DATA.users);
    const source = Array.isArray(value) ? value : [];
    const normalized = source
      .filter(item => this.isRecord(item))
      .map(item => this.normalizeUser(item));

    const byId = new Map<string, AppUser>();
    defaults.forEach(user => byId.set(user.id, user));
    normalized.forEach(user => byId.set(user.id, user));
    return Array.from(byId.values());
  }

  private normalizeUser(value: StoredRecord): AppUser {
    return {
      id: this.asString(value['id'], `user-${uid()}`),
      username: this.asString(value['username'], 'user'),
      passcode: this.asString(value['passcode'], ''),
      displayName: this.asString(value['displayName'], 'User'),
      role: value['role'] === 'admin' ? 'admin' : 'partner',
      avatarUrl: this.optionalString(value['avatarUrl']),
      themePreference: this.optionalString(value['themePreference']),
      lastLoginAt: this.optionalString(value['lastLoginAt']),
    };
  }

  private normalizeMemories(value: unknown): Memory[] {
    if (!Array.isArray(value)) return this.deepClone(DEFAULT_DATA.memories);
    return this.uniqueById(value.filter(item => this.isRecord(item)).map(item => this.normalizeMemory(item)));
  }

  private normalizeMemory(value: StoredRecord): Memory {
    const createdAt = this.asString(value['createdAt'], nowIso());
    const category = this.isMemoryCategory(value['category']) ? value['category'] : 'random';

    return {
      id: this.asString(value['id'], `mem-${uid()}`),
      title: this.asString(value['title'], 'Untitled memory'),
      description: this.asString(value['description'], ''),
      date: this.asString(value['date'], createdAt.slice(0, 10)),
      imageUrl: this.optionalString(value['imageUrl']),
      category,
      mood: this.optionalString(value['mood']),
      songId: this.optionalString(value['songId']),
      privateNote: this.optionalString(value['privateNote']),
      visibleToPartner: this.asBoolean(value['visibleToPartner'], true),
      isFavorite: this.asBoolean(value['isFavorite'], false),
      createdBy: this.optionalString(value['createdBy']) ?? 'user-owner',
      createdAt,
      updatedAt: this.asString(value['updatedAt'], createdAt),
    };
  }

  private normalizeReasons(value: unknown): Reason[] {
    if (!Array.isArray(value)) return this.deepClone(DEFAULT_DATA.reasons);
    return this.uniqueById(value.filter(item => this.isRecord(item)).map(item => this.normalizeReason(item)));
  }

  private normalizeReason(value: StoredRecord): Reason {
    const createdAt = this.asString(value['createdAt'], nowIso());
    const category = this.isReasonCategory(value['category']) ? value['category'] : 'love';

    return {
      id: this.asString(value['id'], `rsn-${uid()}`),
      title: this.asString(value['title'], 'Untitled reason'),
      body: this.asString(value['body'], ''),
      category,
      order: this.asNumber(value['order'], 1),
      unlockDate: this.optionalString(value['unlockDate']),
      isSecret: this.asBoolean(value['isSecret'], false),
      isFavorite: this.asBoolean(value['isFavorite'], false),
      reactions: this.normalizeReasonReactions(value['reactions']),
      createdBy: this.optionalString(value['createdBy']) ?? 'user-owner',
      createdAt,
      updatedAt: this.asString(value['updatedAt'], createdAt),
    };
  }

  private normalizeReasonReactions(value: unknown): ReasonReaction[] {
    if (!Array.isArray(value)) return [];

    const byUserAndType = new Map<string, ReasonReaction>();
    value
      .filter(item => this.isRecord(item))
      .map(item => this.normalizeReasonReaction(item))
      .filter((reaction): reaction is ReasonReaction => !!reaction)
      .forEach(reaction => {
        byUserAndType.set(`${reaction.userId}:${reaction.type}`, reaction);
      });

    return Array.from(byUserAndType.values());
  }

  private normalizeReasonReaction(value: StoredRecord): ReasonReaction | null {
    const userId = this.asString(value['userId'], '').trim();
    if (!userId) return null;

    return {
      userId,
      type: this.isReasonReactionType(value['type']) ? value['type'] : 'heart',
      createdAt: this.asString(value['createdAt'], nowIso()),
    };
  }

  private normalizeLetters(value: unknown): Letter[] {
    if (!Array.isArray(value)) return this.deepClone(DEFAULT_DATA.letters);
    return this.uniqueById(value.filter(item => this.isRecord(item)).map(item => this.normalizeLetter(item)));
  }

  private normalizeLetter(value: StoredRecord): Letter {
    const createdAt = this.asString(value['createdAt'], nowIso());
    const category = this.isLetterCategory(value['category']) ? value['category'] : 'miss-me';

    return {
      id: this.asString(value['id'], `ltr-${uid()}`),
      title: this.asString(value['title'], 'Untitled letter'),
      body: this.asString(value['body'], ''),
      category,
      unlockDate: this.optionalString(value['unlockDate']),
      passcode: this.optionalString(value['passcode']),
      isLocked: this.asBoolean(value['isLocked'], false),
      isFavorite: this.asBoolean(value['isFavorite'], false),
      visibleToPartner: this.asBoolean(value['visibleToPartner'], true),
      createdBy: this.optionalString(value['createdBy']) ?? 'user-owner',
      createdAt,
      updatedAt: this.asString(value['updatedAt'], createdAt),
    };
  }

  private normalizeMoods(value: unknown): MoodEntry[] {
    if (!Array.isArray(value)) return this.deepClone(DEFAULT_DATA.moods);
    return this.uniqueById(value.filter(item => this.isRecord(item)).map(item => this.normalizeMood(item)));
  }

  private normalizeDailyQuestionAnswers(value: unknown): DailyQuestionAnswer[] {
    if (!Array.isArray(value)) return this.deepClone(DEFAULT_DATA.dailyQuestionAnswers);
    return this.uniqueById(
      value.filter(item => this.isRecord(item)).map(item => this.normalizeDailyQuestionAnswer(item))
    );
  }

  private normalizeDailyQuestionAnswer(value: StoredRecord): DailyQuestionAnswer {
    const createdAt = this.asString(value['createdAt'], nowIso());

    return {
      id: this.asString(value['id'], `dq-${uid()}`),
      questionId: this.asString(value['questionId'], ''),
      dateKey: this.asString(value['dateKey'], createdAt.slice(0, 10)),
      userId: this.asString(value['userId'], ''),
      answer: this.asString(value['answer'], ''),
      createdAt,
      updatedAt: this.asString(value['updatedAt'], createdAt),
    };
  }

  private normalizeCheckIns(value: unknown): RelationshipCheckIn[] {
    if (!Array.isArray(value)) return this.deepClone(DEFAULT_DATA.checkIns);
    return this.uniqueById(
      value.filter(item => this.isRecord(item)).map(item => this.normalizeCheckIn(item))
    );
  }

  private normalizeCheckIn(value: StoredRecord): RelationshipCheckIn {
    const createdAt = this.asString(value['createdAt'], nowIso());

    return {
      id: this.asString(value['id'], `checkin-${uid()}`),
      ...this.normalizeCheckInInput({
        userId: this.asString(value['userId'], ''),
        dateKey: this.asString(value['dateKey'], createdAt.slice(0, 10)),
        connectionLevel: this.asNumber(value['connectionLevel'], 3),
        energyLevel: this.asNumber(value['energyLevel'], 3),
        communicationFeeling: this.asNumber(value['communicationFeeling'], 3),
        note: this.optionalString(value['note']),
      }),
      createdAt,
      updatedAt: this.asString(value['updatedAt'], createdAt),
    };
  }

  private normalizeCheckInInput(
    input: Omit<RelationshipCheckIn, 'id' | 'createdAt' | 'updatedAt'>
  ): Omit<RelationshipCheckIn, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      userId: input.userId,
      dateKey: input.dateKey,
      connectionLevel: this.clampLevel(input.connectionLevel),
      energyLevel: this.clampLevel(input.energyLevel),
      communicationFeeling: this.clampLevel(input.communicationFeeling),
      note: input.note?.trim() ? input.note.trim() : undefined,
    };
  }

  private normalizeMood(value: StoredRecord): MoodEntry {
    const createdAt = this.asString(value['createdAt'], nowIso());
    const mood = this.isMoodType(value['mood']) ? value['mood'] : 'happy';

    return {
      id: this.asString(value['id'], `mood-${uid()}`),
      userId: this.asString(value['userId'], ''),
      mood,
      note: this.optionalString(value['note']),
      response: this.optionalString(value['response']),
      date: this.asString(value['date'], createdAt.slice(0, 10)),
      createdAt,
    };
  }

  private normalizeSongs(value: unknown): Song[] {
    if (!Array.isArray(value)) return this.deepClone(DEFAULT_DATA.songs);
    return this.uniqueById(value.filter(item => this.isRecord(item)).map(item => this.normalizeSong(item)));
  }

  private normalizeSong(value: StoredRecord): Song {
    const createdAt = this.asString(value['createdAt'], nowIso());
    const mood = this.isMoodType(value['mood']) ? value['mood'] : undefined;

    return {
      id: this.asString(value['id'], `song-${uid()}`),
      title: this.asString(value['title'], 'Untitled song'),
      artist: this.optionalString(value['artist']),
      audioUrl: this.optionalString(value['audioUrl']),
      coverUrl: this.optionalString(value['coverUrl']),
      mood,
      memoryId: this.optionalString(value['memoryId']),
      isFavorite: this.asBoolean(value['isFavorite'], false),
      sourceName: this.optionalString(value['sourceName']) ?? 'Local placeholder',
      sourceUrl: this.optionalString(value['sourceUrl']),
      license: this.optionalString(value['license']) ?? 'No audio file included',
      attribution: this.optionalString(value['attribution']) ?? 'Preview unavailable until a safe audio source is added.',
      createdAt,
    };
  }

  private normalizeChallenges(value: unknown): Challenge[] {
    if (!Array.isArray(value)) return this.deepClone(DEFAULT_DATA.challenges);
    return this.uniqueById(
      value.filter(item => this.isRecord(item)).map(item => this.normalizeChallenge(item))
    );
  }

  private normalizeChallenge(value: StoredRecord): Challenge {
    const createdAt = this.asString(value['createdAt'], nowIso());
    const category = this.isChallengeCategory(value['category']) ? value['category'] : 'random';
    const completedBy = Array.isArray(value['completedBy'])
      ? value['completedBy']
          .filter(item => this.isRecord(item))
          .map(item => this.normalizeChallengeCompletion(item))
      : [];

    return {
      id: this.asString(value['id'], `chg-${uid()}`),
      title: this.asString(value['title'], 'Untitled challenge'),
      description: this.asString(value['description'], ''),
      category,
      isDaily: this.asBoolean(value['isDaily'], false),
      completedBy,
      createdAt,
    };
  }

  private normalizeChallengeCompletion(value: StoredRecord): ChallengeCompletion {
    return {
      userId: this.asString(value['userId'], ''),
      answer: this.optionalString(value['answer']),
      completedAt: this.asString(value['completedAt'], nowIso()),
    };
  }

  private normalizeFuturePlans(value: unknown): FuturePlan[] {
    if (!Array.isArray(value)) return this.deepClone(DEFAULT_DATA.futurePlans);
    return this.uniqueById(
      value.filter(item => this.isRecord(item)).map(item => this.normalizeFuturePlan(item))
    );
  }

  private normalizeFuturePlan(value: StoredRecord): FuturePlan {
    const createdAt = this.asString(value['createdAt'], nowIso());
    const type = this.isFuturePlanType(value['type']) ? value['type'] : 'dream';
    const status = this.isFuturePlanStatus(value['status']) ? value['status'] : 'one-day';
    const priority = this.isPriority(value['priority']) ? value['priority'] : 'medium';

    return {
      id: this.asString(value['id'], `future-${uid()}`),
      title: this.asString(value['title'], 'Untitled plan'),
      description: this.optionalString(value['description']),
      type,
      status,
      targetDate: this.optionalString(value['targetDate']),
      priority,
      createdBy: this.optionalString(value['createdBy']) ?? 'user-owner',
      createdAt,
      updatedAt: this.asString(value['updatedAt'], createdAt),
    };
  }

  private uniqueById<T extends { id: string }>(items: T[]): T[] {
    const byId = new Map<string, T>();
    items.forEach(item => byId.set(item.id, item));
    return Array.from(byId.values());
  }

  private isRecord(value: unknown): value is StoredRecord {
    return typeof value === 'object' && value !== null;
  }

  private asString(value: unknown, fallback: string): string {
    return typeof value === 'string' ? value : fallback;
  }

  private optionalString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
  }

  private asBoolean(value: unknown, fallback: boolean): boolean {
    return typeof value === 'boolean' ? value : fallback;
  }

  private asNumber(value: unknown, fallback: number): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private clampLevel(value: number): number {
    return Math.min(5, Math.max(1, Math.round(value)));
  }

  private isMemoryCategory(value: unknown): value is MemoryCategory {
    return typeof value === 'string' && MEMORY_CATEGORIES.includes(value as MemoryCategory);
  }

  private isReasonCategory(value: unknown): value is ReasonCategory {
    return typeof value === 'string' && REASON_CATEGORIES.includes(value as ReasonCategory);
  }

  private isReasonReactionType(value: unknown): value is ReasonReactionType {
    return (
      typeof value === 'string' &&
      REASON_REACTION_TYPES.includes(value as ReasonReactionType)
    );
  }

  private isLetterCategory(value: unknown): value is LetterCategory {
    return typeof value === 'string' && LETTER_CATEGORIES.includes(value as LetterCategory);
  }

  private isMoodType(value: unknown): value is MoodType {
    return typeof value === 'string' && MOOD_TYPES.includes(value as MoodType);
  }

  private isChallengeCategory(value: unknown): value is ChallengeCategory {
    return (
      typeof value === 'string' && CHALLENGE_CATEGORIES.includes(value as ChallengeCategory)
    );
  }

  private isFuturePlanType(value: unknown): value is FuturePlanType {
    return typeof value === 'string' && FUTURE_PLAN_TYPES.includes(value as FuturePlanType);
  }

  private isFuturePlanStatus(value: unknown): value is FuturePlanStatus {
    return (
      typeof value === 'string' && FUTURE_PLAN_STATUSES.includes(value as FuturePlanStatus)
    );
  }

  private isPriority(value: unknown): value is Priority {
    return typeof value === 'string' && PRIORITIES.includes(value as Priority);
  }

  private isLanguageMode(value: unknown): value is AppSettings['languageMode'] {
    return value === 'en' || value === 'ar' || value === 'es';
  }

  private normalizeThemeName(value: string): string {
    return value === 'dark-universe' ? 'dark-romantic' : value;
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }
}
