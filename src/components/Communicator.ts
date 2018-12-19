//================================================================ 
/** @module tgrid.components */
//================================================================
import { CommunicatorBase } from "./CommunicatorBase";
import { Invoke } from "./Invoke";

export class Communicator<Provider extends object = {}>
	extends CommunicatorBase<Provider>
{
	/* ----------------------------------------------------------------
		CONSTRUCTORS
	---------------------------------------------------------------- */
	/**
	 * Initializer Constructor.
	 * 
	 * @param sender A function sending data to the remote system.
	 * @param readyInspector A predicator function inspects whether the *network communication* is ready. It must return null, if ready, otherwise *Error* object explaining why.
	 * @param provider A provider for the remote system.
	 */
	public constructor(sender: Sender, readyInspector: ReadyInspector, provider: Provider = null)
	{
		super(provider);

		this.sendData = sender;
		this.inspectReady = readyInspector;
	}

	/**
	 * Destory the communicator.
	 * 
	 * A destory function should be called when the network communication has been closed. It would destroy all function calls in the remote system (via {@link `Driver<Controller>` getDriver}), which are not returned yet.
	 * 
	 * The *error* instance would be thrown to those function calls. If the disconnection is abnormal, then write the detailed reason why into the *error* instance.
	 * 
	 * @param error An error instance to be thrown to the unreturned functions.
	 */
	public destory(error?: Error): Promise<void>
	{
		return this.destructor(error);
	}

	/* ----------------------------------------------------------------
		ACCESSORS
	---------------------------------------------------------------- */
	/**
	 * A provider for the remote system.
	 */
	public get provider(): Provider
	{
		return this.provider_;
	}

	public set provider(obj: Provider)
	{
		this.provider_ = obj;
	}

	/**
	 * A function sending data to the remote system.
	 */
	public sendData: Sender;

	/**
	 * A predicator inspects whether the *network communication* is ready.
	 */
	public inspectReady: ReadyInspector;

	/* ----------------------------------------------------------------
		COMMUNICATIONS
	---------------------------------------------------------------- */
	/**
	 * Data Replier.
	 * 
	 * A function should be called when data has come from the remote system.
	 * 
	 * When you receive a message from the remote system, then parse the message with your special protocol and covert it to be an *Invoke* object. After the conversion, call this method.
	 * 
	 * @param invoke Structured data converted by your special protocol.
	 */
	public replyData(invoke: Invoke): void
	{
		return this.replier(invoke);
	}

	/**
	 * @hidden
	 */
	protected sender(invoke: Invoke): void
	{
		return this.sendData(invoke);
	}

	/**
	 * @hidden
	 */
	protected replier(invoke: Invoke): void
	{
		return super.replier(invoke);
	}

	/**
	 * @hidden
	 */
	protected inspector(): Error
	{
		return this.inspectReady();
	}
}

/**
 * @hidden
 */
type Sender = (invoke: Invoke) => void;

/**
 * @hidden
 */
type ReadyInspector = () => Error;