import * as puppeteer from "puppeteer";
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
	});
}

async function _Paginate(browser: puppeteer.Browser, url: string): Promise<void>
{
	console.log("\t" + url);
	url = ROOT + "/" + url;

	let page = await browser.newPage();	
	await page.goto(url);
	await _Test_page(page);
}

async function main(): Promise<void>
{
	//----
	// PREPARE SERVER & BROWSER
	//----
	let server = new HttpServer();
	server = server.listen
	({
		directory: __dirname + "/../bundle",
		port: 37792
	});
	let browser = await puppeteer.launch({ devtools: true });

	//----
	// TEST PAGES
	//----
	// WEB
	await import(__dirname + "/browser/web-server.js");
	await _Paginate(browser, "web.html");

	// WORKERS
	await _Paginate(browser, "worker.html");
	await _Paginate(browser, "shared-worker.html");

	//----
	// TERMINATES
	//----
	await browser.close();
	server.close();
}
main();