import { ConditionVariable, HashMap, HashSet } from "tstl";

import { Driver } from "../typings/Driver";
import { serializeError } from "../utils/internal/serializeError";
import { Invoke } from "./Invoke";
import { InvokeEvent } from "./InvokeEvent";

/**
 * The basic communicator.
 *
 * The `Communicator` is an abstract class taking full charge of network communication.
 * Protocolized communicators like {@link WebSocketConnector} are realized by extending this
 * `Communicator` class.
 *
 * You want to make your own communicator using special protocol, extends this `Communicator`
 * class. After the extending, implement your special communicator by overriding those methods.
 *
 *   - {@link inspectReady}
 *   - {@link replyData}
 *   - {@link sendData}
 *
 * @template Provider Type of features provided for remote system.
 * @template Remote Type of features supported by remote system, used for {@link getDriver} function.
 * @author Jeongho Nam - https://github.com/samchon
 */
export abstract class Communicator<
  Provider extends object | null | undefined,
  Remote extends object | null,
> {
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
  private driver_: Driver<object, true | false>;

  /**
   * @hidden
   */
  private promises_: HashMap<number, IFunctionReservation>;

  /**
   * @hidden
   */
  private event_listeners_: HashMap<
    InvokeEvent.Type,
    HashSet<(event: InvokeEvent) => void>
  >;

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
  protected constructor(provider: Provider) {
    // PROVIDER & DRIVER
    this.provider_ = provider;
    this.driver_ = new Proxy<object>(new Driver(), {
      get: ({}, name: string) => {
        if (name === "then") return null;
        else return this._Proxy_func(name);
      },
    }) as any;

    // OTHER MEMBERS
    this.promises_ = new HashMap();
    this.join_cv_ = new ConditionVariable();
    this.event_listeners_ = new HashMap();
  }

  /**
   * Add invoke event listener.
   *
   * Add an event listener for the invoke event. The event listener would be called
   * when some invoke event has been occured; sending, receiving, completing, or returning.
   *
   * If you change the requesting parameters or returning value in the event listener,
   * it would affect to the RPC (Remote Procedure Call) communication. Therefore, you have
   * to be careful when modifying the remote function calling.
   *
   * Of course, you can utilize the event listener just for monitoring the RPC events.
   *
   * @param type Type of the event
   * @param listener The listener function to enroll
   */
  public on<Type extends InvokeEvent.Type>(
    type: Type,
    listener: (event: InvokeEvent.EventMapper[Type]) => void,
  ): void {
    this.event_listeners_
      .take(type, () => new HashSet())
      .insert(listener as (event: InvokeEvent) => void);
  }

  /**
   * Erase invoke event listener.
   *
   * Erase an event listener from the invoke event. The event listener would not be
   * called anymore when the specific invoke event has been occured.
   *
   * @param type Type of the event
   * @param listener The listener function to erase
   */
  public off<Type extends InvokeEvent.Type>(
    type: Type,
    listener: (event: InvokeEvent.EventMapper[Type]) => void,
  ): void {
    const it = this.event_listeners_.find(type);
    if (it.equals(this.event_listeners_.end()) === false)
      it.second.erase(listener as (event: InvokeEvent) => void);
    if (it.second.empty()) this.event_listeners_.erase(it);
  }

  /**
   * Destroy the communicator.
   *
   * A destroy function must be called when the network communication has been closed.
   * It would destroy all function calls in the remote system (by `Driver<Controller>`),
   * which are not returned yet.
   *
   * The *error* instance would be thrown to those function calls. If the disconnection is
   * abnormal, then write the detailed reason why into the *error* instance.
   *
   * @param error An error instance to be thrown to the unreturned functions.
   */
  protected async destructor(error?: Error): Promise<void> {
    // REJECT UNRETURNED FUNCTIONS
    const rejectError: Error = error
      ? error
      : new Error("Connection has been closed.");

    for (const entry of this.promises_) {
      const reject: FunctionLike = entry.second.reject;
      reject(rejectError);
    }

    // CLEAR PROMISES
    this.promises_.clear();

    // RESOLVE JOINERS
    await this.join_cv_.notify_all();
  }

  /**
   * A predicator inspects whether the *network communication* is on ready.
   *
   * @param method The method name for tracing.
   */
  protected abstract inspectReady(method: string): Error | null;

  /**
   * @hidden
   */
  private _Proxy_func(name: string): FunctionLike {
    const func = (...params: any[]) => this._Call_function(name, ...params);
    return new Proxy(func, {
      get: ({}, newName: string) => {
        if (newName === "bind")
          return (thisArg: any, ...args: any[]) => func.bind(thisArg, ...args);
        else if (newName === "call")
          return (thisArg: any, ...args: any[]) => func.call(thisArg, ...args);
        else if (newName === "apply")
          return (thisArg: any, args: any[]) => func.apply(thisArg, args);
        return this._Proxy_func(`${name}.${newName}`);
      },
    });
  }

  /**
   * @hidden
   */
  private _Call_function(name: string, ...params: any[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      // READY TO SEND ?
      const error: Error | null = this.inspectReady(
        "Communicator._Call_fuction",
      );
      if (error) {
        reject(error);
        return;
      }

      // CONSTRUCT INVOKE MESSAGE
      const invoke: Invoke.IFunction = {
        uid: ++Communicator.SEQUENCE,
        listener: name,
        parameters: params.map((p) => ({
          type: typeof p,
          value: p,
        })),
      };

      // CALL EVENT LISTENERS
      const eventSetIterator = this.event_listeners_.find("send");
      if (eventSetIterator.equals(this.event_listeners_.end()) === false) {
        const event: InvokeEvent.ISend = {
          type: "send",
          time: new Date(),
          function: invoke,
        };
        for (const listener of eventSetIterator.second)
          try {
            listener(event);
          } catch {}
      }

      // DO SEND WITH PROMISE
      this.promises_.emplace(invoke.uid, {
        function: invoke,
        time: new Date(),
        resolve,
        reject,
      });
      await this.sendData(invoke);
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
  public setProvider(obj: Provider): void {
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
  public getProvider(): Provider {
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
   * @template Controller An interface for provided features (functions & objects) from the remote system (`Provider`).
   * @template UseParametric Whether to convert type of function parameters to be compatible with their primitive.
   * @return A Driver for the RFC.
   */
  public getDriver<
    Controller extends NonNullable<Remote> = NonNullable<Remote>,
    UseParametric extends boolean = false,
  >(): Driver<Controller, UseParametric> {
    return this.driver_ as Driver<Controller, UseParametric>;
  }

  /**
   * Join connection.
   *
   * Wait until the connection to be closed.
   */
  public join(): Promise<void>;

  /**
   * Join connection or timeout.
   *
   * Wait until the connection to be closed until timeout.
   *
   * @param ms The maximum milliseconds for joining.
   * @return Whether awaken by disconnection or timeout.
   */
  public join(ms: number): Promise<boolean>;

  /**
   * Join connection or time expiration.
   *
   * Wait until the connection to be closed until time expiration.
   *
   * @param at The maximum time point to join.
   * @return Whether awaken by disconnection or time expiration.
   */
  public join(at: Date): Promise<boolean>;

  public async join(param?: number | Date): Promise<void | boolean> {
    // IS JOINABLE ?
    const error: Error | null = this.inspectReady(
      `${this.constructor.name}.join`,
    );
    if (error) throw error;

    // FUNCTION OVERLOADINGS
    if (param === undefined) await this.join_cv_.wait();
    else if (param instanceof Date)
      return await this.join_cv_.wait_until(param);
    else return await this.join_cv_.wait_for(param);
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
  protected replyData(invoke: Invoke): void {
    if ((invoke as Invoke.IFunction).listener)
      this._Handle_function(invoke as Invoke.IFunction).catch(() => {});
    else this._Handle_complete(invoke as Invoke.IReturn);
  }

  /**
   * @hidden
   */
  private async _Handle_function(invoke: Invoke.IFunction): Promise<void> {
    const uid: number = invoke.uid;
    const time: Date = new Date();

    try {
      //----
      // FIND FUNCTION
      //----
      if (this.provider_ === undefined)
        // PROVIDER MUST BE
        throw new Error(
          `Error on Communicator._Handle_function(): the provider is not specified yet.`,
        );
      else if (this.provider_ === null)
        throw new Error(
          "Error on Communicator._Handle_function(): the provider would not be.",
        );

      // FIND FUNCTION (WITH THIS-ARG)
      let func: FunctionLike = this.provider_ as any;
      let thisArg: any = undefined;

      const routes: string[] = invoke.listener.split(".");
      for (const name of routes) {
        thisArg = func;
        func = thisArg[name];

        // SECURITY-ERRORS
        if (name[0] === "_")
          throw new Error(
            `Error on Communicator._Handle_function(): RFC does not allow access to a member starting with the underscore: Provider.${invoke.listener}()`,
          );
        else if (name[name.length - 1] === "_")
          throw new Error(
            `Error on Communicator._Handle_function(): RFC does not allow access to a member ending with the underscore: Provider.${invoke.listener}().`,
          );
        else if (name === "toString" && func === Function.toString)
          throw new Error(
            `Error on Communicator._Handle_function(): RFC on Function.toString() is not allowed: Provider.${invoke.listener}().`,
          );
        else if (name === "constructor" || name === "prototype")
          throw new Error(
            `Error on Communicator._Handle_function(): RFC does not allow access to ${name}: Provider.${invoke.listener}().`,
          );
      }
      func = func.bind(thisArg);

      // CALL EVENT LISTENERS
      const eventSetIterator: HashMap.Iterator<
        InvokeEvent.Type,
        HashSet<(event: InvokeEvent) => void>
      > = this.event_listeners_.find("receive");
      if (eventSetIterator.equals(this.event_listeners_.end()) === false) {
        const event: InvokeEvent.IReceive = {
          type: "receive",
          time,
          function: invoke,
        };
        for (const closure of eventSetIterator.second)
          try {
            closure(event);
          } catch {}
      }

      //----
      // RETURN VALUE
      //----
      // CALL FUNCTION
      const parameters: any[] = invoke.parameters.map((p) => p.value);
      const result: any = await func(...parameters);
      await this._Send_return({
        invoke,
        time,
        return: {
          uid,
          success: true,
          value: result,
        },
      });
    } catch (exp) {
      await this._Send_return({
        invoke,
        time,
        return: {
          uid,
          success: false,
          value: exp,
        },
      });
    }
  }

  /**
   * @hidden
   */
  private _Handle_complete(invoke: Invoke.IReturn): void {
    // FIND TARGET FUNCTION CALL
    const it = this.promises_.find(invoke.uid);
    if (it.equals(this.promises_.end())) return;

    // CALL EVENT LISTENERS
    const eventSetIterator = this.event_listeners_.find("complete");
    if (eventSetIterator.equals(this.event_listeners_.end()) === false) {
      const event: InvokeEvent.IComplete = {
        type: "complete",
        function: it.second.function,
        return: invoke,
        requested_at: it.second.time,
        completed_at: new Date(),
      };
      for (const closure of eventSetIterator.second)
        try {
          closure(event);
        } catch {}
    }

    // RETURNS
    const func: FunctionLike = invoke.success
      ? it.second.resolve
      : it.second.reject;
    this.promises_.erase(it);
    func(invoke.value);
  }

  /* ----------------------------------------------------------------
    SENDER
  ---------------------------------------------------------------- */
  /**
   * A function sending data to the remote system.
   *
   * @param invoke Structured data to send.
   */
  protected abstract sendData(invoke: Invoke): Promise<void>;

  /**
   * @hidden
   */
  private async _Send_return(props: {
    invoke: Invoke.IFunction;
    return: Invoke.IReturn;
    time: Date;
  }): Promise<void> {
    const eventSet = this.event_listeners_.find("return");
    if (eventSet.equals(this.event_listeners_.end()) === false) {
      const event: InvokeEvent.IReturn = {
        type: "return",
        function: props.invoke,
        return: props.return,
        requested_at: props.time,
        completed_at: new Date(),
      };
      for (const closure of eventSet.second)
        try {
          closure(event);
        } catch {}
    }

    // SPECIAL LOGIC FOR ERROR -> FOR CLEAR JSON ENCODING
    if (props.return.success === false && props.return.value instanceof Error)
      props.return.value = serializeError(props.return.value);

    // RETURNS
    await this.sendData(props.return);
  }
}

type FunctionLike = (...args: any[]) => any;
interface IFunctionReservation {
  function: Invoke.IFunction;
  time: Date;
  resolve: FunctionLike;
  reject: FunctionLike;
}
