export function complete(): void
{
    let url: string = self.location.href;
    const symbol: number = url.indexOf("#");
    if (symbol !== -1)
        url = url.substr(0, symbol);

    self.location.href = url + "#complete";
}