import fs from "fs";
import puppeteer from "puppeteer";
import chalk from "chalk";

let id = 8511;
let links_arr = [];
let links_copy = [];
let browser;
let page;
let temp = [];
let strObj = {};
let str = "";

// Function for getting the links of various anime quotes page and storing it in links.csv file.
const getAMPagesLink = async (url) => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	await page.goto(url);

	// Set screen size
	await page.setViewport({ width: 1080, height: 1024 });

	await page.waitForSelector(".row.align-center>div>div:nth-child(2)>div");
	// const grid = await page.evaluate(() => {
	// 	let arr = Array.from(
	// 		document.querySelectorAll(".row.align-center>div>div:nth-child(2)>div")
	// 	);
	// })
	const grid = await page.$$(".row.align-center>div>div:nth-child(2)>div");
	for (const link of grid) {
		let temp = await page.evaluate(
			(el) =>
				el.querySelectorAll("div .col-inner > a")?.[0].getAttribute("href"),
			link
		);
		if (!temp.includes("porn" || !temp.includes("like-danmachi"))) {
			links_arr.push(temp);
			links_copy.push(temp);
		}
	}
	fs.appendFile("links.csv", links_arr.join("\n"), function (err) {
		if (err) return console.log(err);
		console.log(
			chalk.blue("Links") +
				" added to " +
				chalk.underline.green("link.csv") +
				" file"
		);
	});
	links_arr = [];

	await browser.close();
};

// Maybe replacing this with the while loop would be better approach, breaking when page evaluates to null.
for (let i = 1; i < 15; i++) {
	await getAMPagesLink(`https://animemotivation.com/category/quotes/page/${i}/`);
}

for (let i = 0; i < links_copy.length; i++) {
	try {
		browser = await puppeteer.launch();
		page = await browser.newPage();
		await page.goto(links_copy[i]);
		await page.setViewport({ width: 1080, height: 1024 });
		await page.waitForSelector("blockquote");
		const blocks = await page.$$("blockquote");
		for (let i = 0; i < blocks.length; i++) {
			str = await page.evaluate((el) => el?.innerText, blocks[i]);
			if (str?.length) {
				strObj = {
					quote: str?.split(" – ")[0],
					name: str?.split(" – ")[1],
					id: id,
				};
				temp.push(strObj);
				id++;
			}
		}
		console.log(
			chalk.blue("Pushed quotes to text file. ") +
				chalk.underline.green("New number of quotes " + temp.length)
		);
	} catch (err) {
		console.log(
			chalk.redBright(err) +
				" occured at link number -------> " +
				chalk.green.bgCyan(i)
		);
		console.log(chalk.greenBright("Retrying the same link."));
	}
	await browser.close();
}

// console.log("Length---->", temp.length);
fs.appendFile("quotes.text", JSON.stringify(temp, null, 2), function (err) {
	if (err)
		return console.log(
			chalk.red("Error occured while writing to text file--->", err)
		);
	console.log(chalk.bold.green("Quotes push to quotes.text file\n"));
});
