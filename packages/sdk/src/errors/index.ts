export class IntelliGateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IntelliGateError';
  }
}

export class TransportError extends IntelliGateError {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'TransportError';
  }
}

export class HTTPError extends IntelliGateError {
  constructor(public readonly status: number, message: string, public readonly responseBody?: any) {
    super(`HTTP ${status}: ${message}`);
    this.name = 'HTTPError';
  }
}

export class SDKError extends IntelliGateError {
  constructor(message: string) {
    super(message);
    this.name = 'SDKError';
  }
}
