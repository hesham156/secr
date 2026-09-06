import "server-only";
import bcrypt from "bcryptjs";

const BCRYPT_COST = 12;

export async function hashLoginPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyLoginPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
