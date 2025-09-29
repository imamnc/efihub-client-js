import { EfihubClient } from "../src";

const client = new EfihubClient({
  clientId: process.env.EFIHUB_CLIENT_ID!,
  clientSecret: process.env.EFIHUB_CLIENT_SECRET!,
});

(async () => {
  const users = await client.get("/users");
  console.log(users.data);
})();