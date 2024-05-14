import { Module } from "@nestjs/common";

import { CalculateController } from "./calculate.controller";

@Module({
  controllers: [CalculateController],
})
export class CalculateModule {}
