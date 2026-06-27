import { TestBed } from '@angular/core/testing';
import { LocalChatService } from './local-chat.service';

describe('LocalChatService', () => {
  let service: LocalChatService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalChatService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store and retrieve messages', () => {
    const msg = service.addMessage('Hello local', 'user-owner', 'Partner A');
    expect(msg.body).toBe('Hello local');
    expect(msg.senderUserId).toBe('user-owner');

    const messages = service.getMessagesSync();
    expect(messages.length).toBe(1);
    expect(messages[0].body).toBe('Hello local');
  });

  it('should clear messages', () => {
    service.addMessage('Hello local', 'user-owner', 'Partner A');
    service.clearMessages();
    expect(service.getMessagesSync().length).toBe(0);
  });
});
