/**
 * TMSX dual-channel auth middleware for openapi-fetch.
 *
 * Injects:
 *   - HTTP headers: X-Agent-Code, X-Username
 *   - JSON body envelope: RequestHeader { AgentCode, UserName, Password, RequestTime, TransactionID }
 *
 * Callers never construct a RequestHeader themselves — that boilerplate is invisible.
 */

import type { Middleware } from 'openapi-fetch';

export interface AuthConfig {
  agentCode: string;
  username: string;
  password: string;
}

function isoNow(): string {
  const now = new Date();
  // 2026-05-27T10:00:00.123Z — millisecond precision, trailing Z.
  return now.toISOString();
}

function newTransactionId(): string {
  // Cheap UUIDv4. Avoids requiring node:crypto so this works in browsers + workers.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID.
  const random = (b: number) => Math.floor(Math.random() * b).toString(16).padStart(b === 16 ? 1 : 2, '0');
  return `${random(16)}${random(16)}${random(16)}${random(16)}-${random(16)}${random(16)}-4${random(16)}${random(16)}${random(16)}-${random(16)}${random(16)}${random(16)}-${[...Array(12)].map(() => random(16)).join('')}`;
}

function buildRequestHeader(config: AuthConfig): Record<string, string> {
  return {
    AgentCode: config.agentCode,
    UserName: config.username,
    Password: config.password,
    RequestTime: isoNow(),
    TransactionID: newTransactionId(),
  };
}

/**
 * openapi-fetch middleware. Runs on every request, mutates headers + body to
 * inject the TMSX auth scheme. No-op for non-JSON bodies.
 */
export function createAuthMiddleware(config: AuthConfig): Middleware {
  return {
    async onRequest({ request }) {
      const headers = new Headers(request.headers);
      headers.set('X-Agent-Code', config.agentCode);
      headers.set('X-Username', config.username);

      const contentType = headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        return new Request(request, { headers });
      }
      let body: unknown;
      try {
        const raw = await request.clone().text();
        body = raw ? JSON.parse(raw) : {};
      } catch {
        return new Request(request, { headers });
      }
      if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        return new Request(request, { headers });
      }
      const bodyObj = body as Record<string, unknown>;
      if (!bodyObj.RequestHeader) {
        bodyObj.RequestHeader = buildRequestHeader(config);
      }
      const newBody = JSON.stringify(bodyObj);
      headers.set('content-length', String(new TextEncoder().encode(newBody).byteLength));
      return new Request(request, { headers, body: newBody });
    },
  };
}
