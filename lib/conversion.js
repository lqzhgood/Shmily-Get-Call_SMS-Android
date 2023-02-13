const dayjs = require('dayjs');
const config = require('../config');
const cheerio = require('cheerio');

const { FILTER_ARR } = config;

exports.smsToMsg = function (arr) {
    if (FILTER_ARR.length > 0) {
        arr = arr.filter(v => FILTER_ARR.some(n => v.address.includes(n)));
    }

    return arr.map(v => {
        const dateIsNum = v.date * 1;
        const send = {};
        const receive = {};
        const direction = v.type == '2' ? 'go' : 'come';

        if (direction === 'go') {
            send.sender = config.rightNum;
            send.senderName = config.rightName;

            receive.receiver = v.address;
            receive.receiverName = v.name || config.leftName;
        }

        if (direction === 'come') {
            send.sender = v.address;
            send.senderName = v.name || config.leftName;

            receive.receiver = config.rightNum;
            receive.receiverName = config.rightName;
        }
        const $ = cheerio.load(v.body, { decodeEntities: false });
        const msg = {
            source: 'SMS',
            device: v.device || 'Phone',
            type: smsType(v.address, $),

            direction,

            ...send,
            ...receive,

            day: dayjs(dateIsNum).format('YYYY-MM-DD'),
            time: dayjs(dateIsNum).format('HH:mm:ss'),
            ms: dateIsNum,
            content: $.text(),
            html: v.body.replace(/(\n|\f)/gim, '<br/>'),

            $Dev: {
                msAccuracy: v.msAccuracy !== undefined ? v.msAccuracy : true,
                numberIsTrue: v.numberIsTrue,
            },
        };
        return msg;
    });
};
function smsType(num, $dom) {
    if (isFeiXin(num)) {
        return '飞信';
    } else if (isCaiXin($dom)) {
        return '彩信';
    } else {
        return '短信';
    }
}

function isFeiXin(num) {
    if (String(num).trim().startsWith('12520')) {
        return true;
    } else if (String(num).trim().startsWith('161')) {
        return true;
    } else {
        return false;
    }
}

function isCaiXin($dom) {
    return $dom('img').length !== 0;
}

// [
// {
//     "number": "13973370000",
//     "time": "2018年9月10日 15:55:05",
//     "date": "1536566105318",
//     "type": "2",
//     "name": "",
//     "new": "1",
//     "dur": "62"
// }
// ]

// new { '1', '0' }

exports.logsToMsg = function (arr) {
    if (FILTER_ARR.length > 0) {
        arr = arr.filter(v => FILTER_ARR.some(n => v.number.includes(n)));
    }

    return arr.map(v => {
        const dateIsNum = v.date * 1;
        const type = logType(v);

        const direction = type.startsWith('呼出') ? 'go' : 'come';

        const send = {};
        const receive = {};

        if (direction === 'go') {
            send.sender = config.rightNum;
            send.senderName = config.rightName;

            receive.receiver = v.number;
            receive.receiverName = v.name || config.leftName;
        }

        if (direction === 'come') {
            send.sender = v.number;
            send.senderName = v.name || config.leftName;

            receive.receiver = config.rightNum;
            receive.receiverName = config.rightName;
        }

        const msg = {
            source: 'CallLog',
            device: 'Phone',
            type,

            direction,

            ...send,
            ...receive,

            day: dayjs(dateIsNum).format('YYYY-MM-DD'),
            time: dayjs(dateIsNum).format('HH:mm:ss'),
            ms: dateIsNum,

            // "content": "",
            // "html": "",

            $CallLog: {
                data: { duration: v.dur * 1 },
            },

            $Dev: {
                msAccuracy: true,
            },
        };
        return msg;
    });
};

/**
 * @name:
 * @description:
 * @param {type}
 * @return {type} 必须以 呼入 呼出 开头
 */
function logType(v) {
    // type { '1', '2', '3', '5' }
    switch (Number(v.type)) {
        case 1:
            return '呼入已接';
        case 2:
            return v.dur == 0 ? '呼出未接' : '呼出已接';
        case 3:
            return '呼入未接';
        case 5:
            return '呼入挂断';
        default:
            throw new Error('error Type', v);
    }
}
