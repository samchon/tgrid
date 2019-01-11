import * as fs from "fs";

const PATH = __dirname;

async function iterate(path: string, level: number = 0): Promise<void>
{
    let file_list: string[] = fs.readdirSync(path);
    for (let file of file_list)
    {
        let current_path: string = path + "/" + file;
        let stat: fs.Stats = fs.lstatSync(current_path);
        
        if (stat.isDirectory() === true)
        {
            if (file !== "browser" && file !== "internal")
                await iterate(current_path, level + 1);
            continue;
        }
        else if (file.substr(-3) !== ".js" || level === 0)
            continue;

        let external: any = await import(current_path);
        for (let key in external)
            if (key.substr(0, 5) === "test_")
            {
                console.log(key);
                await external[key]();
            }
    }
}

async function main(): Promise<void>
{
    await iterate(PATH);
}
main().then(() =>
{
    console.log("Success");
}).catch(e =>
{
    console.log(e);
    process.exit(1);
});