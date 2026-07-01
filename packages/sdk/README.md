# @intelligate/sdk

The official TypeScript/JavaScript SDK for IntelliGate.

## Installation

```bash
npm install @intelligate/sdk
```

## Usage

```typescript
import { IntelliGate } from '@intelligate/sdk';

const client = new IntelliGate({
  apiKey: 'sk_test_...',
  maxRetries: 3, // Exponential backoff retries
  timeout: 10000 // Abort fetch after 10s
});

// Proxy a request securely
const res = await client.gateway.private();
```

## Features
- **Zero Dependencies**: Uses native `fetch` and modern JS features.
- **Resilient**: Built-in exponential backoff retries for 429 and 5xx errors.
- **Safe**: Timeout abort controllers prevent hanging connections.
- **Typed**: Exhaustive TypeScript definitions mapped directly to the backend.

## Error Handling
The SDK throws specific error classes based on the failure point:
- `SDKError`: Initialization errors (e.g., missing API key).
- `TransportError`: Network-level failures (e.g., DNS, timeouts).
- `HTTPError`: Server-level failures (4xx, 5xx) with mapped backend messages.
