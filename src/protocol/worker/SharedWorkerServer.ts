import { SharedWorkerAcceptor } from "./SharedWorkerAcceptor";

import { HashSet } from "tstl/container";
import { DomainError } from "tstl/exception";

export class SharedWorkerServer
{
	/**
	 * @hidden
	 */
	private acceptors_: HashSet<SharedWorkerAcceptor>;

	/**
	 * @hidden
	 */
	private opened_: boolean;

	public constructor()
	{
		this.acceptors_ = new HashSet();
		this.opened_ = false;
	}

	public async open(callback: (acceptor: SharedWorkerAcceptor) => void): Promise<void>
	{
		if (this.opened_ === true)
			throw new DomainError("Already opened.");

		addEventListener("open", (evt: OpenEvent) =>
		{
			let port: MessagePort = evt.ports[evt.ports.length - 1];
			let acceptor = new AcceptorFactory(port, () =>
			{
				this.acceptors_.erase(acceptor);
			});
			
			this.acceptors_.insert(acceptor);
			callback(acceptor);
		});
		this.opened_ = true;
	}

	public async close(): Promise<void>
	{
		for (let acceptor of this.acceptors_)
			await acceptor.close();
	}
}

type OpenEvent = Event & {ports: MessagePort[]};
const AcceptorFactory:
{
	new(port: MessagePort, eraser: ()=>void): SharedWorkerAcceptor;
} = <any>SharedWorkerAcceptor;