export function once<Func>(handler: Func): Func
{
    let called: boolean = false;
    let ret: any = undefined;

    return ((...args: any) =>
    {
        if (called === false)
        {
            ret = (handler as any)(...args);
            called = true;
        }
        return ret;
    }) as any;
}