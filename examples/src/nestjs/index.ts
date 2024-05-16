import { bootstrap } from "./bootstrap";
import { testCalculateSdk } from "./calculate.test";

const main = async () => {
  const app = await bootstrap();
  await testCalculateSdk();
  await app.close();
};
main().catch((exp) => {
  console.error(exp);
  process.exit(-1);
});
