//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { SharedWorkerAcceptor } from "./SharedWorkerAcceptor";
import { HashSet } from "tstl/container/HashSet";

export class SharedWorkerServer
{
	/**
	 * @hidden
	 */
	private acceptors_: HashSet<SharedWorkerAcceptor>;

	/**
	 * Initializer Constructor.
	 * 
	 * @param cb Callback function called whenever client connects.
	 */
	public constructor(cb: (acceptor: SharedWorkerAcceptor) => void | Promise<void>)
	{
		this.acceptors_ = new HashSet();

		addEventListener("connect", (evt: OpenEvent) =>
		{
			let port: MessagePort = evt.ports[evt.ports.length - 1];
			let acceptor = new AcceptorFactory(port, () =>
			{
				this.acceptors_.erase(acceptor);
			});
			
			this.acceptors_.insert(acceptor);
			cb(acceptor);
		});
	}

	/**
	 * Close server.
	 */
	public async close(): Promise<void>
	{
		for (let acceptor of this.acceptors_)
			await acceptor.close();
	}
}

/**
 * @hidden
 */
type OpenEvent = Event & {ports: MessagePort[]};

/**
 * @hidden
 */
const AcceptorFactory:
{
	new(port: MessagePort, eraser: ()=>void): SharedWorkerAcceptor;
} = <any>SharedWorkerAcceptor;