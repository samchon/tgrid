//================================================================ 
/** @module tgrid.basic */
//================================================================
/**
 * Message for RFC (Remote Function Call).
 * 
 * @author Jeongho Nam <http://samchon.org>
 */
export type Invoke = Invoke.IFunction | Invoke.IReturn;

export namespace Invoke
{
	/**
	 * Message for Requesting RFC.
	 */
	export interface IFunction<Params extends any[] = any[]>
		extends IBase
	{
		/**
		 * Target function (sometimes calsuled in objects) to call.
		 */
		listener: string;

		/**
		 * Parameters for the function call.
		 */
		parameters: Params;
	}

	/**
	 * Message for Returning RFC.
	 */
	export interface IReturn<T = any>
		extends IBase
	{
		/**
		 * `true` -> return, `false` -> exception.
		 */
		success: boolean;

		/**
		 * Returned value or thrown exception.
		 */
		value: T;
	}

	/**
	 * @hiden
	 */
	interface IBase
	{
		/**
		 * Unique identifier.
		 */
		uid: number;
	}
}