import { HashMap } from "tstl/container/HashMap";
import { Pair, make_pair } from "tstl/utility/Pair";
import { DomainError, RuntimeError } from "tstl/exception";

import { Invoke, IFunction, IReturn } from "./Invoke";
import { Driver } from "./Driver";

export abstract class CommunicatorBase<Provider extends object = {}>
{
	/**
	 * @hidden
	 */
	protected provider_: Provider;

	/**
	 * @hidden
	 */
	private static SEQUENCE: number = 0;

	/**
	 * @hidden
	 */
	private promises_: HashMap<number, Pair<Function, Function>>;

	/* ----------------------------------------------------------------
		CONSTRUCTORS
	---------------------------------------------------------------- */
	/**
	 * Default Constructor.
	 * 
	 * @param provider A provider for the remote system.
	 */
	public constructor(provider: Provider = null)
	{
		this.provider_ = provider;
		this.promises_ = new HashMap();
	}

	/**
	 * The destructor.
	 * 
	 * It's a destructor function should be called when the network communication has been closed. It would destroy all function calls in the remote system (via {@link `Driver<Controller>` getDriver}), which are not returned yet.
	 * 
	 * The *error* instance would be thrown to those function calls. If the disconnection is abnormal, then write the detailed reason why into the *error* instance.
	 * 
	 * @param error An error instance to be thrown to the unreturned functions.
	 */
	protected async destructor(error: Error = null): Promise<void>
	{
		if (error === null)
			error = new RuntimeError("Connection has been closed.");

		for (let entry of this.promises_)
		{
			let reject: Function = entry.second.second;
			reject(error);
		}
		this.promises_.clear();
	}

	/* ----------------------------------------------------------------
		DRIVER
	---------------------------------------------------------------- */
	/**
	 * Get driver for remote controller.
	 * 
	 * @return A Driver for the remote Controller.
	 */
	public getDriver<Controller extends object>(): Driver<Controller>
	{
		return new Proxy<Driver<Controller>>({} as Driver<Controller>,
		{
			get: ({}, name: string) =>
			{
				return this._Proxy_func(name);
			}
		});
	}

	/**
	 * @hidden
	 */
	private _Proxy_func(name: string): Function
	{
		return new Proxy<Function>((...params: any[]) => 
		{
			return this._Call_function(name, ...params);
		},
		{
			get: ({}, newName: string) =>
			{
				return this._Proxy_func(`${name}.${newName}`);
			}
		});
	}

	/**
	 * @hidden
	 */
	private _Call_function(name: string, ...params: any[]): Promise<any>
	{
		return new Promise((resolve, reject) =>
		{
			// READY TO SEND ?
			let error: Error = this.inspector();
			if (error)
			{
				reject(error);
				return;
			}

			// CONSTRUCT INVOKE MESSAGE
			let invoke: IFunction =
			{
				uid: ++CommunicatorBase.SEQUENCE,
				name: name,
				params: params
			};

			// DO SEND WITH PROMISE
			this.promises_.emplace(invoke.uid, make_pair(resolve, reject));
			this.sender(invoke);
		});
	}

	/**
	 * Inspect ready to communicate.
	 * 
	 * A predicator method that inspects whether the *communication* is ready or not. Override this method to return *null* when be ready, otherwise return an *Error* object explaining why.
	 * 
	 * @return Returns *null*, if ready, otherwise *Error* object explainig why.
	 */
	protected abstract inspector(): Error;

	/* ----------------------------------------------------------------
		COMMUNICATORS
	---------------------------------------------------------------- */
	/**
	 * Data Sender.
	 * 
	 * A function sending data to the remote system. Override this method to send the *invoke* object to the remote system, as a structured data with your special protocol.
	 * 
	 * @param invoke Structured data to send.
	 */
	protected abstract sender(invoke: Invoke): void;

	/**
	 * Data Replier.
	 * 
	 * A function should be called when data has come from the remote system.
	 * 
	 * When you receive a message from the remote system, then parse the message with your special protocol and covert it to be an *Invoke* object. After the conversion, call this method.
	 * 
	 * @param invoke Structured data converted by your special protocol.
	 */
	protected replier(invoke: Invoke): void
	{
		if ((invoke as IFunction).name)
			this._Handle_function(invoke as IFunction);
		else
			this._Handle_return(invoke as IReturn);
	}

	/**
	 * @hidden
	 */
	private _Handle_function(invoke: IFunction): void
	{
		let uid: number = invoke.uid;

		try
		{
			//----
			// FIND FUNCTION
			//----
			if (!this.provider_) // PROVIDER MUST BE
				throw new DomainError("Provider is not specified yet.");

			// FIND FUNCTION (WITH THIS-ARG)
			let func: Function = <any>this.provider_;
			let thisArg: any = null;

			let routes: string[] = invoke.name.split(".");
			for (let name of routes)
			{
				thisArg = func;
				func = thisArg[name];
			}

			//----
			// RETURN VALUE
			//----
			// CALL FUNCTION
			let ret: any = func.apply(thisArg, invoke.params);

			// PROMISE | ATOMIC
			if (ret && ret.then instanceof Function) // Async
				ret.then(this._Send_return.bind(this, uid, true))
				   .catch(this._Send_return.bind(this, uid, false));
			else
				this._Send_return(uid, true, ret); // Sync
		}
		catch (exp)
		{
			this._Send_return(uid, false, exp);
		}
	}

	/**
	 * @hidden
	 */
	private _Handle_return(invoke: IReturn): void
	{
		// GET THE PROMISE OBJECT
		let it = this.promises_.find(invoke.uid);
		if (it.equals(this.promises_.end()))
			return;

		// RETURNS
		let func: Function = invoke.success 
			? it.second.first 
			: it.second.second;
		this.promises_.erase(it);
		
		func(invoke.value); 
	}

	/**
	 * @hidden
	 */
	private _Send_return(uid: number, flag: boolean, val: any): void
	{
		// SPECIAL LOGIC FOR ERROR -> FOR CLEAR JSON ENCODING
		if (flag === false && val instanceof Error)
		{
			let obj = JSON.parse(JSON.stringify(val));
			obj.name = val.name;
			obj.message = val.message;

			val = obj;
		}

		// RETURNS
		let ret: IReturn = {uid: uid, success: flag, value: val};
		this.sender(ret);
	}
}