import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CryptoService {

  private bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    const chunkSize = 0x8000; // 32KB chunks
    for (let i = 0; i < len; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return btoa(binary);
  }

  private base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  async deriveKey(passcode: string, salt: string = 'arova-static-nebula-salt'): Promise<CryptoKey> {
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
        salt: enc.encode(salt),
        iterations: 600000,
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
    const ciphertextBase64 = this.bytesToBase64(new Uint8Array(encryptedBuffer));

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
    const ciphertext = this.base64ToBytes(ciphertextBase64);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext as any
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  }
}
