//================================================================ 
/** @module tgrid.components */
//================================================================
import { Driver } from "./Driver";
import { Invoke } from "./Invoke";

import { Pair } from "tstl/utility/Pair";
import { HashMap } from "tstl/container/HashMap";
import { ConditionVariable } from "tstl/thread/ConditionVariable";
import { Exception, DomainError, RuntimeError } from "tstl/exception";

import serializeError = require("serialize-error");

/**
 * The basic communicator.
 * 
 * The `Communicator` is an abstract class taking full charge of network communication. 
 * Protocolized communicators like {@link WebConnector} are realized by extending this 
 * `Communicator` class.
 * 
 * You want to make your own communicator using special protocol, extends this `Communicator` 
 * class. After the extending, implement your special communicator by overriding those methods.
 * 
 *   - {@link inspectReady}
 *   - {@link replyData}
 *   - {@link sendData}
 * 
 * @typeParam Provider Type of features provided for remote system.
 * @author Jeongho Nam <http://samchon.org>
 */
export abstract class Communicator<Provider>
{
    /**
     * @hidden
     */
    private static SEQUENCE: number = 0;

    /**
     * @hidden
     */
    protected provider_: Provider;

    /**
     * @hidden
     */
    private driver_: Driver<object>;

    /**
     * @hidden
     */
    private promises_: HashMap<number, Pair<Function, Function>>;

    /**
     * @hidden
     */
    private join_cv_: ConditionVariable;

    /* ----------------------------------------------------------------
        CONSTRUCTORS
    ---------------------------------------------------------------- */
    /**
     * Initializer Constructor.
     * 
     * @param provider An object providing features for remote system.
     */
    protected constructor(provider: Provider)
    {
        // PROVIDER & DRIVER
        this.provider_ = provider;
        this.driver_ = new Proxy({},
        {
            get: ({}, name: string) =>
            {
                if (name === "then")
                    return null;
                else
                    return this._Proxy_func(name);
            }
        });

        // OTHER MEMBERS
        this.promises_ = new HashMap();
        this.join_cv_ = new ConditionVariable();
    }

    /**
     * Destory the communicator.
     * 
     * A destory function must be called when the network communication has been closed. 
     * It would destroy all function calls in the remote system (by `Driver<Controller>`), 
     * which are not returned yet.
     * 
     * The *error* instance would be thrown to those function calls. If the disconnection is 
     * abnormal, then write the detailed reason why into the *error* instance.
     * 
     * @param error An error instance to be thrown to the unreturned functions.
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
        
        // CLEAR PROMISES
        this.promises_.clear();

        // RESOLVE JOINERS
        await this.join_cv_.notify_all();
    }

    /**
     * A predicator inspects whether the *network communication* is on ready.
     */
    protected abstract inspectReady(): Error | null;

    /**
     * @hidden
     */
    private _Proxy_func(name: string): Function
    {
        let func = (...params: any[]) => this._Call_function(name, ...params);

        return new Proxy(func, 
        {
            get: ({}, newName: string) =>
            {
                if (newName === "bind")
                    return (thisArg: any, ...args: any[]) => func.bind(thisArg, ...args);
                else if (newName === "call")
                    return (thisArg: any, ...args: any[]) => func.call(thisArg, ...args);
                else if (newName === "apply")
                    return (thisArg: any, args: any[]) => func.apply(thisArg, args);

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
            let error: Error | null = this.inspectReady();
            if (error)
            {
                reject(error);
                return;
            }

            // CONSTRUCT INVOKE MESSAGE
            let invoke: Invoke.IFunction =
            {
                uid: ++Communicator.SEQUENCE,
                listener: name,
                parameters: params.map(p => ({
                    type: typeof p,
                    value: p
                }))
            };

            // DO SEND WITH PROMISE
            this.promises_.emplace(invoke.uid, new Pair(resolve, reject));
            this.sendData(invoke);
        });
    }

    /* ----------------------------------------------------------------
        ACCESSORS
    ---------------------------------------------------------------- */
    /**
     * Set `Provider`
     * 
     * @param obj An object would be provided for remote system.
     */
    public setProvider(obj: Provider): void
    {
        this.provider_ = obj;
    }

    /**
     * Get current `Provider`.
     * 
     * Get an object providing features (functions & objects) for remote system. The remote 
     * system would call the features (`Provider`) by using its `Driver<Controller>`.
     * 
     * @return Current `Provider` object
     */
    public getProvider(): Provider
    {
        return this.provider_;
    }

    /**
     * Get Driver for RFC (Remote Function Call).
     * 
     * The `Controller` is an interface who defines provided functions from the remote 
     * system. The `Driver` is an object who makes to call remote functions, defined in 
     * the `Controller` and provided by `Provider` in the remote system, possible.
     * 
     * In other words, calling a functions in the `Driver<Controller>`, it means to call 
     * a matched function in the remote system's `Provider` object.
     * 
     *   - `Controller`: Definition only
     *   - `Driver`: Remote Function Call
     * 
     * @typeParam Controller An interface for provided features (functions & objects) from the remote system (`Provider`).
     * @return A Driver for the RFC.
     */
    public getDriver<Controller extends object>(): Driver<Controller>
    {
        return this.driver_ as Driver<Controller>;
    }

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

    public async join(param?: number | Date): Promise<void|boolean>
    {
        // IS JOINABLE ?
        let error: Error | null = this.inspectReady();
        if (error)
            throw error;

        // FUNCTION OVERLOADINGS
        if (param === undefined)
            await this.join_cv_.wait();
        else if (param instanceof Date)
            return await this.join_cv_.wait_until(param);
        else
            return await this.join_cv_.wait_for(param);
    }

    /* ================================================================
        COMMUNICATORS
            - REPLIER
            - SENDER
    ===================================================================
        REPLIER
    ---------------------------------------------------------------- */
    /**
     * Data Reply Function.
     * 
     * A function should be called when data has come from the remote system.
     * 
     * When you receive a message from the remote system, then parse the message with your 
     * special protocol and covert it to be an *Invoke* object. After the conversion, call 
     * this method.
     * 
     * @param invoke Structured data converted by your special protocol.
     */
    protected replyData(invoke: Invoke): void
    {
        if ((invoke as Invoke.IFunction).listener)
            this._Handle_function(invoke as Invoke.IFunction);
        else
            this._Handle_return(invoke as Invoke.IReturn);
    }

    /**
     * @hidden
     */
    private async _Handle_function(invoke: Invoke.IFunction): Promise<void>
    {
        let uid: number = invoke.uid;

        try
        {
            //----
            // FIND FUNCTION
            //----
            if (this.provider_ === undefined) // PROVIDER MUST BE
                throw new RuntimeError("Provider is not specified yet.");
            else if (this.provider_ === null)
                throw new DomainError("No provider.");

            // let ret = await eval(`this.provider_.${invoke.listener}(...invoke.parameters)`);
            // this._Send_return(invoke.uid, true, ret);

            // FIND FUNCTION (WITH THIS-ARG)
            let func: Function = this.provider_ as any;
            let thisArg: any = undefined;

            let routes: string[] = invoke.listener.split(".");
            for (let name of routes)
            {
                thisArg = func;
                func = thisArg[name];
            }
            func = func.bind(thisArg);

            //----
            // RETURN VALUE
            //----
            // CALL FUNCTION
            let parameters: any[] = invoke.parameters.map(p => p.value);
            let ret: any = await func(...parameters);

            this._Send_return(uid, true, ret);
        }
        catch (exp)
        {
            this._Send_return(uid, false, exp);
        }
    }

    /**
     * @hidden
     */
    private _Handle_return(invoke: Invoke.IReturn): void
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

    /* ----------------------------------------------------------------
        SENDER
    ---------------------------------------------------------------- */
    /**
     * A function sending data to the remote system.
     */
    protected abstract sendData(invoke: Invoke): void;

    /**
     * @hidden
     */
    private _Send_return(uid: number, flag: boolean, val: any): void
    {
        // SPECIAL LOGIC FOR ERROR -> FOR CLEAR JSON ENCODING
        if (flag === false && val instanceof Error)
        {
            if ((val as Exception).toJSON instanceof Function)
                val = (val as Exception).toJSON();
            else
                val = serializeError(val);
        }

        // RETURNS
        let ret: Invoke.IReturn = {
            uid: uid, 
            success: flag, 
            value: val
        };
        this.sendData(ret);
    }
}