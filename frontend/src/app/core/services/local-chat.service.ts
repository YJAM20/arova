import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage } from './chat-api.service';

const LOCAL_CHAT_KEY = 'arova-local-chat-v1';

@Injectable({ providedIn: 'root' })
export class LocalChatService {
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();
  private channel: BroadcastChannel | null = null;

  constructor() {
    this.loadMessages();
    this.initSync();
  }

  private loadMessages(): void {
    const raw = localStorage.getItem(LOCAL_CHAT_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ChatMessage[];
        this.messagesSubject.next(parsed);
      } catch {
        this.messagesSubject.next([]);
      }
    } else {
      this.messagesSubject.next([]);
    }
  }

  private saveMessages(messages: ChatMessage[]): void {
    localStorage.setItem(LOCAL_CHAT_KEY, JSON.stringify(messages));
    this.messagesSubject.next(messages);
    this.broadcastSync();
  }

  getMessagesSync(): ChatMessage[] {
    return this.messagesSubject.value;
  }

  addMessage(body: string, senderUserId: string, senderDisplayName: string): ChatMessage {
    const messages = this.getMessagesSync();
    const newMessage: ChatMessage = {
      id: `local-chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderUserId,
      senderDisplayName,
      body,
      createdAt: new Date().toISOString(),
    };
    this.saveMessages([...messages, newMessage]);
    return newMessage;
  }

  clearMessages(): void {
    localStorage.removeItem(LOCAL_CHAT_KEY);
    this.messagesSubject.next([]);
    this.broadcastSync();
  }

  private initSync(): void {
    if (typeof window !== 'undefined') {
      // 1. BroadcastChannel sync for instant updates in other tabs
      if ('BroadcastChannel' in window) {
        this.channel = new BroadcastChannel('arova-local-chat');
        this.channel.onmessage = (event) => {
          if (event.data === 'sync-chat') {
            this.loadMessages();
          }
        };
      }

      // 2. Storage event listener as fallback
      window.addEventListener('storage', (event) => {
        if (event.key === LOCAL_CHAT_KEY) {
          this.loadMessages();
        }
      });
    }
  }

  private broadcastSync(): void {
    if (this.channel) {
      try {
        this.channel.postMessage('sync-chat');
      } catch {
        // ignore
      }
    }
  }
}
