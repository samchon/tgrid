import puppeteer from "puppeteer";
const HttpServer = require("local-web-server");

const PORT = 37792;
const ROOT = "http://127.0.0.1:" + PORT;

function _Test_page(page: puppeteer.Page): Promise<void>
{
    return new Promise((resolve, reject) =>
    {
        page.on("framenavigated", <any>resolve);
        page.on("close", resolve);
        page.on("pageerror", reject);
        // page.on("console", msg =>
        // {
        //     console.log(msg.text());
        // });
    });
}

async function _Paginate(browser: puppeteer.Browser, url: string): Promise<void>
{
    console.log("\t" + url);
    url = ROOT + "/" + url;

    const page = await browser.newPage();    
    await page.goto(url);
    await _Test_page(page);
}

async function main(): Promise<void>
{
    //----
    // PREPARE SERVER & BROWSER
    //----
    const server = new HttpServer().listen
    ({
        directory: __dirname + "/../../../bundle",
        port: 37792
    });
    const browser = await puppeteer.launch({ devtools: true });

    //----
    // TEST PAGES
    //----
    // WEB
    try
    {
        await import(__dirname + "/web-server.js");
        await _Paginate(browser, "web.html");

        // WORKERS
        await _Paginate(browser, "worker.html");
        await _Paginate(browser, "shared-worker.html");
    }
    catch (exp)
    {
        console.log("An error has occured");
        console.log(exp);
        process.exit(-1);
    }

    //----
    // TERMINATES
    //----
    await browser.close();
    server.close();
}
main();