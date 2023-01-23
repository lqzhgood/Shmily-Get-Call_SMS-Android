const path = require('path');
const fs = require('fs');
const parser = require('xml2json');
const _ = require('lodash');

const { logsToMsg } = require('./lib/conversion.js');
const { checkUniq, emojiReplace } = require('./lib/utils');

const INPUT_DIR = "./input";
const OUTPUT_DIR = "./dist";


const logList = fs.readdirSync(path.join(INPUT_DIR, "/logs/"));
const logs = logList.reduce((pre, logFile) => {
    const str = fs.readFileSync(path.join(INPUT_DIR, "/logs/", logFile), 'utf-8');
    const xml = emojiReplace(str);
    const json = parser.toJson(xml, { object: true });
    return pre.concat(json.alllogs.log);
}, []);

console.log('通话记录总长度', logs.length);

const uniqArr = checkUniq('logs', logs);
const result = _.sortBy(logsToMsg(uniqArr), 'ms');

console.log('通话记录去重总长度', result.length);


fs.writeFileSync(path.join(OUTPUT_DIR, "./callLogs_android.json"), JSON.stringify(result, null, 4));
