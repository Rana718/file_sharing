const KEY_LENGTH_BYTES = 32;
const IV_LENGTH_BYTES = 12;

const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const hexToBytes = (hex: string): Uint8Array => {
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex length");
  }

  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }

  return out;
};

const generateEncryptionKeyHex = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(KEY_LENGTH_BYTES));
  return bytesToHex(bytes);
};

const isValidEncryptionKeyHex = (value: string): boolean => {
  return /^[0-9a-f]{64}$/i.test(value);
};

const importAesKey = async (keyHex: string): Promise<CryptoKey> => {
  const normalized = keyHex.toLowerCase();
  if (!isValidEncryptionKeyHex(normalized)) {
    throw new Error("Invalid key");
  }

  const keyBytes = hexToBytes(normalized);
  return crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
};

const encryptChunk = async (
  plainBytes: Uint8Array,
  keyHex: string,
): Promise<Uint8Array> => {
  const key = await importAesKey(keyHex);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plainBytes,
  );

  const cipherBytes = new Uint8Array(cipherBuffer);
  const payload = new Uint8Array(IV_LENGTH_BYTES + cipherBytes.length);
  payload.set(iv, 0);
  payload.set(cipherBytes, IV_LENGTH_BYTES);
  return payload;
};

const decryptChunk = async (
  encryptedBytes: Uint8Array,
  keyHex: string,
): Promise<Uint8Array> => {
  if (encryptedBytes.length <= IV_LENGTH_BYTES) {
    throw new Error("Encrypted payload is too small");
  }

  const key = await importAesKey(keyHex);
  const iv = encryptedBytes.slice(0, IV_LENGTH_BYTES);
  const cipherBytes = encryptedBytes.slice(IV_LENGTH_BYTES);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipherBytes,
  );

  return new Uint8Array(plainBuffer);
};

export {
  generateEncryptionKeyHex,
  isValidEncryptionKeyHex,
  encryptChunk,
  decryptChunk,
};
