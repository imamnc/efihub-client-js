<p align="center">
  <a href="https://efihub.morefurniture.id">
  <img src="https://efihub.morefurniture.id/img/logo.png" alt="EFIHUB" width="180" />
  </a>

  <h1 align="center">EFIHUB JavaScript/TypeScript Client</h1>

  <p align="center">
    <em>Laravel-equivalent client for EFIHUB using OAuth 2.0 Client Credentials.</em>
  </p>

  <p align="center">
    <a href="https://www.npmjs.com/package/@kacoon/efihub-client"><img src="https://img.shields.io/npm/v/@kacoon/efihub-client.svg?logo=npm" alt="npm version" /></a>
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license" />
    <a href="https://imamnc.com"><img src="https://img.shields.io/badge/author-Imam%20Nc-orange.svg" alt="author" /></a>
  </p>
</p>

# EFIHUB JS/Node Client

## Introduction

EFIHUB client for Node.js that authenticates using OAuth 2.0 Client Credentials and exposes:

- A lightweight HTTP client (GET/POST/PUT/DELETE) with automatic token caching and retry on 401
- Storage module to upload files and get public URLs
- Websocket module to dispatch real-time events to channels

Designed for server-side apps only—do not expose your client secret to browsers.

## Installation

```bash
npm install @kacoon/efihub-client
# or
yarn add @kacoon/efihub-client
# or
pnpm add @kacoon/efihub-client
```

Configure environment:

```bash
export EFIHUB_CLIENT_ID=your_client_id
export EFIHUB_CLIENT_SECRET=your_client_secret
export EFIHUB_TOKEN_URL=https://efihub.morefurniture.id/oauth/token
export EFIHUB_API_URL=https://efihub.morefurniture.id/api
```

## Authentication

- Uses OAuth 2.0 Client Credentials to obtain an access token from `EFIHUB_TOKEN_URL`
- Token is cached until expiry; on 401, the client clears the cache and retries once
- Config keys: `clientId`, `clientSecret`, `tokenUrl`, `apiBaseUrl`

Create a client:

```ts
import { EfihubClient } from "@kacoon/efihub-client";

const efihub = new EfihubClient({
  clientId: process.env.EFIHUB_CLIENT_ID!,
  clientSecret: process.env.EFIHUB_CLIENT_SECRET!,
  tokenUrl: process.env.EFIHUB_TOKEN_URL, // optional
  apiBaseUrl: process.env.EFIHUB_API_URL, // optional
});
```

## Http client module

Use the instance directly for simple calls.

```ts
// GET with query params
const res1 = await efihub.get("/user", { params: { page: 1 } });

// POST JSON
const res2 = await efihub.post("/orders", { sku: "ABC", qty: 2 });

// PUT
const res3 = await efihub.put("/orders/123", { qty: 3 });

// DELETE
const res4 = await efihub.delete("/orders/123");
```

TypeScript example:

```ts
interface Order {
  id: number;
  qty: number;
}
const resp = await efihub.get<Order>("/orders/123");
const order = resp.data; // typed
```

## Storage module

Common server use case: upload a file and get its public URL.

```ts
// Upload to a folder; end with '/' to auto-generate a filename on server
const url = await efihub
  .storage()
  .upload("uploads/" /* dest */, "/path/to/local.jpg");
// url is string | null
```

All available helpers:

```ts
await efihub.storage().upload("uploads/" /* dest */, "/path/to/local.jpg"); // => string | null
await efihub.storage().exists("uploads/photo.jpg"); // => { exists: boolean }
await efihub.storage().size("uploads/photo.jpg"); // => { size: number | null }
await efihub.storage().delete("uploads/photo.jpg"); // => { deleted: boolean }
```

Notes:

- `upload(destPath, input, filename?)` accepts string path to local file, Buffer, or Readable stream
- Endpoints used: GET /storage/url|size|exists, POST /storage/upload, DELETE /storage/delete

## Websocket module

Dispatch real-time events to channels (e.g. from a job or listener). Returns boolean indicating success:

```ts
const ok = await efihub.socket().dispatch({
  channel: "orders:updates",
  event: "OrderUpdated",
  data: { order_id: 123, status: "updated" },
});
console.log("dispatch ok:", ok);
```

Endpoint used: POST `/api/websocket/dispatch` with JSON `{ channel, event, data }`.

## License & Author

MIT © Imam Nurcholis. See LICENSE.

- Author: https://github.com/imamnc
- EFIHUB: https://efihub.morefurniture.id
