import { TestBed } from '@angular/core/testing';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CryptoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should successfully encrypt and decrypt a message', async () => {
    const passcode = 'my-shared-couple-passcode-phrase';
    const plaintext = 'This is a super secure private note.';

    const key = await service.deriveKey(passcode);
    expect(key).toBeTruthy();

    const encrypted = await service.encrypt(plaintext, key);
    expect(encrypted.startsWith('e2ee:')).toBe(true);

    const decrypted = await service.decrypt(encrypted, key);
    expect(decrypted).toBe(plaintext);
  });

  it('should return plain text if not E2EE prefixed', async () => {
    const passcode = 'my-shared-couple-passcode-phrase';
    const originalText = 'Legacy unencrypted message';
    const key = await service.deriveKey(passcode);

    const decrypted = await service.decrypt(originalText, key);
    expect(decrypted).toBe(originalText);
  });

  it('should throw an error for decryption if wrong key is provided', async () => {
    const keyphrase1 = 'correctphrase';
    const keyphrase2 = 'wrongphrase';
    const plaintext = 'Secret data';

    const key1 = await service.deriveKey(keyphrase1);
    const key2 = await service.deriveKey(keyphrase2);

    const encrypted = await service.encrypt(plaintext, key1);

    await expect(service.decrypt(encrypted, key2)).rejects.toThrow();
  });

  it('should derive different keys for different salts with the same passcode', async () => {
    const passcode = 'myphrase';
    const key1 = await service.deriveKey(passcode, 'couple-1-salt');
    const key2 = await service.deriveKey(passcode, 'couple-2-salt');

    const plaintext = 'Hello';
    const encrypted = await service.encrypt(plaintext, key1);
    await expect(service.decrypt(encrypted, key2)).rejects.toThrow();
  });
});
