import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { AppSettings } from '../../shared/models/app-settings.model';
import { StorageService } from './storage.service';

type TranslationMode = AppSettings['languageMode'];
type Dictionary = Record<string, string>;

const EN: Dictionary = {
  brandName: 'Arova',
  brandLine: 'A private space for two.',
  brandTagline: 'A quiet place for everything you share.',
  universe: 'Universe',
  planets: 'Planets',
  profile: 'Profile',
  customSections: 'Custom Sections',
  memories: 'Memories',
  reasons: 'Reasons',
  letters: 'Letters',
  mood: 'Mood',
  music: 'Music',
  challenges: 'Challenges',
  future: 'Future',
  settings: 'Settings',
  backup: 'Backup',
  admin: 'Admin',
  leaveUniverse: 'Leave Universe',
  sharedUniverse: 'Arova',
  chat: 'Chat',
  coupleProfile: 'Couple Profile',
  dailyQuestions: 'Daily Questions',
  checkIn: 'Check-In',
  todayNav: 'Today',
  usNav: 'Us',
  memoriesNav: 'Memories',
  toolsNav: 'Tools',
  backendNav: 'Backend',
  apiAccount: 'API Account',
  coupleSetup: 'Couple Setup',
  adminNav: 'Admin',
  signedInAs: 'Signed in as',
  activePlanets: 'Active Planets',
  comingSoon: 'Coming Soon',
  settingsTitle: 'Settings',
  settingsSubtitle: 'Choose how this local universe feels in your browser.',
  theme: 'Theme',
  languageMode: 'Language mode',
  animations: 'Animations',
  musicEnabled: 'Music enabled',
  saveSettings: 'Save settings',
  currentUser: 'Current user',
  localPrivacy: 'Local privacy',
  backupTitle: 'Backup Center',
  backupSubtitle: 'Keep Arova safe.',
  lastBackup: 'Last backup',
  exportBackup: 'Export backup JSON',
  importBackup: 'Import backup',
  resetData: 'Reset data',
  moodTitle: 'Mood Room',
  moodSubtitle: 'Tell this shared universe how your heart feels today.',
  today: 'Today',
  saveMood: 'Save mood',
  musicTitle: 'Music Room',
  musicSubtitle: 'Safe placeholders for songs that can belong to your space.',
  nowPlaying: 'Now playing',
  randomSong: 'Random song',
  playlist: 'Playlist',
  previewUnavailable: 'Preview unavailable',
  challengesTitle: 'Couple Challenges',
  challengesSubtitle: 'Small moments that bring partners closer.',
  dailyChallenge: 'Daily challenge',
  completeChallenge: 'Complete challenge',
  futureTitle: 'Future Board',
  futureSubtitle: 'The things this couple space is slowly building toward.',
  markDone: 'Mark done',
  addMemory: 'Add Memory',
  addReason: 'Add Reason',
  addLetter: 'Add Letter',
};

const AR: Dictionary = {
  brandName: 'Arova',
  brandLine: 'مساحة خاصة لشخصين.',
  brandTagline: 'مكان هادئ لكل ما تتشاركانه.',
  universe: 'الكون',
  planets: 'الكواكب',
  profile: 'ملفي الشخصي',
  customSections: 'الأقسام المخصصة',
  memories: 'الذكريات',
  reasons: 'الأسباب',
  letters: 'الرسائل',
  mood: 'المزاج',
  music: 'الموسيقى',
  challenges: 'التحديات',
  future: 'المستقبل',
  settings: 'الإعدادات',
  backup: 'النسخ الاحتياطي',
  admin: 'الإدارة',
  leaveUniverse: 'مغادرة المساحة',
  sharedUniverse: 'Arova',
  chat: 'الدردشة',
  signedInAs: 'مسجل الدخول باسم',
  activePlanets: 'الكواكب النشطة',
  comingSoon: 'قريبا',
  settingsTitle: 'الإعدادات',
  settingsSubtitle: 'اختر إحساس هذه المساحة المحلية في متصفحك.',
  theme: 'السمة',
  languageMode: 'وضع اللغة',
  animations: 'الحركة',
  musicEnabled: 'تفعيل الموسيقى',
  saveSettings: 'حفظ الإعدادات',
  currentUser: 'المستخدم الحالي',
  localPrivacy: 'الخصوصية المحلية',
  backupTitle: 'مركز النسخ الاحتياطي',
  backupSubtitle: 'احفظ هذا الكون الصغير بأمان.',
  lastBackup: 'آخر نسخة',
  exportBackup: 'تصدير نسخة JSON',
  importBackup: 'استيراد نسخة',
  resetData: 'إعادة ضبط البيانات',
  moodTitle: 'غرفة المزاج',
  moodSubtitle: 'اخبر هذه المساحة المشتركة كيف يشعر قلبك اليوم.',
  today: 'اليوم',
  saveMood: 'حفظ المزاج',
  musicTitle: 'غرفة الموسيقى',
  musicSubtitle: 'نماذج آمنة لأغان يمكن أن تنتمي إلى مساحتكم.',
  nowPlaying: 'يعمل الآن',
  randomSong: 'أغنية عشوائية',
  playlist: 'قائمة التشغيل',
  previewUnavailable: 'المعاينة غير متاحة',
  challengesTitle: 'تحديات الشريكين',
  challengesSubtitle: 'لحظات صغيرة تقرب الشريكين.',
  dailyChallenge: 'تحدي اليوم',
  completeChallenge: 'إكمال التحدي',
  futureTitle: 'لوحة المستقبل',
  futureSubtitle: 'الأشياء التي تبنيها هذه المساحة المشتركة ببطء.',
  markDone: 'تحديد كمنجز',
  addMemory: 'إضافة ذكرى',
  addReason: 'إضافة سبب',
  addLetter: 'إضافة رسالة',
};

const ES: Dictionary = {
  brandName: 'Arova',
  brandLine: 'Un espacio privado para dos.',
  brandTagline: 'Un lugar tranquilo para todo lo que comparten.',
  universe: 'Universo',
  planets: 'Planetas',
  profile: 'Perfil',
  customSections: 'Secciones Personalizadas',
  memories: 'Recuerdos',
  reasons: 'Razones',
  letters: 'Cartas',
  mood: 'Estado de ánimo',
  music: 'Música',
  challenges: 'Retos',
  future: 'Futuro',
  settings: 'Ajustes',
  backup: 'Copia',
  admin: 'Admin',
  leaveUniverse: 'Salir de Arova',
  sharedUniverse: 'Arova',
  chat: 'Chat',
  coupleProfile: 'Perfil de pareja',
  dailyQuestions: 'Preguntas diarias',
  checkIn: 'Check-in',
  todayNav: 'Hoy',
  usNav: 'Nosotros',
  memoriesNav: 'Recuerdos',
  toolsNav: 'Herramientas',
  backendNav: 'Backend',
  apiAccount: 'Cuenta API',
  coupleSetup: 'Configurar espacio',
  adminNav: 'Admin',
  settingsTitle: 'Ajustes',
  settingsSubtitle: 'Elige cómo se siente Arova en este navegador.',
  theme: 'Tema',
  languageMode: 'Idioma',
  animations: 'Animaciones',
  musicEnabled: 'Música activada',
  saveSettings: 'Guardar ajustes',
  currentUser: 'Usuario actual',
  localPrivacy: 'Privacidad local',
  backupTitle: 'Centro de copias',
  backupSubtitle: 'Mantén Arova seguro.',
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  constructor(
    private storage: StorageService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  t(key: string): string {
    const mode = this.getLanguageMode();
    const english = EN[key] ?? key;
    const arabic = AR[key] ?? english;
    const spanish = ES[key] ?? english;

    if (mode === 'ar') return arabic;
    if (mode === 'es') return spanish;
    return english;
  }

  getLanguageMode(): TranslationMode {
    const mode = this.storage.getSettings().languageMode as TranslationMode | 'mixed';
    return mode === 'ar' || mode === 'es' ? mode : 'en';
  }

  setLanguageMode(mode: TranslationMode): void {
    this.storage.updateSettings({
      ...this.storage.getSettings(),
      languageMode: mode,
    });
    this.applyLanguageMode(mode);
  }

  loadSavedLanguage(): void {
    this.applyLanguageMode(this.getLanguageMode());
  }

  applyLanguageMode(mode: TranslationMode): void {
    const root = this.document.documentElement;
    root.classList.toggle('language-ar', mode === 'ar');
    root.classList.toggle('language-es', mode === 'es');
    root.dir = mode === 'ar' ? 'rtl' : 'ltr';
    root.lang = mode;
  }
}
