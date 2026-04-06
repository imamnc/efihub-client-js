import { EfihubClient } from "../src";

const client = new EfihubClient({
  clientId: process.env.EFIHUB_CLIENT_ID!,
  clientSecret: process.env.EFIHUB_CLIENT_SECRET!,
});

(async () => {
  // ─── HTTP Client ─────────────────────────────────────────────────────────
  const users = await client.get("/user", { params: { page: 1 } });
  console.log("Users:", users.data);

  // POST with JSON body
  const order = await client.post("/orders", { sku: "ABC", qty: 2 });
  console.log("Order:", order.data);

  // Multipart upload via base client
  const uploadRes = await client.postMultipart(
    "/documents",
    { type: "invoice" },
    { file: "/tmp/invoice.pdf" },
  );
  console.log("Multipart upload:", uploadRes.data);

  // ─── Storage module ───────────────────────────────────────────────────────
  try {
    // upload(input, destPath)
    const url = await client.storage().upload("/tmp/example.jpg", "uploads/");
    console.log("File URL:", url);
  } catch (e) {
    console.error(
      "Upload failed:",
      (e as any)?.response?.data || (e as any)?.message,
    );
  }

  const exists = await client.storage().exists("uploads/example.jpg");
  console.log("Exists:", exists); // boolean

  const size = await client.storage().size("uploads/example.jpg");
  console.log("Size:", size); // number | null

  const deleted = await client.storage().delete("uploads/example.jpg");
  console.log("Deleted:", deleted); // boolean

  // ─── WebSocket module ─────────────────────────────────────────────────────
  // Object style
  const ok1 = await client.socket().dispatch({
    channel: "orders:updates",
    event: "OrderUpdated",
    data: { order_id: 123, status: "updated" },
  });
  console.log("Dispatch (object):", ok1);

  // Flat-arg style (Laravel-compatible)
  const ok2 = await client
    .socket()
    .dispatch("orders:updates", "OrderUpdated", { order_id: 123 });
  console.log("Dispatch (flat):", ok2);

  // ─── SSO module ───────────────────────────────────────────────────────────
  const authUrl = await client.sso().login();
  if (authUrl) {
    console.log("Redirect user to:", authUrl);
    // After callback, exchange the redirect_token for user data
    // const user = await client.sso().userData(redirectToken);
  }

  // ─── WhatsApp module ──────────────────────────────────────────────────────
  const agents = await client.whatsapp().agents();
  console.log("Agents:", agents);

  const qr = await client.whatsapp().agentQR("AGENT1");
  console.log("QR:", qr); // data:image/png;base64,...

  const status = await client.whatsapp().agentStatus("AGENT1");
  console.log("Status:", status); // 'connected' | 'disconnected' | null

  const isValid = await client
    .whatsapp()
    .checkPhoneNumber("AGENT1", "+628109998877");
  console.log("Phone valid:", isValid);

  // Send text message (number auto-normalized to 628...)
  const sent = await client
    .whatsapp()
    .sendMessage(
      "AGENT1",
      "+628109998877",
      "Hello from JS!",
      "order-123",
      "https://yourapp.com/orders/123",
    );
  console.log("Message sent:", sent);

  // Send to group
  const groupSent = await client
    .whatsapp()
    .sendGroupMessage("AGENT1", "group-abc123", "Hello group!");
  console.log("Group message sent:", groupSent);

  // Send attachment (single file path)
  const attachSent = await client
    .whatsapp()
    .sendAttachment(
      "AGENT1",
      "+628109998877",
      "Here is your invoice",
      "/tmp/invoice.pdf",
    );
  console.log("Attachment sent:", attachSent);

  // Send multiple attachments to group
  const groupAttach = await client
    .whatsapp()
    .sendGroupAttachment("AGENT1", "group-abc123", "Documents attached", [
      "/tmp/doc1.pdf",
      "/tmp/doc2.pdf",
    ]);
  console.log("Group attachment sent:", groupAttach);

  // Retrieve recent messages
  const messages = await client
    .whatsapp()
    .getMessages("AGENT1", "+628109998877", 5);
  console.log("Messages:", messages);
})();
