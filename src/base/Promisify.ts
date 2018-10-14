export type Promisify<T extends object> =
{
	[P in keyof T]: T[P] extends (...args: any[]) => any
		? PromisifyFunc<T[P]>
		: T[P] extends Object
			? Promisify<T[P]>
			: T[P];
}

type PromisifyFunc<T extends (...args: any[]) => any> =
	T extends (...args: infer Params) => infer Ret
		? Ret extends Promise<any>
			? (...args: Params) => Ret
			: (...args: Params) => Promise<Ret>
		: never;