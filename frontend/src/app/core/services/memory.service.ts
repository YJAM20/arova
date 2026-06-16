import { Injectable } from '@angular/core';
import { Memory } from '../../shared/models/memory.model';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

import { RelationshipPointsService } from './relationship-points.service';

export type MemoryInput = Omit<Memory, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;

@Injectable({ providedIn: 'root' })
export class MemoryService {
  constructor(
    private storage: StorageService,
    private auth: AuthService,
    private pointsService: RelationshipPointsService
  ) {}

  getMemories(): Memory[] {
    return this.storage.getMemories();
  }

  getMemoryById(id: string): Memory | null {
    return this.getMemories().find(memory => memory.id === id) ?? null;
  }

  getVisibleMemoriesForCurrentUser(): Memory[] {
    const memories = this.getMemories();
    return this.auth.isAdmin()
      ? memories
      : memories.filter(memory => memory.visibleToPartner || this.isOwner(memory));
  }

  addMemory(input: MemoryInput): Memory {
    const memory = this.storage.addMemory({ ...input, createdBy: this.currentUserId() });
    this.pointsService.rewardMemoryCreated();
    return memory;
  }

  updateMemory(id: string, changes: Partial<Memory>): Memory | null {
    const memory = this.getMemoryById(id);
    if (!memory || !this.canEditMemory(memory)) return null;
    return this.storage.updateMemory(id, changes);
  }

  deleteMemory(id: string): boolean {
    const memory = this.getMemoryById(id);
    if (!memory || !this.canEditMemory(memory)) return false;
    return this.storage.deleteMemory(id);
  }

  toggleFavorite(id: string): Memory | null {
    const memory = this.getMemoryById(id);
    if (!memory || !this.canViewMemory(memory)) return null;
    return this.storage.toggleMemoryFavorite(id);
  }

  canViewMemory(memory: Memory): boolean {
    return this.auth.isAdmin() || memory.visibleToPartner || this.isOwner(memory);
  }

  canEditMemory(memory: Memory): boolean {
    return this.auth.isAdmin() || this.isOwner(memory);
  }

  private isOwner(memory: Memory): boolean {
    return memory.createdBy === this.currentUserId();
  }

  private currentUserId(): string {
    return this.auth.getCurrentUser()?.id ?? 'user-owner';
  }
}
