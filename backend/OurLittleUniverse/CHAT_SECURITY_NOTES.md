# Chat Security Notes

## Current State

Arova chat is:

- JWT protected.
- Scoped to the user's active couple.
- Broadcast only to the SignalR group for that couple.
- Stored through safe DTO/service paths.
- Ready for text, emoji, image metadata, and system messages.

## Encryption-Ready Fields

Chat messages include fields for:

- `EncryptionMode`
- `EncryptedPayload`
- `Nonce`
- `KeyId`
- Attachment URL and metadata

These fields prepare the backend for future encrypted chat, but they do not implement true end-to-end encryption by themselves.

## E2EE Roadmap

Do not market Arova chat as E2EE until all of these exist:

- Client-side WebCrypto encryption.
- Client-side key generation and storage.
- Backend stores ciphertext only.
- Key rotation and recovery design.
- Encrypted media upload and download flow.

For now, the correct description is:

```text
Secure couple-scoped chat with encryption-ready fields.
```
