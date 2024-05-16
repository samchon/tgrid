import { webSocketClientMain } from "./client";
import { webSocketServerMain } from "./server";

const main = async (): Promise<void> => {
  const server = await webSocketServerMain();
  await webSocketClientMain();
  await server.close();
};
main().catch((exp) => {
  console.error(exp);
  process.exit(-1);
});
