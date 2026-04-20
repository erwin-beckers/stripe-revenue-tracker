/**
 * AES-256-GCM encryption for per-user secrets (Stripe keys etc.) stored in Supabase.
 *
 * Key comes from FACTORY_ENCRYPTION_KEY env var — 64 hex chars = 32 bytes.
 * Never rotate the key without re-encrypting every row that uses it.
 *
 * Output format: <iv_hex>:<authtag_hex>:<ciphertext_hex>
 */
import "server-only";
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

function key(): Buffer {
  const hex = process.env.FACTORY_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("FACTORY_ENCRYPTION_KEY missing or not 64 hex chars (32 bytes)");
  }
  return Buffer.from(hex, "hex");
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSecret(payload: string): string {
  const [ivHex, tagHex, ctHex] = payload.split(":");
  if (!ivHex || !tagHex || !ctHex) throw new Error("malformed encrypted payload");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ctHex, "hex")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

/** Mask a Stripe key for display: rk_live_abc..xyz */
export function maskStripeKey(key: string): string {
  if (key.length < 16) return "*".repeat(key.length);
  return `${key.slice(0, 8)}…${key.slice(-6)}`;
}
