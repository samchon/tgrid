import { INestiaConfig } from "@nestia/sdk";
import { NestFactory } from "@nestjs/core";

import { CalculateModule } from "./src/nestjs/calculate.module";

export const NESTIA_CONFIG: INestiaConfig = {
  input: async () => {
    const app = await NestFactory.create(CalculateModule);
    return app;
  },
  output: "src/api",
};
export default NESTIA_CONFIG;
