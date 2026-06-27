export interface AppSettings {
  activeTheme: string;
  languageMode: 'en' | 'ar' | 'es';
  animationsEnabled: boolean;
  musicEnabled: boolean;
  onboardingCompleted: boolean;
  lastBackupAt?: string;
  emailNotificationsEnabled?: boolean;
  dailyDigestEnabled?: boolean;
  partnerActivityEmailsEnabled?: boolean;
}
