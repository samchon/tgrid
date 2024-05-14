import { workerClientMain } from "./client";

const main = async (): Promise<void> => {
  await workerClientMain();
};
main().catch((exp) => {
  console.error(exp);
  process.exit(-1);
});
