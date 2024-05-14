import { WebSocketAdaptor } from "@nestia/core";
import { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { CalculateModule } from "./calculate.module";

export const bootstrap = async (): Promise<INestApplication> => {
  const app: INestApplication = await NestFactory.create(CalculateModule);
  await WebSocketAdaptor.upgrade(app);
  await app.listen(37_000, "0.0.0.0");
  return app;
};
