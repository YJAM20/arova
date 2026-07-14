# Design Spec: End-to-End Encryption (E2EE) Chat Support

**Date**: 2026-07-12  
**Author**: Antigravity  
**Status**: Approved (User approved the conceptual design and delegated full implementation details)

---

## 1. Goal Description

This design details the implementation of true client-side **End-to-End Encryption (E2EE)** for Arova's Private Chat. By using the Web Crypto API, messages are encrypted using 256-bit AES-GCM on the sender's device before being transmitted over SignalR or stored in the database. The database and backend API act as blind relays, storing only cryptographically secure ciphertext.

---

## 2. Cryptographic Protocol Design

We will derive a symmetric encryption key from a user-supplied shared secret keyphrase.

### Key Derivation Flow (PBKDF2)
1. **Material**: Import the plaintext secret keyphrase as a raw key material.
2. **Salt**: Use a cryptographically random per-couple 16-byte (128-bit) salt that is persisted in the database.
   - **Generation**: Generated on the client or server via cryptographically secure random number generators when the couple's chat is initialized.
   - **Retrieval**: Fetched dynamically by both partners from the backend (Base64-encoded) via the relationship/chat metadata endpoint when loading the chat room. The client decodes the salt to a binary format.
3. **Derivation**: Use PBKDF2 with 600,000 iterations of SHA-256 (the hardware-benchmarked cost recommended by OWASP for secure browser-side derivation) to derive a 256-bit AES-GCM key.

```
Keyphrase string -> TextEncoder -> Raw Key Material
                                        |
                             PBKDF2 (600,000 iter, SHA-256)
                             Salt: Base64-decoded per-couple salt
                                        |
                                        v
                               256-bit AES-GCM Key
```

### Encryption Flow (AES-GCM)
1. Generate a random 12-byte initialization vector (IV).
2. Encrypt the plaintext message body using `AES-GCM` with the derived key and IV.
3. Encode the IV and ciphertext into Base64 format.
4. Format the final transmitted payload as:
   `e2ee:<IV_BASE64>:<CIPHERTEXT_BASE64>`

### Decryption Flow (AES-GCM)
1. Check if the message starts with `e2ee:`. If not, treat as a legacy unencrypted message and display directly.
2. Extract `<IV_BASE64>` and `<CIPHERTEXT_BASE64>`.
3. Decode them back to binary arrays.
4. Decrypt using the derived `AES-GCM` key and IV.
5. If decryption fails (e.g. wrong keyphrase), display a locked placeholder:
   `🔒 [Encrypted Message - Enter correct keyphrase to decrypt]`

---

## 3. Proposed Changes

### Frontend: Arova Client

#### [NEW] [crypto.service.ts](file:///c:/Dev/Arova/frontend/src/app/core/services/crypto.service.ts)
- Create a standalone Angular service managing Web Crypto API key derivation, encryption, and decryption.

#### [MODIFY] [chat-room.component.ts](file:///c:/Dev/Arova/frontend/src/app/features/chat/pages/chat-room/chat-room.component.ts)
- Integrate `CryptoService`.
- Maintain active `e2eePasscode` and `derivedKey` state.
- Intercept outbound messages to encrypt them if E2EE is active.
- Intercept incoming/loaded messages to decrypt them inline.

#### [MODIFY] [chat-room.component.html](file:///c:/Dev/Arova/frontend/src/app/features/chat/pages/chat-room/chat-room.component.html)
- Add a security panel allowing couples to enter their keyphrase and view E2EE connection states.
- Clean up outdated footer and disclosure warnings indicating E2EE is "planned but not active".

#### [NEW] [chat-room-e2ee.css](file:///c:/Dev/Arova/frontend/src/app/features/chat/pages/chat-room/chat-room-e2ee.css) or update styles
- Add style definitions for the E2EE control panel.

---

## 4. Verification Plan

### Automated Verification
- Run frontend Vitest specs (`npx ng test`) to make sure all Angular tests compile and execute correctly.
- Add test assertions to verify `CryptoService` performs accurate round-trip encryption/decryption.
