// tokenManager.ts
import fs from "fs/promises";
import path from "path";

const TEMP_DIR = path.join(process.cwd(), "temp");
const LOAD_TEST_DIR = path.join(TEMP_DIR, "load");
const TOKEN_DIR = path.join(LOAD_TEST_DIR, "token");
const TOKEN_FILE = path.join(TOKEN_DIR, "access_token");

// Ensure directories exist
async function ensureDirectories(): Promise<void> {
  try {
    await fs.mkdir(TOKEN_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating directories:", error);
    throw error;
  }
}

export async function storeToken(token: string): Promise<void> {
  try {
    await ensureDirectories();
    await fs.writeFile(TOKEN_FILE, token, "utf8");
    console.log("Token stored successfully in temp/load/token/access_token");
  } catch (error) {
    console.error("Error storing token:", error);
    throw error;
  }
}

export async function getStoredToken(): Promise<string | null> {
  try {
    return await fs.readFile(TOKEN_FILE, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log("No stored token found in temp/load/token/access_token");
      return null;
    }
    console.error("Error reading token:", error);
    throw error;
  }
}
