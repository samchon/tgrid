export type Invoke = IFunction | IReturn;

export interface IFunction<Params extends any[] = any[]>
	extends IBase
{
	name: string;
	params: Params;
}

export interface IReturn<T = any>
	extends IBase
{
	success: boolean;
	value: T;
}

interface IBase
{
	uid: number;
}
