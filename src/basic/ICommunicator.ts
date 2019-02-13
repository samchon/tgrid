import { Driver } from "./Driver";

export interface ICommunicator<Provider>
{
    /* ----------------------------------------------------------------
        COMPONENTS
    ---------------------------------------------------------------- */
    /**
     * Current `Provider`.
     * 
     * An object providing features (functions & objects) for remote system. The remote 
     * system would call the features (`Provider`) by using its `Driver<Controller>`.
     */
    readonly provider: Provider;

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
    getDriver<Controller extends object>(): Driver<Controller>;

    /* ----------------------------------------------------------------
        JOINERS
    ---------------------------------------------------------------- */
    /**
     * Join connection.
     */
    join(): Promise<void>;

    /**
     * Join connection or timeout.
     * 
     * @param ms The maximum milliseconds for joining.
     * @return Whether awaken by disconnection or timeout.
     */
    join(ms: number): Promise<boolean>;

    /**
     * Join connection or time expiration.
     * 
     * @param at The maximum time point to join.
     * @return Whether awaken by disconnection or time expiration.
     */
    join(at: Date): Promise<boolean>;
}