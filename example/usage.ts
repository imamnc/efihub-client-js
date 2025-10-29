import { EfihubClient } from "../src";

const client = new EfihubClient({
  clientId: process.env.EFIHUB_CLIENT_ID!,
  clientSecret: process.env.EFIHUB_CLIENT_SECRET!,
});

(async () => {
  // Basic HTTP
  const users = await client.get("/user", { params: { page: 1 } });
  console.log("Users:", users.data);

  // Storage: upload a local file and get its public URL
  try {
    const url = await client.storage().upload("uploads/", "/tmp/example.jpg");
    console.log("File URL:", url);
  } catch (e) {
    console.error(
      "Upload failed:",
      (e as any)?.response?.data || (e as any)?.message
    );
  }

  // Websocket: dispatch an event
  const ok = await client.socket().dispatch({
    channel: "orders:updates",
    event: "OrderUpdated",
    data: { order_id: 123, status: "updated" },
  });
  console.log("Dispatch success:", ok);
})();
