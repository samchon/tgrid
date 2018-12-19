//================================================================ 
/** @module tgrid.protocols.workers */
//================================================================
import { SharedWorkerAcceptor } from "./SharedWorkerAcceptor";

import { is_node } from "tstl/utility/node";
import { HashSet } from "tstl/container/HashSet";
import { DomainError } from "tstl";
import { IState } from "../internal/IState";

export class SharedWorkerServer 
	implements IState<SharedWorkerServer.State>
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
	 * @param cb Callback function called whenever client connects.
	 */
	public async open(cb: (acceptor: SharedWorkerAcceptor) => any): Promise<void>
	{
		// INSPECTOR
		if (is_node() === true)
			throw new DomainError("SharedWorker is not supported in the NodeJS.");
		else if (self.document !== undefined)
			throw new DomainError("This is not SharedWorker.");

		// DO OPEN
		this.state_ = SharedWorkerServer.State.OPENING;
		{
			self.addEventListener("connect", (evt: OpenEvent) =>
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
		this.state_ = SharedWorkerServer.State.OPEN;
	}

	/**
	 * Close server.
	 */
	public async close(): Promise<void>
	{
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
	new(port: MessagePort, eraser: ()=>void): SharedWorkerAcceptor;
} = <any>SharedWorkerAcceptor;