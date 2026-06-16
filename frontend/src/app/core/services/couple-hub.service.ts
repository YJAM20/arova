import { Injectable } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatApiService, ChatMessage, ChatMessageApiResponse } from './chat-api.service';

@Injectable({ providedIn: 'root' })
export class CoupleHubService {
  private connection: HubConnection | null = null;
  private readonly receivedSubject = new Subject<ChatMessage>();
  messageReceived$ = this.receivedSubject.asObservable();

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

    await this.connection.start();
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
