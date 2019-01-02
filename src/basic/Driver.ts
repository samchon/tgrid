//================================================================ 
/** @module tgrid.basic */
//================================================================
/**
 * Driver for remote controller.
 * 
 * @tparam Controller A controller defining features provided from the remote system.
 */
export type Driver<Controller extends object> = Promisify<Controller>;
export var Driver = Proxy;

/**
 * Promisify an object type.
 * 
 * It promisifies all member types. When a member type is:
 *   - function: returns `Promise` (`R` -> `Promise<R>`).
 *   - object: promisifies recursively (`O` -> `Promisify<O>`).
 *   - atomic value: be ignored (be `never` type).
 * 
 * @tparam Instance An object type to be promisied.
 */
export type Promisify<Instance extends object> = 
	// IS FUNCTION?
	Instance extends Function
		? Instance extends (...args: infer Params) => infer Ret
			? Ret extends Promise<any>
				? (...args: Params) => Ret
				: (...args: Params) => Promise<Ret>
			: (...args: any[]) => Promise<any>
	: 
	{ // IS OBJECT?
		[P in keyof Instance]: Instance[P] extends object
			? Promisify<Instance[P]>
			: never;
	};