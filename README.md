# EFIHUB JavaScript/TypeScript Client

A lightweight SDK to call the EFIHUB API using the OAuth2 Client Credentials flow.

- OAuth2 Client Credentials with automatic token caching and refresh on 401
- Simple, typed API built on top of Axios
- Works great with TypeScript or JavaScript

## Installation

```bash
npm install @kacoon/efihub-client
# or
yarn add @kacoon/efihub-client
# or
pnpm add @kacoon/efihub-client
```

> This library uses a client secret to obtain tokens. Use it in server-side environments only—do not expose your credentials in browsers.

## Quick start

```ts
import { EfihubClient } from "@kacoon/efihub-client";

const client = new EfihubClient({
  clientId: process.env.EFIHUB_CLIENT_ID!,
  clientSecret: process.env.EFIHUB_CLIENT_SECRET!,
  // tokenUrl and apiBaseUrl have sensible defaults; override if needed
});

async function main() {
  const res = await client.get("/users", { params: { page: 1 } });
  console.log(res.data);
}

main().catch(console.error);
```

A runnable example is available in `example/usage.ts`.

## Configuration

`EfihubClientConfig`:

- `clientId: string` – OAuth2 Client ID
- `clientSecret: string` – OAuth2 Client Secret
- `tokenUrl?: string` – OAuth2 token endpoint (default: `https://efihub.morefurniture.id/oauth/token`)
- `apiBaseUrl?: string` – Base URL for EFIHUB API requests (default: `https://efihub.morefurniture.id/api`)

## API

### `new EfihubClient(config: EfihubClientConfig)`
Creates a client instance. Internally it maintains an access token and reuses it until expiry.

### HTTP methods
All methods return a `Promise<AxiosResponse<T>>` (default `T = any`). You can pass any `AxiosRequestConfig` as the last argument.

- `get<T>(url: string, options?: AxiosRequestConfig)`
- `post<T>(url: string, data: any, options?: AxiosRequestConfig)`
- `put<T>(url: string, data: any, options?: AxiosRequestConfig)`
- `delete<T>(url: string, options?: AxiosRequestConfig)`

Examples:

```ts
// Query params
await client.get("/users", { params: { page: 2, per_page: 20 } });

// POST JSON body
await client.post("/orders", { sku: "ABC", qty: 2 });

// Custom headers and per-request timeout
await client.get("/reports", {
  headers: { "X-Trace-Id": "123" },
  timeout: 15000,
});
```

## Authentication behavior

- The client fetches an access token using the Client Credentials flow and caches it until `expires_in`.
- If a request fails with `401 Unauthorized`, the client will clear the cached token, obtain a new one, and retry the request once automatically.

## Error handling

Requests can throw Axios errors. Use `try/catch` to handle failures and inspect `error.response` for server details.

```ts
try {
  const res = await client.get("/users/123");
  return res.data;
} catch (err: any) {
  if (err.response) {
    console.error("EFIHUB error", err.response.status, err.response.data);
  } else {
    console.error("Network or configuration error", err.message);
  }
}
```

## TypeScript support

Types are included:

- `EfihubClient`
- `EfihubClientConfig`

You can also specify response types:

```ts
interface User { id: string; name: string }
const res = await client.get<User>("/users/123");
const user = res.data; // typed as User
```

## Development

- Build: `npm run build`
- Test: `npm test` (Vitest)

Project structure:

- `src/` – library source code
- `example/` – example usage script
- `dist/` – build output (after `npm run build`)

## Security notes

- Do not use this library in a browser. It requires a client secret and is intended for trusted server-side environments.
- Keep your credentials in environment variables or a secure secrets manager.

## License

MIT © Imam Nurcholis
