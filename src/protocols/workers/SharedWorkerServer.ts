//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { SharedWorkerAcceptor } from "./SharedWorkerAcceptor";

import { is_node } from "tstl/utility/node";
import { HashSet } from "tstl/container/HashSet";
import { DomainError } from "tstl/exception";

export class SharedWorkerServer<Provider extends object = {}>
{
	/**
	 * @hidden
	 */
	private acceptors_: HashSet<SharedWorkerAcceptor>;

	/**
	 * @hidden
	 */
	private state_: SharedWorkerServer.State;

	/* ----------------------------------------------------------------
		CONSTRUCTOR
	---------------------------------------------------------------- */
	/**
	 * Default Constructor.
	 */
	public constructor()
	{
		this.acceptors_ = new HashSet();
		this.state_ = SharedWorkerServer.State.NONE;
	}

	/**
	 * Open server.
	 * 
	 * @param handler Callback function called whenever client connects.
	 */
	public async open(handler: (acceptor: SharedWorkerAcceptor<Provider>) => any): Promise<void>
	{
		// TEST CONDITION
		if (is_node() === true)
			throw new DomainError("SharedWorker is not supported in the NodeJS.");
		else if (self.document !== undefined)
			throw new DomainError("This is not SharedWorker.");
		else if (this.state_ !== SharedWorkerServer.State.NONE)
			throw new DomainError("Server has opened yet.");

		//----
		// OPE SHARED-WORKER
		//----
		this.state_ = SharedWorkerServer.State.OPENING;
		{
			self.addEventListener("connect", (evt: Event) =>
			{
				// GET PORT
				let portList = (evt as OpenEvent).ports;
				let port: MessagePort =portList[portList.length - 1];

				// CREATE ACCEPTOR
				let acceptor = new AcceptorFactory<Provider>(port, () =>
				{
					this.acceptors_.erase(acceptor);
				});
				this.acceptors_.insert(acceptor);

				// SHIFT TO THE CALLBACK
				handler(acceptor);
			});
		}
		this.state_ = SharedWorkerServer.State.OPEN;
	}

	/**
	 * Close server.
	 */
	public async close(): Promise<void>
	{
		// TEST VALIDATION
		if (this.state_ !== SharedWorkerServer.State.OPEN)
			throw new DomainError("Server is not opened.");
		
		// CLOSE ALL CONNECTIONS
		for (let acceptor of this.acceptors_)
			await acceptor.close();
	}

	/* ----------------------------------------------------------------
		ACCESSORS
	---------------------------------------------------------------- */
	/**
	 * @inheritDoc
	 */
	public get state(): SharedWorkerServer.State
	{
		return this.state_;
	}
}

export namespace SharedWorkerServer
{
	export const enum State
	{
		NONE = -1,
		OPENING = 0,
		OPEN = 1,
		CLOSING = 2,
		CLOSED = 3
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
	new<Provider extends object>(port: MessagePort, eraser: ()=>void): SharedWorkerAcceptor<Provider>;
} = <any>SharedWorkerAcceptor;