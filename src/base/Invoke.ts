//================================================================ 
/** @module tgrid.base */
//================================================================
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

/**
 * @hiden
 */
interface IBase
{
	uid: number;
}
