import arr from "./quotes.js";
import fs from "fs";

let temp = [];
let str = "";

arr.map((item, index) => {
	for (let key in item) {
		if (key !== "quote") {
			str += item[key];
			str += ",";
		}
		if (key === "quote") {
			// stringVal.replaceAll(",", "‚");
			let _quote = item[key]?.includes(",") ? item[key]?.replaceAll(",", "‚") : item[key]
			if (_quote.includes(`"`)) {
				_quote = _quote.replaceAll(`"`, `'`);
			}
			if(_quote.includes(""))
			str += `"${_quote}"`;
		}
	}
	temp.push(str);
	str = "";
});

let header = "anime,id,quote,name\n";

fs.appendFileSync("finalDB.csv", header);
// let ordered = arr.sort((a, b) => a.id - b.id)

// temp = ordered.map(item => Object.keys(item)
// 	.sort()
// 	.reduce((obj, key) => {
// 		obj[key] = item[key];
// 		return obj;
// 	}, {}));

fs.appendFileSync("finalDB.csv", temp.join("\n"));
