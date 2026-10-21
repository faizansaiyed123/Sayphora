import { randomBytes, scrypt, timingSafeEqual, createHash, type ScryptOptions } from 'node:crypto';

const KEY_LEN = 64;
const MAX_COST = 18;

function derive(password: string, salt: Buffer, cost: number): Promise<Buffer> {
  const N = 2 ** cost;
  const r = 8;
  const opts: ScryptOptions = { N, r, p: 1, maxmem: 256 * N * r };
  return new Promise((resolve, reject) => {
    scrypt(password.normalize('NFKC'), salt, KEY_LEN, opts, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

/** Hashes with scrypt. Stored format: scrypt$<log2N>$<salt b64>$<hash b64>. */
export async function hashPassword(password: string, cost = 15): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, cost);
  return `scrypt$${cost}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, costStr, saltB64, hashB64] = stored.split('$');
  const cost = Number(costStr);
  if (scheme !== 'scrypt' || !Number.isInteger(cost) || cost < 4 || cost > MAX_COST || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = await derive(password, Buffer.from(saltB64, 'base64'), cost);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

let dummyHash: Promise<string> | null = null;
/** Burns the same CPU as a real check so unknown emails are not detectable by timing. */
export async function verifyAgainstDummy(password: string, cost: number): Promise<void> {
  dummyHash ??= hashPassword('dummy-password-for-timing', cost);
  await verifyPassword(password, await dummyHash);
}

export function generateResetToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: sha256(token) };
}

export const sha256 = (v: string): string => createHash('sha256').update(v).digest('hex');
