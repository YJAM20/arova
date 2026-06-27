import { Injectable } from '@angular/core';
import { GamificationService } from './gamification.service';

export interface Planet {
  id: string;
  name: string;
  purpose: string;
  dailyQuestion: string;
  tasks: string[];
  pointsReward: number;
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  couplePrompt: string;
  visualClass: string;
  icon: string;
}

export interface DailyPlanetState {
  dateKey: string;
  planetId: string;
  completedTasks: boolean[]; // tracks which task index is completed
  rewardClaimed: boolean;
}

const PLANETS_DB: Planet[] = [
  {
    id: 'planet-mercury',
    name: 'Mercury',
    purpose: 'Deep Communication',
    dailyQuestion: 'What was the most meaningful conversation we had recently?',
    tasks: [
      'Share a 5-minute honest check-in about how you feel',
      'Write down one thing you want to talk about tonight'
    ],
    pointsReward: 50,
    estimatedTime: '10 mins',
    difficulty: 'Easy',
    couplePrompt: 'Communication is the bridge between two hearts.',
    visualClass: 'planet-mercury',
    icon: '🪐'
  },
  {
    id: 'planet-venus',
    name: 'Venus',
    purpose: 'Affection & Intimacy',
    dailyQuestion: 'When did you feel most loved by your partner this week?',
    tasks: [
      'Send a surprise sweet text right now',
      'Give your partner a long hug when you see them next'
    ],
    pointsReward: 50,
    estimatedTime: '5 mins',
    difficulty: 'Easy',
    couplePrompt: 'Affection keeps the connection warm and tender.',
    visualClass: 'planet-venus',
    icon: '💖'
  },
  {
    id: 'planet-earth',
    name: 'Earth',
    purpose: 'Shared Memories',
    dailyQuestion: 'What is your absolute favorite shared memory together?',
    tasks: [
      'Add a memory of a time you laughed together',
      'Look through 3 old photos of a trip you made'
    ],
    pointsReward: 50,
    estimatedTime: '15 mins',
    difficulty: 'Medium',
    couplePrompt: 'Memories are the soil from which our love grows.',
    visualClass: 'planet-earth',
    icon: '🌍'
  },
  {
    id: 'planet-mars',
    name: 'Mars',
    purpose: 'Courage & Conflict Repair',
    dailyQuestion: 'What is a safe word or gesture we can use when discussions get heavy?',
    tasks: [
      'Discuss one small boundary you want to clarify gently',
      'Acknowledge one thing you could have handled better recently'
    ],
    pointsReward: 50,
    estimatedTime: '20 mins',
    difficulty: 'Hard',
    couplePrompt: 'Conflict is not a sign of failure, but an opportunity to build trust.',
    visualClass: 'planet-mars',
    icon: '🔴'
  },
  {
    id: 'planet-jupiter',
    name: 'Jupiter',
    purpose: 'Mutual Growth',
    dailyQuestion: 'What is a personal goal your partner is working on that you want to support?',
    tasks: [
      'Tell your partner one way they have grown in the last year',
      'Identify a skill or interest you want to learn together'
    ],
    pointsReward: 50,
    estimatedTime: '15 mins',
    difficulty: 'Medium',
    couplePrompt: 'Growth keeps our shared space dynamic and expansive.',
    visualClass: 'planet-jupiter',
    icon: '🪐'
  },
  {
    id: 'planet-saturn',
    name: 'Saturn',
    purpose: 'Commitment & Rituals',
    dailyQuestion: 'What does commitment feel like to you in our daily lives?',
    tasks: [
      'Write a promise or letter for the future in the vault',
      'Choose one routine you want to commit to for the next month'
    ],
    pointsReward: 50,
    estimatedTime: '15 mins',
    difficulty: 'Medium',
    couplePrompt: 'Commitment is the gravity that keeps us anchored.',
    visualClass: 'planet-saturn',
    icon: '💫'
  },
  {
    id: 'planet-neptune',
    name: 'Neptune',
    purpose: 'Dreams & Imagination',
    dailyQuestion: 'If we could go anywhere in the world tomorrow without limits, where would it be?',
    tasks: [
      'Describe a crazy shared dream you have for 5 years from now',
      'Add a dream plan to the future board'
    ],
    pointsReward: 50,
    estimatedTime: '10 mins',
    difficulty: 'Easy',
    couplePrompt: 'Imagination allows us to map out a magical future.',
    visualClass: 'planet-neptune',
    icon: '🌀'
  },
  {
    id: 'planet-moon',
    name: 'Moon',
    purpose: 'Calm Check-in',
    dailyQuestion: 'What is currently draining your energy, and how can your partner help?',
    tasks: [
      'Take 3 deep breaths together in silence',
      'Write down a soft reassurance note and send it'
    ],
    pointsReward: 50,
    estimatedTime: '10 mins',
    difficulty: 'Easy',
    couplePrompt: 'A quiet space is needed for reflection and rest.',
    visualClass: 'planet-moon',
    icon: '🌙'
  },
  {
    id: 'planet-sun',
    name: 'Sun',
    purpose: 'Shared Gratitude',
    dailyQuestion: 'What is one small thing your partner did today that you are grateful for?',
    tasks: [
      'List 3 things you appreciate about your partner\'s presence',
      'Say "Thank you for being you" with a specific reason'
    ],
    pointsReward: 50,
    estimatedTime: '5 mins',
    difficulty: 'Easy',
    couplePrompt: 'Gratitude fills our space with warmth and light.',
    visualClass: 'planet-sun',
    icon: '☀️'
  },
  {
    id: 'planet-aurora',
    name: 'Aurora',
    purpose: 'Play & Surprises',
    dailyQuestion: 'What is a small surprise that would make your partner smile?',
    tasks: [
      'Plan a small, simple surprise for the coming week',
      'Share a funny or unexpected memory your partner forgot'
    ],
    pointsReward: 50,
    estimatedTime: '10 mins',
    difficulty: 'Medium',
    couplePrompt: 'Surprises keep our universe alive with magic.',
    visualClass: 'planet-aurora',
    icon: '✨'
  }
];

const DAILY_PLANET_KEY = 'arova-daily-planet-state-v1';

@Injectable({ providedIn: 'root' })
export class PlanetService {
  private dailyState: DailyPlanetState | null = null;

  constructor(private gamification: GamificationService) {
    this.loadState();
  }

  private getTodayDateKey(): string {
    const today = new Date();
    return [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');
  }

  private loadState(): void {
    const raw = localStorage.getItem(DAILY_PLANET_KEY);
    const today = this.getTodayDateKey();

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as DailyPlanetState;
        if (parsed.dateKey === today) {
          this.dailyState = parsed;
          return;
        }
      } catch {
        // ignore
      }
    }

    this.initDailyState(today);
  }

  private initDailyState(today: string): void {
    // seed based on dateKey to ensure both users get the same planet
    const seed = Array.from(today).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const planet = PLANETS_DB[seed % PLANETS_DB.length];
    
    this.dailyState = {
      dateKey: today,
      planetId: planet.id,
      completedTasks: new Array(planet.tasks.length).fill(false),
      rewardClaimed: false,
    };
    this.saveState();
  }

  private saveState(): void {
    if (this.dailyState) {
      localStorage.setItem(DAILY_PLANET_KEY, JSON.stringify(this.dailyState));
    }
  }

  getPlanets(): Planet[] {
    return PLANETS_DB;
  }

  getTodayPlanet(): Planet {
    this.loadState(); // ensure up to date
    const id = this.dailyState?.planetId ?? PLANETS_DB[0].id;
    return PLANETS_DB.find(p => p.id === id) ?? PLANETS_DB[0];
  }

  getTodayState(): DailyPlanetState {
    this.loadState();
    if (!this.dailyState) {
      this.initDailyState(this.getTodayDateKey());
    }
    return this.dailyState!;
  }

  toggleTask(taskIndex: number, completed: boolean): void {
    const state = this.getTodayState();
    if (taskIndex >= 0 && taskIndex < state.completedTasks.length) {
      state.completedTasks[taskIndex] = completed;
      this.saveState();
      
      this.checkAndAwardCompletion();
    }
  }

  private checkAndAwardCompletion(): void {
    const state = this.getTodayState();
    const allDone = state.completedTasks.every(Boolean);
    
    if (allDone && !state.rewardClaimed) {
      state.rewardClaimed = true;
      this.saveState();
      this.gamification.rewardPlanetComplete();
    }
  }
}
