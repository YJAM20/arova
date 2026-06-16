import { AppUser } from './user.model';
import { Memory } from './memory.model';
import { Reason } from './reason.model';
import { Letter } from './letter.model';
import { AppSettings } from './app-settings.model';
import { MoodEntry } from './mood.model';
import { Song } from './song.model';
import { Challenge } from './challenge.model';
import { FuturePlan } from './future-plan.model';
import { CoupleProfile } from './couple-profile.model';
import { DailyQuestionAnswer } from './daily-question.model';
import { RelationshipCheckIn } from './check-in.model';

export interface LoveUniverseData {
  users: AppUser[];
  memories: Memory[];
  reasons: Reason[];
  letters: Letter[];
  moods: MoodEntry[];
  songs: Song[];
  challenges: Challenge[];
  futurePlans: FuturePlan[];
  coupleProfile: CoupleProfile;
  dailyQuestionAnswers: DailyQuestionAnswer[];
  checkIns: RelationshipCheckIn[];
  settings: AppSettings;
  version: string;
  updatedAt: string;
}
