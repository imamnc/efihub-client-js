<p align="center">
  <a href="https://efihub.morefurniture.id">
  <img src="https://efihub.morefurniture.id/img/logo.png" alt="EFIHUB" width="180" />
  </a>

  <h1 align="center">EFIHUB JavaScript/TypeScript Client</h1>

  <p align="center">
    <em>A modern SDK to integrate with the EFIHUB platform using the OAuth 2.0 Client Credentials flow.</em>
  </p>

  <p align="center">
    <a href="https://www.npmjs.com/package/@kacoon/efihub-client"><img src="https://img.shields.io/npm/v/@kacoon/efihub-client.svg?logo=npm" alt="npm version" /></a>
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license" />
    <a href="https://imamnc.com"><img src="https://img.shields.io/badge/author-Imam%20Nc-orange.svg" alt="author" /></a>
  </p>
</p>

## Description

EFIHUB is PT EFI’s central integration platform that connects all EFI applications in one unified ecosystem. It provides:

- API Sharing Platform: discoverable, secured APIs across internal apps
- Central Webhook Hub: real-time notifications with routing, retry, and logging
- Central Scheduler: task automation, cron jobs, background processes
- Enterprise Security: OAuth 2.0, JWT, and audit trail
- Unified Dashboard: observability across APIs, webhooks, schedules, and more

This package, `@kacoon/efihub-client`, is the official JavaScript/TypeScript client for EFIHUB’s REST API. It authenticates via OAuth 2.0 Client Credentials and exposes simple HTTP helpers for GET/POST/PUT/DELETE.

Important: Because Client Credentials requires a client secret, this SDK must be used in trusted, server-side environments only. For web apps (React/Vue/Nuxt/Next), instantiate the client on the server (API routes, server-only modules) and never ship credentials to the browser.

## Installation

```bash
npm install @kacoon/efihub-client
# or
yarn add @kacoon/efihub-client
# or
pnpm add @kacoon/efihub-client
```

## Usage

Core usage (Node.js/server runtime):

```ts
import { EfihubClient } from "@kacoon/efihub-client";

const client = new EfihubClient({
  clientId: process.env.EFIHUB_CLIENT_ID!,
  clientSecret: process.env.EFIHUB_CLIENT_SECRET!,
  // Defaults are provided; override only if you run a different EFIHUB endpoint:
  // tokenUrl?: "https://efihub.morefurniture.id/oauth/token",
  // apiBaseUrl?: "https://efihub.morefurniture.id/api",
});

const { data } = await client.get("/users", { params: { page: 1 } });
console.log(data);
```

Authentication behavior:

- Access token is fetched via Client Credentials and cached until `expires_in`.
- If a request returns 401, the client clears the token, refreshes it, and retries once automatically.

Configuration shape (`EfihubClientConfig`):

- `clientId: string`
- `clientSecret: string`
- `tokenUrl?: string` (default: `https://efihub.morefurniture.id/oauth/token`)
- `apiBaseUrl?: string` (default: `https://efihub.morefurniture.id/api`)

TypeScript tip:

```ts
interface User {
  id: string;
  name: string;
}
const res = await client.get<User>("/users/123");
const user = res.data; // typed as User
```

### Next.js

Do not use this SDK in client components. Keep credentials on the server.

App Router (app/api/users/route.ts):

```ts
import { NextResponse } from "next/server";
import { EfihubClient } from "@kacoon/efihub-client";

export async function GET() {
  const client = new EfihubClient({
    clientId: process.env.EFIHUB_CLIENT_ID!,
    clientSecret: process.env.EFIHUB_CLIENT_SECRET!,
  });
  const res = await client.get("/users", { params: { page: 1 } });
  return NextResponse.json(res.data);
}
```

Pages Router (pages/api/users.ts):

```ts
import type { NextApiRequest, NextApiResponse } from "next";
import { EfihubClient } from "@kacoon/efihub-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = new EfihubClient({
    clientId: process.env.EFIHUB_CLIENT_ID!,
    clientSecret: process.env.EFIHUB_CLIENT_SECRET!,
  });
  const out = await client.get("/users");
  res.status(200).json(out.data);
}
```

### Nuxt 3

Create a server API route. Do not call the SDK directly from Vue components.

server/api/users.get.ts:

```ts
import { EfihubClient } from "@kacoon/efihub-client";

export default defineEventHandler(async () => {
  const client = new EfihubClient({
    clientId: process.env.EFIHUB_CLIENT_ID!,
    clientSecret: process.env.EFIHUB_CLIENT_SECRET!,
  });
  const res = await client.get("/users");
  return res.data;
});
```

### React (CRA/Vite) and Vue (Vite)

Do not bundle this SDK in the browser. Instead, call your own backend endpoint:

```ts
// React/Vue component (browser)
const resp = await fetch("/api/users");
const users = await resp.json();
```

On your backend (Node/Express, Next.js API route, Nuxt server route), use `EfihubClient` as shown above to fetch from EFIHUB and return JSON to your SPA.

## Development

Local scripts:

- Build: `npm run build`
- Test: `npm test` (Vitest)

Versioning (SemVer):

```bash
# Choose one: patch | minor | major
npm version patch -m "chore(release): %s"
```

Push to repository (includes tags created by `npm version`):

```bash
git push origin main --follow-tags
```

Publish to npm:

```bash
# Ensure you are logged in and have publish rights
npm login

# Publish as public package
npm publish --access public
```

NPM package: https://www.npmjs.com/package/@kacoon/efihub-client

Release checklist:

- [ ] Update changelog/README if needed
- [ ] `npm run build` passes
- [ ] `npm version <type>` and push tags
- [ ] `npm publish --access public`

## Author

Imam Nurcholis (https://github.com/imamnc)

EFIHUB website: https://efihub.morefurniture.id

## Installation

```bash
npm install @kacoon/efihub-client
# or
yarn add @kacoon/efihub-client
# or
pnpm add @kacoon/efihub-client
```

Important: Because Client Credentials requires a client secret, this SDK must be used in trusted, server-side environments only. For web apps (React/Vue/Nuxt/Next), instantiate the client on the server (API routes, server-only modules) and never ship credentials to the browser.

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

- `clientId: string`
- `clientSecret: string`
- `tokenUrl?: string` (default: `https://efihub.morefurniture.id/oauth/token`)
- `apiBaseUrl?: string` (default: `https://efihub.morefurniture.id/api`)

## API

### `new EfihubClient(config: EfihubClientConfig)`

Creates a client instance. Internally it maintains an access token and reuses it until expiry.

### HTTP methods

- All methods return a `Promise<AxiosResponse<T>>` (default `T = any`). You can pass any `AxiosRequestConfig` as the last argument.

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

- Access token is fetched via Client Credentials and cached until `expires_in`.
- If a request returns 401, the client clears the token, refreshes it, and retries once automatically.

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
interface User {
  id: string;
  name: string;
}
const res = await client.get<User>("/users/123");
const user = res.data; // typed as User
```

## Development

- Local scripts:
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

EFIHUB website: https://efihub.morefurniture.id
