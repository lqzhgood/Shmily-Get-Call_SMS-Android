const path = require('path');
const fs = require('fs');
const parser = require('xml2json');
const _ = require('lodash');

const config = require('./config');
const { checkUniq, emojiReplace } = require('./lib/utils');
const { smsToMsg } = require('./lib/conversion.js');

const INPUT_DIR = './input';
const OUTPUT_DIR = './dist';

if (!fs.existsSync(path.join(INPUT_DIR, '/smsS60Nbu/'))) {
    // eslint-disable-next-line
    return null;
}

const smsList = fs.readdirSync(path.join(INPUT_DIR, '/smsS60Nbu/'));
const sms = smsList.reduce((pre, smsFile) => {
    const str = fs.readFileSync(path.join(INPUT_DIR, '/smsS60Nbu/', smsFile), 'utf-8');
    const xml = emojiReplace(str);
    const json = parser.toJson(xml, { object: true });

    const { name } = path.parse(smsFile);
    const device = name.split(' - ')[0];
    if ('smses' in json) {
        return pre.concat(cSms3(json.smses.sms, device).reverse());
    }

    throw new Error('unknown Type', json);
}, []);

// const QQ_SMS_NUMBER = ["10661700002001",
//     "10661700002002",
//     "10666226002001",
//     "10666226002002",
//     "10666226002003"];

const smsFilter = sms.filter(v => {
    if (v.address.startsWith('106')) {
        return v.body.includes(`(${config.QQ_NUMBER})`);
    } else {
        return true;
    }
});

console.log('s60短信总长度', smsFilter.length);

const uniqArr = checkUniq('sms', smsFilter);
const result = _.sortBy(smsToMsg(uniqArr), 'ms');

console.log('s60短信去重总长度', result.length);

fs.writeFileSync(path.join(OUTPUT_DIR, './sms_s60.json'), JSON.stringify(result, null, 4));

function cSms3(arr, device) {
    // address: "15212341234"
    // body: "12345"
    // contact_name: "xyz"
    // date: "1334739297000"
    // type: "1"

    // locked: "0"
    // protocol: "0"
    // read: "1"
    // readable_date: "Apr 18, 2012 4:54:57 PM"
    // sc_toa: "null"
    // service_center: "null"
    // status: "-1"
    // subject: "null"
    // toa: "null"
    return arr.map(v => {
        return {
            address: v.address,
            body: v.body,
            name: v.contact_name,
            date: v.date,
            type: v.type,
            device,
            msAccuracy: false,
            numberIsTrue: true, //这里已经人工筛选过 不需要再筛选
        };
    });
}

setTimeout(() => {}, 10000);
