import fs from "fs";
import puppeteer from "puppeteer";

// const arr = ['1', '2', '3']

// fs.appendFile("helloworld.csv", arr.join(','), function (err) {
// 	if (err) return console.log(err);
// 	console.log("Wrote Hello World in file helloworld.txt, just check it");
// });

//document.querySelectorAll('.row.align-center>div>div:nth-child(2)>div')
let links_arr = [];

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
		links_arr.push(temp);
	}
	console.log(links_arr);
	fs.appendFile("links.csv", links_arr.join("\n"), function (err) {
		if (err) return console.log(err);
		console.log(
			"*************************Links added to links.csv file*****************************"
		);
	});
	await browser.close();
};

getPagesLink("https://animemotivation.com/category/quotes/page/3/");