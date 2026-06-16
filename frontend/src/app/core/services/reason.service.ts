import { Injectable } from '@angular/core';
import { Reason, ReasonReaction, ReasonReactionType } from '../../shared/models/reason.model';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { RelationshipPointsService } from './relationship-points.service';

export type ReasonInput = Omit<Reason, 'id' | 'createdAt' | 'updatedAt' | 'reactions' | 'createdBy'> & {
  reactions?: ReasonReaction[];
};

@Injectable({ providedIn: 'root' })
export class ReasonService {
  constructor(
    private storage: StorageService,
    private auth: AuthService,
    private pointsService: RelationshipPointsService
  ) {}

  getReasons(): Reason[] {
    return this.storage.getReasons();
  }

  getReasonById(id: string): Reason | null {
    return this.getReasons().find(reason => reason.id === id) ?? null;
  }

  getVisibleReasonsForCurrentUser(): Reason[] {
    const reasons = this.getReasons();
    return this.auth.isAdmin()
      ? reasons
      : reasons.filter(reason => !reason.isSecret || this.isOwner(reason));
  }

  addReason(input: ReasonInput): Reason {
    return this.storage.addReason({
      ...input,
      reactions: input.reactions ?? [],
      createdBy: this.currentUserId(),
    });
  }

  updateReason(id: string, changes: Partial<Reason>): Reason | null {
    const reason = this.getReasonById(id);
    if (!reason || !this.canEditReason(reason)) return null;
    return this.storage.updateReason(id, changes);
  }

  deleteReason(id: string): boolean {
    const reason = this.getReasonById(id);
    if (!reason || !this.canEditReason(reason)) return false;
    return this.storage.deleteReason(id);
  }

  toggleFavorite(id: string): Reason | null {
    const reason = this.getReasonById(id);
    if (!reason || !this.canViewReason(reason)) return null;
    return this.storage.toggleReasonFavorite(id);
  }

  getRandomReason(): Reason | null {
    const reasons = this.getVisibleReasonsForCurrentUser();
    if (reasons.length === 0) return null;
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  getDailyReason(): Reason | null {
    const reasons = [...this.getVisibleReasonsForCurrentUser()].sort((a, b) => a.order - b.order);
    if (reasons.length === 0) return null;

    const today = new Date();
    const dateKey = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');
    const seed = Array.from(dateKey).reduce((sum, char) => sum + char.charCodeAt(0), 0);

    return reasons[seed % reasons.length];
  }

  toggleReaction(id: string, type: ReasonReactionType): Reason | null {
    const user = this.auth.getCurrentUser();
    if (!user) return null;

    const reason = this.getReasonById(id);
    if (!reason || !this.canViewReason(reason)) return null;

    const reactions = reason.reactions ?? [];
    const hasReaction = reactions.some(
      reaction => reaction.userId === user.id && reaction.type === type
    );
    const updatedReactions = hasReaction
      ? reactions.filter(reaction => !(reaction.userId === user.id && reaction.type === type))
      : [
          ...reactions,
          {
            userId: user.id,
            type,
            createdAt: new Date().toISOString(),
          },
        ];

    if (!hasReaction) {
      this.pointsService.rewardReasonReaction();
    }

    return this.storage.updateReason(id, { reactions: updatedReactions });
  }

  hasReaction(reason: Reason, type: ReasonReactionType): boolean {
    const user = this.auth.getCurrentUser();
    if (!user) return false;

    return (reason.reactions ?? []).some(
      reaction => reaction.userId === user.id && reaction.type === type
    );
  }

  getReactionCount(reason: Reason, type: ReasonReactionType): number {
    return (reason.reactions ?? []).filter(reaction => reaction.type === type).length;
  }

  canViewReason(reason: Reason): boolean {
    return this.auth.isAdmin() || !reason.isSecret || this.isOwner(reason);
  }

  canEditReason(reason: Reason): boolean {
    return this.auth.isAdmin() || this.isOwner(reason);
  }

  private isOwner(reason: Reason): boolean {
    return reason.createdBy === this.currentUserId();
  }

  private currentUserId(): string {
    return this.auth.getCurrentUser()?.id ?? 'user-owner';
  }
}
