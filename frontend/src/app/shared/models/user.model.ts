export interface AppUser {
  id: string;
  username: string;
  passcode: string;
  displayName: string;
  role: 'admin' | 'partner';
  avatarUrl?: string;
  themePreference?: string;
  lastLoginAt?: string;
}
