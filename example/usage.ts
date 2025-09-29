import { EfihubClient } from "../src";

const client = new EfihubClient({
  clientId: process.env.EFIHUB_CLIENT_ID!,
  clientSecret: process.env.EFIHUB_CLIENT_SECRET!,
  tokenUrl: "https://efihub.morefurniture.id/oauth/token",
  apiBaseUrl: "https://efihub.morefurniture.id/api",
});

(async () => {
  const users = await client.get("/users");
  console.log(users.data);
})();