// cron jobs doesnt want to work smh
const child_process = require('child_process');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const MILISECOND = 1;
const SECOND = MILISECOND * 1000;
const MINUTE = SECOND * 60;
const FIVE_MINUTES = MINUTE * 5;

const run = async () => {
	while (true) {
		console.log(child_process.execSync('./run.sh').toString());
		await sleep(10);

		console.log(child_process.execSync('./compress.sh').toString())
		await sleep(FIVE_MINUTES);
	}
};

run();
