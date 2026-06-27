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
  draft = '';
  isLoading = false;
  isSending = false;
  errorMessage = '';
  statusMessage = '';
  apiBaseUrl = environment.apiBaseUrl;
  myUserId: string | null = null;
  demoRepliesEnabled = true; // For local mode simulated responses
  partnerTyping = false;
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription = new Subscription();

    if (this.appMode.isLocalMode()) {
      this.myUserId = this.auth.getCurrentUser()?.id ?? 'user-owner';
      this.statusMessage = 'Local Demo Chat. Real partner sync requires API Mode.';
      this.subscription.add(
        this.localChat.messages$.subscribe(messages => {
          this.messages = messages;
          this.shouldScrollToBottom = true;
          this.cdr.detectChanges();
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

  sendMessage(): void {
    const body = this.draft.trim();
    if (!body || this.isSending) return;

    this.isSending = true;
    this.errorMessage = '';
    this.draft = ''; // Clear input immediately for better UX
    this.shouldScrollToBottom = true;

    if (this.appMode.isLocalMode()) {
      const myUser = this.auth.getCurrentUser();
      const senderName = myUser?.displayName ?? 'Partner A';
      this.localChat.addMessage(body, this.myUserId ?? 'user-owner', senderName);
      this.isSending = false;
      this.gamification.rewardChatMessage();

      if (this.demoRepliesEnabled) {
        this.triggerSimulatedReply();
      }
      return;
    }

    this.hub.sendMessage(body)
      .then(() => {
        this.isSending = false;
        this.gamification.rewardChatMessage();
      })
      .catch(() => {
        this.chatApi.sendMessage({ message: body }).subscribe({
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
    const delay = Math.floor(Math.random() * (1200 - 600 + 1)) + 600;

    setTimeout(() => {
      this.localChat.addMessage(replyBody, 'demo-partner', 'Demo Partner');
    }, delay);
  }

  retryLoad(): void {
    if (!this._apiToken) return;
    this.errorMessage = '';
    this.loadMessages();
    this.startHub(this._apiToken);
  }

  onEnterKey(event: Event): void {
    const keyEvent = event as KeyboardEvent;
    if (!keyEvent.shiftKey) {
      keyEvent.preventDefault();
      this.sendMessage();
    }
  }

  appendEmoji(emoji: string): void {
    this.draft += emoji;
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
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
        this.messages = messages.map(message => this.chatApi.toMessage(message));
        this.isLoading = false;
        this.shouldScrollToBottom = true;
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
    if (this.messages.some(item => item.id === message.id)) return;
    this.messages = [...this.messages, message];
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
