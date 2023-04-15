import fs from "fs";
import puppeteer from "puppeteer";
import chalk from "chalk";

// const arr = ['1', '2', '3']

// fs.appendFile("helloworld.csv", arr.join(','), function (err) {
// 	if (err) return console.log(err);
// 	console.log("Wrote Hello World in file helloworld.txt, just check it");
// });

//document.querySelectorAll('.row.align-center>div>div:nth-child(2)>div')
let links_arr = [];
let links_copy = [];

const getPagesLink = async (url) => {
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
		if (!temp.includes("porn" || !temp.includes('like-danmachi'))) {
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

// getPagesLink("https://animemotivation.com/category/quotes/page/3/");

for (let i = 1; i < 15; i++) {
	await getPagesLink(`https://animemotivation.com/category/quotes/page/${i}/`);
}

for (let i = 0; i < links_copy.length; i++) {
	try {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.goto(links_copy[i]);
		await page.setViewport({ width: 1080, height: 1024 });
		await page.waitForSelector("blockquote");
		const blocks = await page.$$("blockquote");
		let temp = [];
		for (let i = 0; i < blocks.length; i++) {
			temp.push(await page.evaluate((el) => el.innerText, blocks[i]));
		}
		console.log(temp, temp.length);
		fs.appendFile("quotes.csv", temp.join("\n"), function (err) {
			if (err) return console.log(chalk.red("Error Occured--->", err));
			console.log(
				chalk.yellow("\n*************************************\n") +
					chalk.bold.green("\nQuotes push to quotes.csv file\n") +
					chalk.yellow("\n*************************************\n")
			);
		});
		console.log('-----Closing browser-----')
		await browser.close();
	} catch (err) {
		console.log(chalk.redBright(err) + ' occured at ' + chalk.green.bgCyan(i))
	}
}
