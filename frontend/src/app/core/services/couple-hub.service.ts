import { Injectable } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatApiService, ChatMessage, ChatMessageApiResponse } from './chat-api.service';

export interface PartnerPresence {
  userId: string;
  displayName: string;
  isOnline: boolean;
  activeSpace?: string;
  lastSeenAt: string;
}

@Injectable({ providedIn: 'root' })
export class CoupleHubService {
  private connection: HubConnection | null = null;
  private readonly receivedSubject = new Subject<ChatMessage>();
  messageReceived$ = this.receivedSubject.asObservable();

  private readonly partnerPresenceSubject = new BehaviorSubject<PartnerPresence | null>(null);
  partnerPresence$ = this.partnerPresenceSubject.asObservable();

  private readonly partnerActiveSpaceSubject = new BehaviorSubject<string | null>(null);
  partnerActiveSpace$ = this.partnerActiveSpaceSubject.asObservable();

  private readonly partnerTypingSubject = new BehaviorSubject<boolean>(false);
  partnerTyping$ = this.partnerTypingSubject.asObservable();

  private readonly pointsAwardedSubject = new Subject<any>();
  pointsAwarded$ = this.pointsAwardedSubject.asObservable();

  private readonly streakMilestoneSubject = new Subject<any>();
  streakMilestone$ = this.streakMilestoneSubject.asObservable();

  private readonly rankChangedSubject = new Subject<any>();
  rankChanged$ = this.rankChangedSubject.asObservable();

  private lastActiveSpace: string | null = null;

  constructor(private chatApi: ChatApiService) {}

  async start(token: string): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) return;

    await this.stop();

    const baseUrl = environment.apiBaseUrl.replace(/\/$/, '');
    const url = `${baseUrl}/hubs/couple?access_token=${encodeURIComponent(token)}`;
    this.connection = new HubConnectionBuilder()
      .withUrl(url, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.connection.on('ReceiveMessage', (message: ChatMessageApiResponse | string) => {
      if (typeof message === 'string') {
        this.receivedSubject.next({
          id: `chat-${Date.now().toString(36)}`,
          body: message,
          createdAt: new Date().toISOString(),
        });
        return;
      }

      this.receivedSubject.next(this.chatApi.toMessage(message));
    });

    this.connection.on('partnerOnline', (presence: PartnerPresence) => {
      this.partnerPresenceSubject.next(presence);
      if (presence.activeSpace) {
        this.partnerActiveSpaceSubject.next(presence.activeSpace);
      }
    });

    this.connection.on('partnerOffline', (presence: PartnerPresence) => {
      this.partnerPresenceSubject.next(presence);
      this.partnerActiveSpaceSubject.next(null);
    });

    this.connection.on('partnerViewingSpace', (presence: PartnerPresence) => {
      this.partnerPresenceSubject.next(presence);
      if (presence.activeSpace) {
        this.partnerActiveSpaceSubject.next(presence.activeSpace);
      }
    });

    this.connection.on('partnerTyping', (userId: string, isTyping: boolean) => {
      this.partnerTypingSubject.next(isTyping);
    });

    this.connection.on('pointsAwarded', (payload: any) => {
      this.pointsAwardedSubject.next(payload);
    });

    this.connection.on('streakMilestone', (payload: any) => {
      this.streakMilestoneSubject.next(payload);
    });

    this.connection.on('rankChanged', (payload: any) => {
      this.rankChangedSubject.next(payload);
    });

    this.connection.onreconnected(() => {
      if (this.lastActiveSpace) {
        this.sendActiveSpace(this.lastActiveSpace);
      }
    });

    await this.connection.start();
  }

  sendActiveSpace(spaceName: string): void {
    this.lastActiveSpace = spaceName;
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      return;
    }
    this.connection.invoke('SendActiveSpace', spaceName).catch(err => {
      console.warn('Failed to send active space', err);
    });
  }

  sendTypingState(isTyping: boolean): void {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      return;
    }
    this.connection.invoke('SendTypingState', isTyping).catch(err => {
      console.warn('Failed to send typing state', err);
    });
  }

  async sendMessage(body: string): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error('Chat connection is not ready.');
    }

    await this.connection.invoke('SendMessage', body);
  }

  async stop(): Promise<void> {
    if (!this.connection) return;

    const connection = this.connection;
    this.connection = null;
    await connection.stop();
  }

  get isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }
}
