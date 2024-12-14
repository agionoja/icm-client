import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { envConfig } from "~/env-config";

const ENCRYPTION_ALGORITHM = "aes-256-cbc";
const SECRET_KEY = envConfig.SESSION_SECRET;
const IV_LENGTH = 16;

function getKey() {
  return Buffer.from(SECRET_KEY, "utf8").subarray(0, 32);
}

/**
 * Encrypts the given data using AES-256-CBC.
 * @param data - The data to encrypt.
 * @returns A string containing the IV and the encrypted data, separated by a dot.
 */
export async function encrypt<T>(data: T): Promise<string | null> {
  try {
    const iv = await promisify(randomBytes)(IV_LENGTH);
    const cipher = createCipheriv(ENCRYPTION_ALGORITHM, getKey(), iv);

    const serializedData = JSON.stringify(data);
    const encrypted = Buffer.concat([
      cipher.update(serializedData, "utf8"),
      cipher.final(),
    ]);

    return `${iv.toString("hex")}.${encrypted.toString("hex")}`;
  } catch (error) {
    console.error("Encryption failed:", error);
    return null;
  }
}

/**
 * Decrypts the given encrypted data string.
 * @param encryptedData - The encrypted string to decrypt.
 * @returns The original data if successful, or null if decryption fails.
 */
export function decrypt<T>(encryptedData: string): T | null {
  try {
    const [ivHex, encryptedHex] = encryptedData.split(".");

    if (!ivHex || !encryptedHex) {
      console.error("Decryption failed: Invalid encrypted data format");
      return null;
    }

    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, getKey(), iv);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString("utf8")) as T;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}
