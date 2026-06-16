import { Injectable } from '@angular/core';
import { CoupleProfile } from '../../shared/models/couple-profile.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class CoupleProfileService {
  constructor(private storage: StorageService) {}

  getProfile(): CoupleProfile {
    return this.storage.getCoupleProfile();
  }

  saveProfile(changes: Partial<CoupleProfile>): CoupleProfile {
    return this.storage.updateCoupleProfile({
      coupleSpaceName: this.clean(changes.coupleSpaceName) ?? 'Arova Space',
      partnerADisplayName: this.clean(changes.partnerADisplayName) ?? 'Partner A',
      partnerBDisplayName: this.clean(changes.partnerBDisplayName) ?? 'Partner B',
      importantDate: this.clean(changes.importantDate),
      favoriteSharedActivity: this.clean(changes.favoriteSharedActivity),
      relationshipIntention: this.clean(changes.relationshipIntention),
    });
  }

  private clean(value: string | undefined): string | undefined {
    const trimmed = value?.trim() ?? '';
    return trimmed.length > 0 ? trimmed : undefined;
  }
}
