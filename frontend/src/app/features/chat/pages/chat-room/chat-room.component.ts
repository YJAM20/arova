import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AppModeService } from '../../../../core/services/app-mode.service';
import { ChatApiService, ChatMessage } from '../../../../core/services/chat-api.service';
import { CoupleHubService } from '../../../../core/services/couple-hub.service';
import { TokenStorageService } from '../../../../core/services/token-storage.service';
import { AuthService } from '../../../../core/services/auth.service';
import { GamificationService } from '../../../../core/services/gamification.service';
import { LocalChatService } from '../../../../core/services/local-chat.service';
import { CryptoService } from '../../../../core/services/crypto.service';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;

  messages: ChatMessage[] = [];
  rawMessages: ChatMessage[] = [];
  draft = '';
  isLoading = false;
  isSending = false;
  errorMessage = '';
  statusMessage = '';
  apiBaseUrl = environment.apiBaseUrl;
  myUserId: string | null = null;
  demoRepliesEnabled = true; // For local mode simulated responses
  partnerTyping = false;

  // E2EE properties
  e2eePasscode = '';
  isE2eeUnlocked = false;
  e2eeError = '';
  showHelp = false;
  private derivedKey: CryptoKey | null = null;

  private subscription?: Subscription;
  private shouldScrollToBottom = false;
  private _apiToken: string | null = null;
  private typingTimeout: any = null;
  private isCurrentlyTyping = false;

  get canRetry(): boolean {
    return !!this._apiToken;
  }

  constructor(
    private appMode: AppModeService,
    private chatApi: ChatApiService,
    private hub: CoupleHubService,
    private tokenStorage: TokenStorageService,
    private auth: AuthService,
    private gamification: GamificationService,
    private localChat: LocalChatService,
    private crypto: CryptoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription = new Subscription();

    if (this.appMode.isLocalMode()) {
      this.myUserId = this.auth.getCurrentUser()?.id ?? 'user-owner';
      this.statusMessage = 'Local Demo Chat. Real partner sync requires API Mode.';
      this.subscription.add(
        this.localChat.messages$.subscribe(messages => {
          this.rawMessages = messages;
          this.decryptMessages().then(() => {
            this.shouldScrollToBottom = true;
            this.cdr.detectChanges();
          });
        })
      );
      return;
    }

    const token = this.tokenStorage.getToken();
    this._apiToken = token;
    if (!token) {
      this.errorMessage = 'Please login in API Mode first.';
      return;
    }

    this.myUserId = this.currentUserId();

    this.subscription.add(
      this.hub.messageReceived$.subscribe(message => {
        this.appendMessage(message);
        this.shouldScrollToBottom = true;
        this.cdr.detectChanges();
      })
    );

    this.subscription.add(
      this.hub.partnerTyping$.subscribe(isTyping => {
        this.partnerTyping = isTyping;
        this.cdr.detectChanges();
      })
    );

    this.loadMessages();
    this.startHub(token);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  onPasscodeChange(): void {
    if (!this.e2eePasscode.trim()) {
      this.derivedKey = null;
      this.isE2eeUnlocked = false;
      this.e2eeError = '';
      this.decryptMessages();
      return;
    }

    this.crypto.deriveKey(this.e2eePasscode.trim())
      .then(key => {
        this.derivedKey = key;
        this.isE2eeUnlocked = true;
        this.e2eeError = '';
        this.decryptMessages();
      })
      .catch(err => {
        console.error('Error deriving key', err);
        this.e2eeError = 'Failed to configure decryption key.';
      });
  }

  toggleE2eeHelp(): void {
    this.showHelp = !this.showHelp;
  }

  async decryptSingleMessage(message: ChatMessage): Promise<ChatMessage> {
    if (!message.body.startsWith('e2ee:')) {
      return message;
    }

    if (!this.derivedKey) {
      return { ...message, body: '🔒 [Encrypted Message - Enter Shared Secret Keyphrase to decrypt]' };
    }

    try {
      const plaintext = await this.crypto.decrypt(message.body, this.derivedKey);
      return { ...message, body: plaintext };
    } catch {
      return { ...message, body: '🔒 [Encrypted Message - Decryption failed (check keyphrase)]' };
    }
  }

  async decryptMessages(): Promise<void> {
    const mapped = [];
    for (const msg of this.rawMessages) {
      mapped.push(await this.decryptSingleMessage(msg));
    }
    this.messages = mapped;
    this.cdr.detectChanges();
  }

  sendMessage(): void {
    const body = this.draft.trim();
    if (!body || this.isSending) return;

    this.isSending = true;
    this.errorMessage = '';
    this.draft = ''; // Clear input immediately for better UX
    this.shouldScrollToBottom = true;

    const payloadPromise = this.isE2eeUnlocked && this.derivedKey
      ? this.crypto.encrypt(body, this.derivedKey)
      : Promise.resolve(body);

    payloadPromise.then(finalBody => {
      if (this.appMode.isLocalMode()) {
        const myUser = this.auth.getCurrentUser();
        const senderName = myUser?.displayName ?? 'Partner A';
        this.localChat.addMessage(finalBody, this.myUserId ?? 'user-owner', senderName);
        this.isSending = false;
        this.gamification.rewardChatMessage();

        if (this.demoRepliesEnabled) {
          this.triggerSimulatedReply();
        }
        return;
      }

      this.hub.sendMessage(finalBody)
        .then(() => {
          this.isSending = false;
          this.gamification.rewardChatMessage();
        })
        .catch(() => {
          this.chatApi.sendMessage({ message: finalBody }).subscribe({
            next: response => {
              this.appendMessage(this.chatApi.toMessage(response));
              this.isSending = false;
              this.shouldScrollToBottom = true;
              this.gamification.rewardChatMessage();
            },
            error: error => {
              this.errorMessage = this.toFriendlyError(error);
              this.isSending = false;
              // Restore draft if failed
              this.draft = body;
            },
          });
        });
    });
  }

  private triggerSimulatedReply(): void {
    const replies = [
      'I saved this in our little orbit.',
      'That feels like something we should remember.',
      'I’m here in the demo space with you.',
      'This is local-only, but it still feels alive.',
    ];

    const replyIndex = Math.floor(Math.random() * replies.length);
    const replyBody = replies[replyIndex];

    const replyPromise = this.isE2eeUnlocked && this.derivedKey
      ? this.crypto.encrypt(replyBody, this.derivedKey)
      : Promise.resolve(replyBody);

    replyPromise.then(finalReply => {
      setTimeout(() => {
        this.localChat.addMessage(finalReply, 'demo-partner', 'Demo Partner');
      }, 800);
    });
  }

  appendEmoji(emoji: string): void {
    this.draft += emoji;
  }

  onEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  retryLoad(): void {
    this.loadMessages();
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleString([], {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get connectionStatus(): 'connected' | 'connecting' | 'offline' | 'local' {
    if (this.appMode.isLocalMode()) return 'local';
    if (this.statusMessage.toLowerCase().includes('connected')) return 'connected';
    if (this.statusMessage.toLowerCase().includes('connecting')) return 'connecting';
    if (this.errorMessage || !this.statusMessage) return 'offline';
    return 'connecting';
  }

  get statusLabel(): string {
    switch (this.connectionStatus) {
      case 'local': return 'Local Mode';
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting';
      case 'offline': return 'Offline';
    }
  }

  private loadMessages(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.chatApi.getMessages().subscribe({
      next: messages => {
        this.rawMessages = messages.map(message => this.chatApi.toMessage(message));
        this.decryptMessages().then(() => {
          this.isLoading = false;
          this.shouldScrollToBottom = true;
        });
      },
      error: error => {
        this.errorMessage = this.toFriendlyError(error);
        this.isLoading = false;
      },
    });
  }

  private startHub(token: string): void {
    this.statusMessage = 'Connecting live chat...';
    this.hub.start(token)
      .then(() => {
        this.statusMessage = 'Live chat connected.';
        this.shouldScrollToBottom = true;
      })
      .catch(error => {
        this.statusMessage = '';
        this.errorMessage = error instanceof Error
          ? error.message
          : `Backend is not reachable. Make sure ${this.apiBaseUrl} is running.`;
      });
  }

  private appendMessage(message: ChatMessage): void {
    if (!message.body.trim()) return;
    if (this.rawMessages.some(item => item.id === message.id)) return;
    this.rawMessages = [...this.rawMessages, message];
    this.decryptSingleMessage(message).then(decrypted => {
      this.messages = [...this.messages, decrypted];
      this.cdr.detectChanges();
    });
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      try {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      } catch (err) {
        // Safe catch
      }
    }
  }

  private currentUserId(): string | null {
    const token = this.tokenStorage.getToken();
    if (!token) return null;
    try {
      const segment = token.split('.')[1];
      if (!segment) return null;
      const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))) as Record<string, unknown>;
      return String(payload['sub'] ?? payload['nameid'] ?? payload['userId'] ?? payload['id']);
    } catch {
      return null;
    }
  }

  private toFriendlyError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'The chat request failed. Please try again.';
    }

    if (error.status === 0) return `Backend is not reachable. Make sure ${this.apiBaseUrl} is running.`;
    if (error.status === 401) return 'Please login in API Mode first.';
    if (error.status === 403) return 'You do not have permission for this action.';
    if (error.status === 404) return 'Item not found.';
    if (error.status === 400) return this.extractServerMessage(error) ?? 'The backend rejected this message.';

    return this.extractServerMessage(error) ?? `Chat request failed with status ${error.status}.`;
  }

  private extractServerMessage(error: HttpErrorResponse): string | null {
    if (typeof error.error === 'string' && error.error.trim()) return error.error;
    if (typeof error.error === 'object' && error.error) {
      if ('message' in error.error) return String(error.error['message']);
      if ('title' in error.error) return String(error.error['title']);
    }

    return null;
  }

  onTyping(): void {
    if (this.appMode.isLocalMode()) return;

    if (!this.isCurrentlyTyping) {
      this.isCurrentlyTyping = true;
      this.hub.sendTypingState(true);
    }

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    this.typingTimeout = setTimeout(() => {
      this.isCurrentlyTyping = false;
      this.hub.sendTypingState(false);
    }, 3000);
  }
}
