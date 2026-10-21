import { SignJWT, jwtVerify } from 'jose';

export interface SessionClaims {
  userId: string;
  tokenVersion: number;
}

export interface TokenService {
  sign(claims: SessionClaims): Promise<string>;
  verify(token: string): Promise<SessionClaims | null>;
}

const ISSUER = 'sayphora';

export function createTokenService(secret: string, ttlDays: number): TokenService {
  const key = new TextEncoder().encode(secret);
  return {
    sign: ({ userId, tokenVersion }) =>
      new SignJWT({ tv: tokenVersion })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(userId)
        .setIssuer(ISSUER)
        .setIssuedAt()
        .setExpirationTime(`${ttlDays}d`)
        .sign(key),
    async verify(token) {
      try {
        const { payload } = await jwtVerify(token, key, { issuer: ISSUER, algorithms: ['HS256'] });
        if (!payload.sub || typeof payload.tv !== 'number') return null;
        return { userId: payload.sub, tokenVersion: payload.tv };
      } catch {
        return null;
      }
    }
  };
}
