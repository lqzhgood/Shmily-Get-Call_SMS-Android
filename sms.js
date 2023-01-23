const path = require('path');
const fs = require('fs');
const parser = require('xml2json');
const _ = require('lodash');

const { checkUniq, emojiReplace } = require('./lib/utils');
const { smsToMsg } = require('./lib/conversion.js');

const INPUT_DIR = './input';
const OUTPUT_DIR = './dist';

const smsList = fs.readdirSync(path.join(INPUT_DIR, '/sms/'));
const sms = smsList.reduce((pre, smsFile) => {
    const str = fs.readFileSync(path.join(INPUT_DIR, '/sms/', smsFile), 'utf-8');
    const xml = emojiReplace(str);
    const json = parser.toJson(xml, { object: true });

    if ('allsms' in json) {
        return pre.concat(cSms0(json.allsms.sms).reverse());
    }
    if ('smses' in json) {
        return pre.concat(cSms1(json.smses.sms).reverse());
    }

    throw new Error('unknown Type', json);
}, []);

console.log('短信总长度', sms.length);

const uniqArr = checkUniq('sms', sms);
let result = _.sortBy(smsToMsg(uniqArr), 'ms');

console.log('短信去重总长度', result.length);

fs.writeFileSync(path.join(OUTPUT_DIR, './sms_android.json'), JSON.stringify(result, null, 4));

// 标准模板
function cSms0(arr) {
    // name: "name"

    // address: "110"
    // body: "你要是真的回来了 我现在也出不来。你早点回家咯。"
    // date: "1388062560000"
    // type: "1" type  1 收到的  2发过去的

    // time: "2013年12月26日 下午8:56:00"
    // 无用属性
    // read: "1"
    // service_center: ""
    return arr;
}

function cSms1(arr) {
    // address: "110"
    // body: "你要是真的回来了 我现在也出不来。你早点回家咯。"
    // date: "1388062560000"
    // type: "1" //

    // readable_date: "12/26/13 20:56:00"
    // 无用属性
    // read: "1"
    // status: "-1"
    // service_center: "null"
    // subject: "null"
    // locked: "0"
    // protocol: "0"
    return arr.map(v => {
        return {
            address: v.address,
            body: v.body,
            name: '',
            date: v.date,
            type: v.type,
        };
    });
}
