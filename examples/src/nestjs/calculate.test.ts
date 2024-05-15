import api from "../api";
import { ICalcEvent } from "../interfaces/ICalcEvent";
import { ICalcEventListener } from "../interfaces/ICalcEventListener";

export const testCalculateSdk = async () => {
  const stack: ICalcEvent[] = [];
  const listener: ICalcEventListener = {
    on: (evt: ICalcEvent) => stack.push(evt),
  };
  const { connector, driver } = await api.functional.calculate.composite(
    {
      host: "ws://127.0.0.1:37000",
      headers: {
        precision: 2,
      },
    },
    listener,
  );

  console.log(
    await driver.plus(10, 20), // returns 30
    await driver.multiplies(3, 4), // returns 12
    await driver.divides(5, 3), // returns 1.67
    await driver.scientific.sqrt(2), // returns 1.41
    await driver.statistics.mean(1, 3, 9), // returns 4.33
  );

  await connector.close();
  console.log(stack);
};
