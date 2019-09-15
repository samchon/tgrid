//================================================================ 
/** @module tgrid.protocols */
//================================================================
import { ConditionVariable } from "tstl/thread/ConditionVariable";

export interface IJoinable
{
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

/**
 * @hidden
 */
export namespace Joinable
{
    export async function join(cv: ConditionVariable, error: Error | null, param?: number | Date): Promise<void|boolean>
    {
        if (error)
            throw error;

        // FUNCTION OVERLOADINGS
        if (param === undefined)
            await cv.wait();
        else if (param instanceof Date)
            return await cv.wait_until(param);
        else
            return await cv.wait_for(param);
    }
}