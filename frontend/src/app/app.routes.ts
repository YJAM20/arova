import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Arova — A private space for two',
    loadComponent: () =>
      import('./features/public/pages/landing-page/landing-page.component').then(
        m => m.LandingPageComponent
      ),
  },
  {
    path: 'plans',
    title: 'Arova — Pricing Plans',
    loadComponent: () =>
      import('./features/public/pages/plans-page/plans-page.component').then(
        m => m.PlansPageComponent
      ),
  },
  {
    path: 'plans/gifted',
    title: 'Arova — Gifted Upgrade',
    loadComponent: () =>
      import('./features/public/pages/gifted-plan-page/gifted-plan-page.component').then(
        m => m.GiftedPlanPageComponent
      ),
  },
  {
    path: 'admin-showcase',
    title: 'Arova Control Center — Admin Showcase',
    loadComponent: () =>
      import('./features/admin-showcase/admin-showcase.component').then(
        m => m.AdminShowcaseComponent
      ),
  },
  {
    path: 'auth',
    title: 'Arova — Authentication',
    loadComponent: () =>
      import('./features/auth/pages/public-auth/public-auth.component').then(
        m => m.PublicAuthComponent
      ),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'verify-account',
    canActivate: [authGuard],
    title: 'Arova — Verify Account',
    loadComponent: () =>
      import('./features/auth/pages/verify-account/verify-account.component').then(
        m => m.VerifyAccountComponent
      ),
  },
  {
    path: 'onboarding/questions',
    canActivate: [authGuard],
    title: 'Arova — Onboarding Questions',
    loadComponent: () =>
      import('./features/onboarding/pages/onboarding-questions/onboarding-questions.component').then(
        m => m.OnboardingQuestionsComponent
      ),
  },
  {
    path: 'profile-setup',
    canActivate: [authGuard],
    title: 'Arova - Profile Setup',
    loadComponent: () =>
      import('./features/profile/pages/profile-setup/profile-setup.component').then(
        m => m.ProfileSetupComponent
      ),
  },
  {
    path: 'pairing-choice',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/couple/pages/pairing-choice/pairing-choice.component').then(
        m => m.PairingChoiceComponent
      ),
  },
  {
    path: 'dev/api-auth-test',
    loadComponent: () =>
      import('./features/auth/pages/api-auth-test/api-auth-test.component').then(
        m => m.ApiAuthTestComponent
      ),
  },
  {
    path: 'api-auth',
    loadComponent: () =>
      import('./features/auth/pages/api-auth/api-auth.component').then(m => m.ApiAuthComponent),
  },
  {
    path: 'couple-setup',
    loadComponent: () =>
      import('./features/couple/pages/couple-setup/couple-setup.component').then(
        m => m.CoupleSetupComponent
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'universe',
        title: 'Arova — Universe Dashboard',
        loadComponent: () =>
          import('./features/universe/pages/universe-home/universe-home.component').then(
            m => m.UniverseHomeComponent
          ),
      },
      {
        path: 'onboarding',
        loadComponent: () =>
          import('./features/onboarding/pages/onboarding-page/onboarding-page.component').then(
            m => m.OnboardingPageComponent
          ),
      },
      {
        path: 'couple-profile',
        loadComponent: () =>
          import('./features/couple-profile/pages/couple-profile-page/couple-profile-page.component').then(
            m => m.CoupleProfilePageComponent
          ),
      },
      {
        path: 'daily-questions',
        loadComponent: () =>
          import('./features/daily-questions/pages/daily-questions-page/daily-questions-page.component').then(
            m => m.DailyQuestionsPageComponent
          ),
      },
      {
        path: 'check-in',
        loadComponent: () =>
          import('./features/check-in/pages/check-in-page/check-in-page.component').then(
            m => m.CheckInPageComponent
          ),
      },
      {
        path: 'chat',
        title: 'Arova — Private Chat',
        loadComponent: () =>
          import('./features/chat/pages/chat-room/chat-room.component').then(
            m => m.ChatRoomComponent
          ),
      },
      {
        path: 'memories',
        loadComponent: () =>
          import('./features/memories/pages/memories-list/memories-list.component').then(
            m => m.MemoriesListComponent
          ),
      },
      {
        path: 'memories/new',
        loadComponent: () =>
          import('./features/admin/pages/memory-form/memory-form.component').then(
            m => m.MemoryFormComponent
          ),
      },
      {
        path: 'memories/:id/edit',
        loadComponent: () =>
          import('./features/admin/pages/memory-form/memory-form.component').then(
            m => m.MemoryFormComponent
          ),
      },
      {
        path: 'memories/:id/replay',
        loadComponent: () =>
          import('./features/memories/pages/memory-replay/memory-replay.component').then(
            m => m.MemoryReplayComponent
          ),
      },
      {
        path: 'memories/:id',
        loadComponent: () =>
          import('./features/memories/pages/memory-details/memory-details.component').then(
            m => m.MemoryDetailsComponent
          ),
      },
      {
        path: 'reasons',
        loadComponent: () =>
          import('./features/reasons/pages/reasons-list/reasons-list.component').then(
            m => m.ReasonsListComponent
          ),
      },
      {
        path: 'reasons/new',
        loadComponent: () =>
          import('./features/admin/pages/reason-form/reason-form.component').then(
            m => m.ReasonFormComponent
          ),
      },
      {
        path: 'reasons/:id/edit',
        loadComponent: () =>
          import('./features/admin/pages/reason-form/reason-form.component').then(
            m => m.ReasonFormComponent
          ),
      },
      {
        path: 'reasons/:id',
        loadComponent: () =>
          import('./features/reasons/pages/reason-details/reason-details.component').then(
            m => m.ReasonDetailsComponent
          ),
      },
      {
        path: 'letters',
        loadComponent: () =>
          import('./features/letters/pages/letters-vault/letters-vault.component').then(
            m => m.LettersVaultComponent
          ),
      },
      {
        path: 'letters/new',
        loadComponent: () =>
          import('./features/admin/pages/letter-form/letter-form.component').then(
            m => m.LetterFormComponent
          ),
      },
      {
        path: 'letters/:id/edit',
        loadComponent: () =>
          import('./features/admin/pages/letter-form/letter-form.component').then(
            m => m.LetterFormComponent
          ),
      },
      {
        path: 'letters/:id',
        loadComponent: () =>
          import('./features/letters/pages/letter-details/letter-details.component').then(
            m => m.LetterDetailsComponent
          ),
      },
      {
        path: 'mood',
        loadComponent: () =>
          import('./features/mood/pages/mood-room/mood-room.component').then(
            m => m.MoodRoomComponent
          ),
      },
      {
        path: 'music',
        loadComponent: () =>
          import('./features/music/pages/music-room/music-room.component').then(
            m => m.MusicRoomComponent
          ),
      },
      {
        path: 'challenges',
        loadComponent: () =>
          import('./features/challenges/pages/challenges-home/challenges-home.component').then(
            m => m.ChallengesHomeComponent
          ),
      },
      {
        path: 'future',
        loadComponent: () =>
          import('./features/future/pages/future-board/future-board.component').then(
            m => m.FutureBoardComponent
          ),
      },
      {
        path: 'planets',
        loadComponent: () =>
          import('./features/planets/pages/planets-home/planets-home.component').then(
            m => m.PlanetsHomeComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/pages/profile-view/profile-view.component').then(
            m => m.ProfileViewComponent
          ),
      },
      {
        path: 'custom-sections',
        loadComponent: () =>
          import('./features/custom-sections/pages/custom-sections-home/custom-sections-home.component').then(
            m => m.CustomSectionsHomeComponent
          ),
      },
      {
        path: 'settings',
        title: 'Arova — Settings',
        loadComponent: () =>
          import('./features/settings/pages/settings-page/settings-page.component').then(
            m => m.SettingsPageComponent
          ),
      },
      {
        path: 'backup',
        canActivate: [authGuard, adminGuard],
        loadComponent: () =>
          import('./features/backup/pages/backup-center/backup-center.component').then(
            m => m.BackupCenterComponent
          ),
      },
      {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/admin/pages/admin-dashboard/admin-dashboard.component').then(
                m => m.AdminDashboardComponent
              ),
          },
          {
            path: 'memories',
            loadComponent: () =>
              import('./features/admin/pages/admin-memories/admin-memories.component').then(
                m => m.AdminMemoriesComponent
              ),
          },
          {
            path: 'memories/new',
            loadComponent: () =>
              import('./features/admin/pages/memory-form/memory-form.component').then(
                m => m.MemoryFormComponent
              ),
          },
          {
            path: 'memories/:id/edit',
            loadComponent: () =>
              import('./features/admin/pages/memory-form/memory-form.component').then(
                m => m.MemoryFormComponent
              ),
          },
          {
            path: 'reasons',
            loadComponent: () =>
              import('./features/admin/pages/admin-reasons/admin-reasons.component').then(
                m => m.AdminReasonsComponent
              ),
          },
          {
            path: 'reasons/new',
            loadComponent: () =>
              import('./features/admin/pages/reason-form/reason-form.component').then(
                m => m.ReasonFormComponent
              ),
          },
          {
            path: 'reasons/:id/edit',
            loadComponent: () =>
              import('./features/admin/pages/reason-form/reason-form.component').then(
                m => m.ReasonFormComponent
              ),
          },
          {
            path: 'letters',
            loadComponent: () =>
              import('./features/admin/pages/admin-letters/admin-letters.component').then(
                m => m.AdminLettersComponent
              ),
          },
          {
            path: 'letters/new',
            loadComponent: () =>
              import('./features/admin/pages/letter-form/letter-form.component').then(
                m => m.LetterFormComponent
              ),
          },
          {
            path: 'letters/:id/edit',
            loadComponent: () =>
              import('./features/admin/pages/letter-form/letter-form.component').then(
                m => m.LetterFormComponent
              ),
          },
        ],
      },
      {
        path: '404',
        loadComponent: () =>
          import('./shared/components/not-found/not-found.component').then(
            m => m.NotFoundPageComponent
          ),
      },
      {
        path: 'offline',
        loadComponent: () =>
          import('./shared/components/backend-offline/backend-offline.component').then(
            m => m.BackendOfflinePageComponent
          ),
      },
      { path: '**', redirectTo: '404' },
    ],
  },
  { path: '**', redirectTo: 'auth' },
];
