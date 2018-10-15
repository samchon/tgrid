/**
 * Promisify an object type.
 * 
 * It promisifies all member types. When a member type is:
 *   - function: returns `Promise` (`R` -> `Promise<R>`).
 *   - object: promisifies recursively (`O` -> `Promisify<O>`).
 *   - atomic value: be ignored (be `never` type).
 * 
 * @tparam T An object type to be promisied.
 */
export type Promisify<T extends object> =
{
	[P in keyof T]: T[P] extends (...args: any[]) => any
		? PromisifyFunc<T[P]>
		: T[P] extends object
			? Promisify<T[P]>
			: never;
}

type PromisifyFunc<T extends (...args: any[]) => any> =
	T extends (...args: infer Params) => infer Ret
		? Ret extends Promise<any>
			? (...args: Params) => Ret
			: (...args: Params) => Promise<Ret>
		: never;