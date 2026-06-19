import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AppModeService } from '../../../../core/services/app-mode.service';
import { ChatApiService, ChatMessage } from '../../../../core/services/chat-api.service';
import { CoupleHubService } from '../../../../core/services/couple-hub.service';
import { TokenStorageService } from '../../../../core/services/token-storage.service';
import { AuthService } from '../../../../core/services/auth.service';
import { RelationshipPointsService } from '../../../../core/services/relationship-points.service';

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
  private subscription?: Subscription;
  private shouldScrollToBottom = false;
  private _apiToken: string | null = null;

  get canRetry(): boolean {
    return !!this._apiToken;
  }

  constructor(
    private appMode: AppModeService,
    private chatApi: ChatApiService,
    private hub: CoupleHubService,
    private tokenStorage: TokenStorageService,
    private auth: AuthService,
    private pointsService: RelationshipPointsService
  ) {}

  ngOnInit(): void {
    if (this.appMode.isLocalMode()) {
      this.statusMessage = 'Chat requires API Mode.';
      return;
    }

    const token = this.tokenStorage.getToken();
    this._apiToken = token;
    if (!token) {
      this.errorMessage = 'Please login in API Mode first.';
      return;
    }

    this.myUserId = this.currentUserId();
    this.subscription = this.hub.messageReceived$.subscribe(message => {
      this.appendMessage(message);
      this.shouldScrollToBottom = true;
    });
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
    this.subscription?.unsubscribe();
    void this.hub.stop();
  }

  sendMessage(): void {
    const body = this.draft.trim();
    if (!body || this.isSending || this.appMode.isLocalMode()) return;

    this.isSending = true;
    this.errorMessage = '';
    this.draft = ''; // Clear input immediately for better UX
    this.shouldScrollToBottom = true;

    this.hub.sendMessage(body)
      .then(() => {
        this.isSending = false;
        this.pointsService.rewardChatMessage();
      })
      .catch(() => {
        this.chatApi.sendMessage({ message: body }).subscribe({
          next: response => {
            this.appendMessage(this.chatApi.toMessage(response));
            this.isSending = false;
            this.shouldScrollToBottom = true;
            this.pointsService.rewardChatMessage();
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
}
