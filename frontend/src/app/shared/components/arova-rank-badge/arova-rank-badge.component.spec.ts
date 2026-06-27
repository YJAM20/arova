import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { ArovaRankBadgeComponent } from './arova-rank-badge.component';
import { GamificationService, GamificationScore } from '../../../core/services/gamification.service';

const makeScore = (overrides: Partial<GamificationScore> = {}): GamificationScore => ({
  totalPoints: 0,
  streak: 0,
  currentRankTitle: 'Spark',
  nextRankTitle: 'Warmth',
  nextRankThreshold: 100,
  progressPercent: 0,
  ...overrides,
});

describe('ArovaRankBadgeComponent', () => {
  let component: ArovaRankBadgeComponent;
  let fixture: ComponentFixture<ArovaRankBadgeComponent>;
  let mockGamification: Partial<GamificationService>;

  beforeEach(async () => {
    // Default: Local Mode, 0 points
    mockGamification = {
      isLocalMode: () => true,
      isApiMode: () => false,
      getLocalScore: () => makeScore(),
      getScore: () => of(makeScore()),
    };

    await TestBed.configureTestingModule({
      imports: [ArovaRankBadgeComponent],
      providers: [
        { provide: GamificationService, useValue: mockGamification }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArovaRankBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show fallback "Start your orbit" when points are 0 (Local Mode)', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const fallbackText = compiled.querySelector('#arova-rank-badge-fallback')?.textContent;
    expect(fallbackText).toContain('Start your orbit');
    expect(compiled.querySelector('#arova-rank-badge-active')).toBeNull();
    expect(compiled.querySelector('#arova-rank-badge-loading')).toBeNull();
  });

  it('should show rank title, points, and streak when points > 0 (Local Mode)', () => {
    mockGamification.getLocalScore = () => makeScore({ totalPoints: 120, streak: 3, currentRankTitle: 'Warmth' });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const activeText = compiled.querySelector('#arova-rank-badge-active')?.textContent;
    expect(activeText).toContain('Warmth');
    expect(activeText).toContain('120 pts');
    expect(activeText).toContain('3-day streak');
    expect(compiled.querySelector('#arova-rank-badge-fallback')).toBeNull();
  });

  it('should show shimmer loading state while API score is loading (API Mode)', () => {
    // API Mode with pending Observable (never resolves before detectChanges)
    mockGamification.isLocalMode = () => false;
    mockGamification.isApiMode = () => true;
    mockGamification.getScore = () => new Subject<GamificationScore>().asObservable();

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#arova-rank-badge-loading')).toBeTruthy();
    expect(compiled.querySelector('#arova-rank-badge-active')).toBeNull();
  });

  it('should resolve API Mode score and show active badge', () => {
    mockGamification.isLocalMode = () => false;
    mockGamification.isApiMode = () => true;
    mockGamification.getScore = () => of(makeScore({ totalPoints: 250, streak: 5, currentRankTitle: 'Orbit' }));

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('#arova-rank-badge-loading')).toBeNull();
    const activeText = compiled.querySelector('#arova-rank-badge-active')?.textContent;
    expect(activeText).toContain('Orbit');
    expect(activeText).toContain('250 pts');
    expect(activeText).toContain('5-day streak');
  });

  it('should show offline fallback if API score fails with network error', () => {
    mockGamification.isLocalMode = () => false;
    mockGamification.isApiMode = () => true;
    mockGamification.getScore = () => throwError(() => new Error('Backend is not reachable.'));

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('#arova-rank-badge-loading')).toBeNull();
    const fallback = compiled.querySelector('#arova-rank-badge-fallback');
    expect(fallback).toBeTruthy();
    expect(fallback?.textContent).toContain('Score offline');
  });
});
