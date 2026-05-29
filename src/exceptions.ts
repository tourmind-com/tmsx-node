/**
 * TMSX SDK exception hierarchy.
 *
 * The TMSX API signals failures via an `Error` envelope inside an HTTP 200 response,
 * not via HTTP status codes. The SDK translates that envelope into language-native
 * exceptions so callers can `try/catch` like any other library.
 */

export class TMSXError extends Error {
  readonly code: string | undefined;
  readonly transactionId: string | undefined;

  constructor(message: string, options?: { code?: string; transactionId?: string }) {
    super(message);
    this.name = 'TMSXError';
    this.code = options?.code;
    this.transactionId = options?.transactionId;
  }

  toString(): string {
    const parts: string[] = [];
    if (this.code) parts.push(`[ErrorCode=${this.code}]`);
    parts.push(this.message);
    if (this.transactionId) parts.push(`(TransactionID=${this.transactionId})`);
    return parts.join(' ');
  }
}

export class TMSXAuthError extends TMSXError {
  constructor(message: string, options?: { code?: string; transactionId?: string }) {
    super(message, options);
    this.name = 'TMSXAuthError';
  }
}

export class TMSXValidationError extends TMSXError {
  constructor(message: string, options?: { code?: string; transactionId?: string }) {
    super(message, options);
    this.name = 'TMSXValidationError';
  }
}

export class TMSXClientError extends TMSXError {
  constructor(message: string, options?: { code?: string; transactionId?: string }) {
    super(message, options);
    this.name = 'TMSXClientError';
  }
}

/**
 * Construct the most-specific exception class for an `Error.ErrorCode`.
 * See `https://github.com/tourmind-com/tmsx-platform/blob/main/AUTH.md` for the error-code table.
 */
export function fromErrorCode(
  code: string | undefined,
  message: string,
  transactionId?: string,
): TMSXError {
  const opts = { code, transactionId };
  if (code === '101' || code === '102' || code === '103') {
    return new TMSXValidationError(message, opts);
  }
  if (code === '105') {
    return new TMSXAuthError(message, opts);
  }
  return new TMSXError(message, opts);
}
