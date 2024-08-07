import { Communicator, Driver, Invoke } from "tgrid";
import { InvalidArgument } from "tstl";

import { ICalculator } from "../../controllers/ICalculator";
import { Calculator } from "../../providers/Calculator";

class PseudoCommunicator<Provider extends object | null> extends Communicator<
  Provider,
  ICalculator
> {
  private sender_: (invoke: Invoke) => void;

  public constructor(sender: (invoke: Invoke) => void, provider: Provider) {
    super(provider);
    this.sender_ = sender;
  }

  protected inspectReady(): Error | null {
    return null;
  }
  protected async sendData(invoke: Invoke): Promise<void> {
    this.sender_(invoke);
  }
  public reply(invoke: Invoke): void {
    this.replyData(invoke);
  }
}

export async function test_pseudo(): Promise<void> {
  //----
  // SERVER & CLIENT
  //----
  // PRE-DECLARATIONS
  let server: PseudoCommunicator<Calculator>;
  let client: PseudoCommunicator<null>;

  // CONSTRUCT SYSTEMS
  server = new PseudoCommunicator((ivk) => client.reply(ivk), new Calculator());
  client = new PseudoCommunicator((ivk) => server.reply(ivk), null);

  //----
  // INTERACTS
  //----
  // GET DRIVER
  const driver: Driver<ICalculator> = client.getDriver();
  if (driver instanceof Driver !== true)
    throw new InvalidArgument("Error on Driver type checking");

  // DO TEST
  await ICalculator.main(driver);
}
