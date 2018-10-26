/**
 * Driver for controller.
 */
export type Driver<Controller extends object> = Promisify<Controller>;

/**
 * Promisify an object type.
 * 
 * It promisifies all member types. When a member type is:
 *   - function: returns `Promise` (`R` -> `Promise<R>`).
 *   - object: promisifies recursively (`O` -> `Promisify<O>`).
 *   - atomic value: be ignored (be `never` type).
 * 
 * @tparam Controller An object type to be promisied.
 */
export type Promisify<Controller extends object> =
{
	[P in keyof Controller]: Controller[P] extends (...args: any[]) => any
		? PromisifyFunc<Controller[P]>
		: Controller[P] extends object
			? Promisify<Controller[P]>
			: never;
}

/**
 * @hidden
 */
type PromisifyFunc<T extends (...args: any[]) => any> =
	T extends (...args: infer Params) => infer Ret
		? Ret extends Promise<any>
			? (...args: Params) => Ret
			: (...args: Params) => Promise<Ret>
		: never;