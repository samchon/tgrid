export function complete(): void
{
    let url: string = self.location.href;
    let symbol: number = url.indexOf("#");
    if (symbol !== -1)
        url = url.substr(0, symbol);

    self.location.href = url + "#complete";
}