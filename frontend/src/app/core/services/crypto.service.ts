import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CryptoService {
  private readonly salt = 'arova-static-nebula-salt';

  async deriveKey(passcode: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(passcode),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode(this.salt),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(plaintext: string, key: CryptoKey): Promise<string> {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plaintext)
    );

    const ivBase64 = btoa(String.fromCharCode(...iv));
    const ciphertextBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));

    return `e2ee:${ivBase64}:${ciphertextBase64}`;
  }

  async decrypt(encryptedMessage: string, key: CryptoKey): Promise<string> {
    if (!encryptedMessage.startsWith('e2ee:')) {
      return encryptedMessage;
    }

    const parts = encryptedMessage.split(':');
    if (parts.length !== 3) {
      throw new Error('Malformed encrypted message format');
    }

    const ivBase64 = parts[1];
    const ciphertextBase64 = parts[2];

    const iv = new Uint8Array(
      atob(ivBase64)
        .split('')
        .map(c => c.charCodeAt(0))
    );
    const ciphertext = new Uint8Array(
      atob(ciphertextBase64)
        .split('')
        .map(c => c.charCodeAt(0))
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  }
}
