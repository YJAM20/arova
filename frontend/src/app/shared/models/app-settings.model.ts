export interface AppSettings {
  activeTheme: string;
  languageMode: 'en' | 'ar' | 'es';
  animationsEnabled: boolean;
  musicEnabled: boolean;
  onboardingCompleted: boolean;
  lastBackupAt?: string;
}
