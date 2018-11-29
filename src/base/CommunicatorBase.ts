//================================================================ 
/** @module tgrid.base */
//================================================================
import { HashMap } from "tstl/container/HashMap";
import { Pair } from "tstl/utility/Pair";
import { ConditionVariable } from "tstl/thread/ConditionVariable";
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

	/**
	 * @hidden
	 */
	private joiners_: ConditionVariable;

	/* ----------------------------------------------------------------
		CONSTRUCTORS
	---------------------------------------------------------------- */
	/**
	 * @hidden
	 */
	protected constructor(provider: Provider = null)
	{
		this.provider_ = provider;

		this.promises_ = new HashMap();
		this.joiners_ = new ConditionVariable();
	}

	/**
	 * @hidden
	 */
	protected async destructor(error?: Error): Promise<void>
	{
		// REJECT UNRETURNED FUNCTIONS
		let rejectError: Error = error 
			? error 
			: new RuntimeError("Connection has been closed.");
		
		for (let entry of this.promises_)
		{
			let reject: Function = entry.second.second;
			reject(rejectError);
		}

		// RESOLVE JOINERS
		this.joiners_.notify_all();
		
		// CLEAR PROMISES
		this.promises_.clear();
	}

	/* ----------------------------------------------------------------
		EVENT HANDLERS
	---------------------------------------------------------------- */
	/**
	 * Join connection.
	 */
	public join(): Promise<void>;

	/**
	 * Join connection or timeout.
	 * 
	 * @param ms The maximum milliseconds for joining.
	 * @return Whether awaken by disconnection or timeout.
	 */
	public join(ms: number): Promise<boolean>;

	/**
	 * Join connection or time expiration.
	 * 
	 * @param at The maximum time point to join.
	 * @return Whether awaken by disconnection or time expiration.
	 */
	public join(at: Date): Promise<boolean>;

	public join(param?: number | Date): Promise<void|boolean>
	{
		if (param === undefined)
			return this.joiners_.wait();
		else if (param instanceof Date)
			return this.joiners_.wait_until(param);
		else
			return this.joiners_.wait_for(param);
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
			this.promises_.emplace(invoke.uid, new Pair(resolve, reject));
			this.sender(invoke);
		});
	}

	/**
	 * @hidden
	 */
	protected abstract inspector(): Error;

	/* ----------------------------------------------------------------
		COMMUNICATORS
	---------------------------------------------------------------- */
	/**
	 * @hidden
	 */
	protected abstract sender(invoke: Invoke): void;

	/**
	 * @hidden
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