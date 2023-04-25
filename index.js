import fs from "fs";
import puppeteer, { Page } from "puppeteer";
import chalk from "chalk";

let id = 8511;
let links_arr = [];
let links_copy = [];
let browser;
let page;
let temp = [];
let strObj = {};
let str = "";
let char = new Map();
let tempStr = "";

// Function for getting the links of various anime quotes page and storing it in links.csv file.
const getAMPagesLink = async (url) => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	await page.goto(url);

	// Set screen size
	await page.setViewport({ width: 1080, height: 1024 });

	await page.waitForSelector(".row.align-center>div>div:nth-child(2)>div");
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
	await getAMPagesLink(
		`https://animemotivation.com/category/quotes/page/${i}/`
	);
}

const getAnimeForChar = async (str) => {
	tempStr = encodeURIComponent(str);
	try {
		const malPage = await browser.newPage();
		await malPage.goto(
			`https://myanimelist.net/character.php?cat=character&q=` + tempStr
		);

		await malPage.waitForSelector("#content");
		let result = await malPage.$("#content table>tbody>tr>:nth-child(3) div a");
		result = await malPage.evaluate((el) => el?.innerText, result);

		if (!result && str.split(" ")?.length > 1) {
			console.log(
				chalk.red("Error with ") +
					tempStr +
					". (`https://myanimelist.net/character.php?cat=character&q=" +
					tempStr + ")" + 
					chalk.cyanBright("\nRetrying with " + str.split(" ")[0])
			);
			await malPage.goto(
				`https://myanimelist.net/character.php?cat=character&q=` +
					str.split(" ")[0]
			);
			await malPage.waitForSelector("#content");
			result = await malPage.$("#content table>tbody>tr>:nth-child(3) div a");
			result = await malPage.evaluate((el) => el?.innerText, result);
			if (!result) {
				char.set(str, result ?? " ");
				throw new Error(
					"Result is empty on second try also. (https://myanimelist.net/character.php?cat=character&q=" +
						str.split(" ")[0]+")"
				);
			} else {
				console.log(chalk.greenBright.underline("Success in second try with"));
			}
		}
		char.set(str, result);
		await malPage.close();
	} catch (err) {
		console.log(
			chalk.redBright(
				"Error while fetching " + chalk.greenBright(str) + " " + err
			)
		);
	}
};

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
			let tempQuote =
				str?.split(" – ")?.length > 1 ? str.split(" – ") : str.split("–");
			if (str?.length) {
				if (!char.has(tempQuote[tempQuote?.length - 1])) {
					await getAnimeForChar(tempQuote[tempQuote?.length - 1]);
					// char.set(tempQuote[1], "");
				}
				strObj = {
					quote:
						tempQuote?.length > 2 ? tempQuote[0] + tempQuote[1] : tempQuote[0],
					name: tempQuote[tempQuote?.length - 1],
					id: id,
					anime: char.get(tempQuote[tempQuote?.length - 1]),
				};
				fs.appendFile(
					"quotes.text",
					JSON.stringify(strObj, null, 2) + ",\n",
					function (err) {
						if (err)
							return console.log(
								chalk.red("Error occured while writing to text file--->", err)
							);
						console.log(chalk.bold.green("Quotes push to quotes.text file\n"));
					}
				);
				temp.push(strObj);
				id++;
			}
		}
		await page.close();
		console.log(
			chalk.blue("Quotes from page " + i + 1 + ". ") +
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
	console.log(chalk.bgCyanBright.underline("\nTask Completed !!\n"));
}

console.log("Length---->", temp.length);
// fs.appendFile("quotes.text", JSON.stringify(temp, null, 2), function (err) {
// 	if (err)
// 		return console.log(
// 			chalk.red("Error occured while writing to text file--->", err)
// 		);
// 	console.log(chalk.bold.green("Quotes push to quotes.text file\n"));
// });
