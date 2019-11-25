const isEqual = require('lodash.isequal');
const ow = require('oversmash').default();
const path = require('path');
const fs = require('fs');

const REPORT_FILE_PREFIX = 'report';
const LAST_FILE_SUFFIX = 'last';
const OLD_FILE_SUFFIX = 'old';
const REPORTS_FOLDER = 'reports';
const USERNAME = 'ColdMeson#1635';
const REPORT_FILE_EXTENSION = 'json';

const STATUS = {
  INIT: 1,
  EQUAL: 2,
  CHANGED: 3,
};

async function main() {
  // We are only interessed in the following data:
  const { stats } = await ow.playerStats(USERNAME);

  // Serialize it to JSON
  const currentReportObject = {
    competitive_rank,
    competitive,
    endorsement_level,
    games_won,
    quickplay,
  } = stats;

  const currentReportFileData = JSON.stringify(currentReportObject);

  // Build the file name
  const currentReportDate = new Date().toISOString();
  const currentReportName = path.join(__dirname, REPORTS_FOLDER, `${REPORT_FILE_PREFIX}-${currentReportDate}.${LAST_FILE_SUFFIX}.${REPORT_FILE_EXTENSION}`);

  // Promise result
  const result = { fileName: currentReportName, fileData: currentReportObject };

  // Get the list of all other report files
  const reportFileNames = fs.readdirSync(path.join(__dirname, REPORTS_FOLDER))
    .map(fileName => path.join(__dirname, REPORTS_FOLDER, fileName));

  // Find the last
  const lastReportName = reportFileNames.find(fileName => fileName.includes(LAST_FILE_SUFFIX));

  if (!lastReportName) {
    // This is the first time we are saving a report, so just save it;
    fs.writeFileSync(currentReportName, currentReportFileData);
    return Promise.resolve({ ...result, status: STATUS.INIT });
  }

  // Read the last report
  const lastReportFileBuffer = fs.readFileSync(lastReportName);
  const lastReportObject = JSON.parse(lastReportFileBuffer.toString());

  if (isEqual(lastReportObject, currentReportObject)) {
    // We havent played in the last N minutes to the objects are the same, don't write a new file
    return Promise.resolve({ ...result, status: STATUS.EQUAL }); 
  }

  // Rename the last to old, and write  the new
  fs.renameSync(lastReportName, lastReportName.replace(LAST_FILE_SUFFIX, OLD_FILE_SUFFIX));
  fs.writeFileSync(currentReportName, currentReportFileData);

  return Promise.resolve({ ...result, status: STATUS.CHANGED });
};

const msgs = {
  1: name => 'Initializing reports, writing ' + name,
  2: name => 'Stats did not change, not writting ' + name,
  3: name => 'Successfully updated report, written ' + name,
}

// Run and write logs
main()
  .then(({ status, fileName }) => console.log(msgs[status](fileName)))
  .catch(error => console.error('Failed to write report', error));

