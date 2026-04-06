<p align="center">
  <a href="https://efihub.morefurniture.id">
  <img src="https://efihub.morefurniture.id/img/logo.png" alt="EFIHUB" width="180" />
  </a>

  <h1 align="center">EFIHUB JavaScript/TypeScript Client</h1>

  <p align="center">
    <em>Node.js SDK for EFIHUB — Feeling easy to integrate.</em>
  </p>

  <p align="center">
    <a href="https://www.npmjs.com/package/@kacoon/efihub-client"><img src="https://img.shields.io/npm/v/@kacoon/efihub-client.svg?logo=npm" alt="npm version" /></a>
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license" />
    <a href="https://imamnc.com"><img src="https://img.shields.io/badge/author-Imam%20Nc-orange.svg" alt="author" /></a>
  </p>
</p>

---

## Introduction

EFIHUB client for Node.js / TypeScript that authenticates via OAuth 2.0 Client Credentials and exposes:

- **HTTP client** — GET / POST / PUT / DELETE / `postMultipart`, with refresh token handling
- **Storage module** — upload files and manage them on EFIHUB storage
- **WebSocket module** — dispatch real-time events to channels
- **SSO module** — generate an authorization URL and fetch user profile after callback
- **WhatsApp module** — manage agents, send messages, retrieve messages

> **Server-side only.** Never expose your `clientSecret` in a browser or public environment.

---

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [HTTP Client](#http-client)
  - [Basic Usage](#basic-usage)
  - [Multipart Upload](#multipart-upload)
- [Modules](#modules)
  - [Storage](#storage-module)
  - [WebSocket](#websocket-module)
  - [SSO](#sso-module)
  - [WhatsApp](#whatsapp-module)
- [License & Author](#license--author)

---

## Installation

```bash
npm install @kacoon/efihub-client
# or
yarn add @kacoon/efihub-client
# or
pnpm add @kacoon/efihub-client
```

---

## Environment Variables

```bash
EFIHUB_CLIENT_ID=your_client_id
EFIHUB_CLIENT_SECRET=your_client_secret
```

---

## Authentication

The client uses the **OAuth 2.0 Client Credentials** flow automatically:

- Access token is fetched on the first request and cached until expiry
- On a `401` response, the cache is cleared and the request is retried once
- No manual token management needed

```ts
import { EfihubClient } from "@kacoon/efihub-client";

const efihub = new EfihubClient({
  clientId: process.env.EFIHUB_CLIENT_ID!,
  clientSecret: process.env.EFIHUB_CLIENT_SECRET!,
});
```

---

## HTTP Client

### Basic Usage

```ts
// GET with query params
const res = await efihub.get("/user", { params: { page: 1 } });

// POST JSON
const res = await efihub.post("/orders", { sku: "ABC", qty: 2 });

// PUT
const res = await efihub.put("/orders/123", { qty: 3 });

// DELETE
const res = await efihub.delete("/orders/123");
```

TypeScript generics are supported:

```ts
interface Order {
  id: number;
  qty: number;
}
const resp = await efihub.get<Order>("/orders/123");
const order = resp.data; // typed as Order
```

### Multipart Upload

Use `postMultipart` to send `multipart/form-data` alongside file attachments to any endpoint:

```ts
const res = await efihub.postMultipart(
  "/documents",
  { type: "invoice" }, // plain fields
  { file: "/path/to/invoice.pdf" }, // files (field name → local path)
);
```

---

## Modules

All modules are accessed via lazy-initialized accessors on `EfihubClient` (e.g. `efihub.storage()`, `efihub.whatsapp()`).

---

### Storage Module

Upload files and manage them on the EFIHUB storage service.

#### Methods

| Method                               | Return                     | Description                                             |
| ------------------------------------ | -------------------------- | ------------------------------------------------------- |
| `upload(input, destPath, filename?)` | `Promise<string \| false>` | Upload a file; returns public URL or `false` on failure |
| `exists(filePath)`                   | `Promise<boolean>`         | Check whether a file exists                             |
| `size(filePath)`                     | `Promise<number \| null>`  | File size in bytes, or `null` on failure                |
| `delete(filePath)`                   | `Promise<boolean>`         | Delete a file; returns `true` on success                |

`upload()` accepts a string file path, `Buffer`, or `Readable` stream as `input`. End `destPath` with `/` to let the server auto-generate the filename.

#### Usage

```ts
// Upload a local file
const url = await efihub
  .storage()
  .upload("/path/to/photo.jpg", "uploads/2024/06/");
if (url === false) {
  // handle upload failure
}
console.log(url); // https://...

// Other helpers
const exists = await efihub.storage().exists("uploads/photo.jpg"); // boolean
const bytes = await efihub.storage().size("uploads/photo.jpg"); // number | null
const ok = await efihub.storage().delete("uploads/photo.jpg"); // boolean
```

#### Endpoints

- `POST /storage/upload`
- `GET /storage/url`
- `GET /storage/size`
- `GET /storage/exists`
- `DELETE /storage/delete`

---

### WebSocket Module

Dispatch real-time events to channels from a server-side listener or job.

#### Methods

| Method                                | Return             | Description                         |
| ------------------------------------- | ------------------ | ----------------------------------- |
| `dispatch(channel, event, data?)`     | `Promise<boolean>` | Flat-arg style (Laravel-compatible) |
| `dispatch({ channel, event, data? })` | `Promise<boolean>` | Object-payload style                |

#### Usage

```ts
// Flat-arg style (matches Laravel API)
const ok = await efihub.socket().dispatch("orders:updates", "OrderUpdated", {
  order_id: 123,
  status: "updated",
});

// Object style
const ok = await efihub.socket().dispatch({
  channel: "orders:updates",
  event: "OrderUpdated",
  data: { order_id: 123 },
});

if (!ok) {
  // handle failure (log, retry, etc.)
}
```

#### Endpoint

- `POST /websocket/dispatch` — body: `{ channel, event, data }`

---

### SSO Module

Centralized login flow: generate an authorization URL, redirect the user, then exchange the `redirect_token` for user profile data.

#### Methods

| Method                    | Return                                  | Description                                                       |
| ------------------------- | --------------------------------------- | ----------------------------------------------------------------- |
| `login()`                 | `Promise<string \| false>`              | Returns the authorization URL or `false` on failure               |
| `userData(redirectToken)` | `Promise<Record<string, any> \| false>` | Exchanges the token for user info; returns user object or `false` |

#### Usage

**Step 1** — Redirect the user to EFIHUB login:

```ts
const authUrl = await efihub.sso().login();
if (authUrl === false) {
  // log error and abort
}
// e.g. res.redirect(authUrl)  (Express) or return redirect(authUrl)  (Next.js)
```

**Step 2** — Handle the callback and fetch user data:

```ts
const redirectToken = req.query.redirect_token as string;
const user = await efihub.sso().userData(redirectToken);

if (user === false) {
  // invalid token or request failed
} else {
  console.log(user.email, user.name);
}
```

> **Security note:** bind a `state`/`nonce` to the session before redirecting to prevent CSRF attacks on the callback.

#### Endpoints

- `POST /sso/authorize`
- `GET /sso/user`

---

### WhatsApp Module

Manage WhatsApp agents and send text messages or file attachments to individual recipients or groups.

#### Methods

**Agent management**

| Method                                | Return                    | Description                                        |
| ------------------------------------- | ------------------------- | -------------------------------------------------- |
| `agents()`                            | `Promise<any[]>`          | List all registered agents/sessions                |
| `agentQR(agentCode)`                  | `Promise<string \| null>` | QR code as `data:image/png;base64,...` or `null`   |
| `agentStatus(agentCode)`              | `Promise<string \| null>` | `'connected'` \| `'disconnected'` \| `null`        |
| `checkPhoneNumber(agentCode, number)` | `Promise<boolean>`        | `true` if the number is a registered WhatsApp user |

**Messaging**

| Method                                                                    | Return             | Description                                  |
| ------------------------------------------------------------------------- | ------------------ | -------------------------------------------- |
| `sendMessage(sender, to, message, ref_id?, ref_url?)`                     | `Promise<boolean>` | Send a text message to a single recipient    |
| `sendGroupMessage(sender, to, message, ref_id?, ref_url?)`                | `Promise<boolean>` | Send a text message to a group               |
| `sendAttachment(sender, to, message, attachment, ref_id?, ref_url?)`      | `Promise<boolean>` | Send message + file(s) to a single recipient |
| `sendGroupAttachment(sender, to, message, attachment, ref_id?, ref_url?)` | `Promise<boolean>` | Send message + file(s) to a group            |
| `getMessages(agentCode, phone, limit?)`                                   | `Promise<any[]>`   | Retrieve recent messages (default limit: 10) |

All `send*` methods return `true` on HTTP 2xx, `false` otherwise.

#### Phone number normalization

All send methods automatically normalize phone numbers to the international format (`62xxxxxxxxxx` for Indonesia):

| Input           | Normalized     |
| --------------- | -------------- |
| `+628109998877` | `628109998877` |
| `08109998877`   | `628109998877` |
| `628109998877`  | `628109998877` |

#### Attachment formats

The `attachment` parameter of `sendAttachment` / `sendGroupAttachment` accepts a single spec or an array of specs:

| Format                | Example                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------- |
| Path string           | `"/path/to/file.pdf"`                                                                   |
| Path with custom name | `{ path: "/path/to/file.pdf", filename: "custom.pdf" }`                                 |
| Raw contents          | `{ contents: buffer, filename: "report.csv", headers: { "Content-Type": "text/csv" } }` |
| Multiple files        | `["/path/a.pdf", "/path/b.pdf"]`                                                        |

#### Usage

```ts
// List agents
const agents = await efihub.whatsapp().agents();

// QR code (for display / scanning)
const qr = await efihub.whatsapp().agentQR("AGENT1");
// qr === 'data:image/png;base64,...' or null

// Connection status
const status = await efihub.whatsapp().agentStatus("AGENT1");
// 'connected' | 'disconnected' | null

// Validate a number before sending
const valid = await efihub
  .whatsapp()
  .checkPhoneNumber("AGENT1", "+628109998877");
if (!valid) {
  /* number not on WhatsApp */
}

// Send text message (number auto-normalized)
const ok = await efihub.whatsapp().sendMessage(
  "AGENT1",
  "+628109998877",
  "Halo! Test pesan.",
  "order-9988", // optional ref_id
  "https://yourapp.com/orders/9988", // optional ref_url
);

// Send to a group
await efihub
  .whatsapp()
  .sendGroupMessage("AGENT1", "group-abc123", "Hello group!");

// Send attachment — single file path
await efihub
  .whatsapp()
  .sendAttachment(
    "AGENT1",
    "+628109998877",
    "Berikut invoice kamu",
    "/path/to/invoice.pdf",
  );

// Send attachment — raw buffer with custom name
await efihub
  .whatsapp()
  .sendAttachment("AGENT1", "+628109998877", "Report CSV", {
    contents: csvBuffer,
    filename: "report.csv",
    headers: { "Content-Type": "text/csv" },
  });

// Send multiple attachments to a group
await efihub
  .whatsapp()
  .sendGroupAttachment("AGENT1", "group-abc123", "Semua dokumen", [
    "/path/doc1.pdf",
    "/path/doc2.pdf",
  ]);

// Retrieve recent messages
const messages = await efihub
  .whatsapp()
  .getMessages("AGENT1", "+628109998877", 20);
for (const msg of messages) {
  console.log(msg.from, msg.message);
}
```

#### Endpoints

| Method                  | Endpoint                                             |
| ----------------------- | ---------------------------------------------------- |
| `agents()`              | `GET /whatsapp/sessions`                             |
| `agentQR()`             | `GET /whatsapp/sessions/qrcode/{agentCode}`          |
| `agentStatus()`         | `GET /whatsapp/sessions/status/{agentCode}`          |
| `checkPhoneNumber()`    | `GET /whatsapp/user/exists/{agentCode}/{number}`     |
| `sendMessage()`         | `POST /whatsapp/message`                             |
| `sendGroupMessage()`    | `POST /whatsapp/message/group`                       |
| `sendAttachment()`      | `POST /whatsapp/message/attachment`                  |
| `sendGroupAttachment()` | `POST /whatsapp/message/group/attachment`            |
| `getMessages()`         | `GET /whatsapp/messages/{agentCode}/{phone}/{limit}` |

---

## License & Author

MIT © Imam Nurcholis. See LICENSE.

- Author: https://github.com/imamnc
- EFIHUB: https://efihub.morefurniture.id
