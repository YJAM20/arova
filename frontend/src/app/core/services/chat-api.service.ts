import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  id: string;
  senderUserId?: string;
  senderDisplayName?: string;
  body: string;
  createdAt: string;
}

export interface ChatMessageApiResponse {
  id?: string;
  senderUserId?: string;
  senderDisplayName?: string;
  userId?: string;
  displayName?: string;
  body?: string | null;
  message?: string | null;
  content?: string | null;
  createdAt?: string;
}

export interface SendChatMessageRequest {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ChatApiService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  getMessages(): Observable<ChatMessageApiResponse[]> {
    return this.http.get<ChatMessageApiResponse[]>(`${this.apiBaseUrl}/api/chat/messages`);
  }

  sendMessage(request: SendChatMessageRequest): Observable<ChatMessageApiResponse> {
    return this.http.post<ChatMessageApiResponse>(`${this.apiBaseUrl}/api/chat/messages`, request);
  }

  toMessage(response: ChatMessageApiResponse): ChatMessage {
    const body = response.body ?? response.message ?? response.content ?? '';
    const createdAt = response.createdAt ?? new Date().toISOString();

    return {
      id: response.id ?? `chat-${createdAt}-${body.slice(0, 12)}`,
      senderUserId: response.senderUserId ?? response.userId,
      senderDisplayName: response.senderDisplayName ?? response.displayName,
      body,
      createdAt,
    };
  }
}
