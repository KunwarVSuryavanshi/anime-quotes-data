fs = require("fs");
const arr = ['1', '2', '3']

fs.appendFile("helloworld.csv", arr.join(','), function (err) {
	if (err) return console.log(err);
	console.log("Wrote Hello World in file helloworld.txt, just check it");
});
