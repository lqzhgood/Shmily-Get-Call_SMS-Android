const _ = require('lodash');


/**
 * @name:
 * @description: emoji 占两个字符。 但是文件是 utf-8，一个emoji被分割成两个字符了 xml解析报错
 * @param {*}
 * @return {*}
 */
exports.emojiReplace = function (str) {
    const emoji = [
        ["&#10;", ""],
        ["&#1;", ""],
        ["&#55357;&#56842;", "😊"],
        ["&#55357;&#56397;", "👍"],
        ["&#55357;&#56396;", "👌"],
        ["&#55357;&#56900;", "🙄"],
    ];
    emoji.forEach(emj => {
        str = str.replace(new RegExp(emj[0], "g"), emj[1]);
    });
    return str;
};


exports.checkUniq = function (type, arr) {
    const uniqFin = removeUniqSelectName(type, _.cloneDeep(arr));
    const uniqOnlyCheck = removeUniq(type, _.cloneDeep(arr));


    if (uniqFin.length !== uniqOnlyCheck.length) throw new Error('校验不通过 部分通话记录name未记录');
    console.log('去重校验正确 总长度', uniqFin.length);
    return uniqFin;
};


/**
 * @name: 数组选择性去重
 * @description:  如果两者一样 那么保留含 name 属性的
 * @param {type}
 * @return {type}
 */
function removeUniqSelectName(type, arr) {
    arr.forEach((v, i) => {
        // i 是顺位查询 index 是后面的
        if (!v) return;
        const oS = makeUniqString(type, v);
        const index = arr.findIndex((nV, nI) => {
            if (i === nI || !nV) return false;
            return makeUniqString(type, nV) === oS;
        });
        if (index === -1) return;
        const nV = arr[index];
        // i 是当前的  index 是当前遍历的
        if (v.name && nV.name) {
            // 名字一样删哪个无所谓了
            if (v.name == nV.name) {
                arr[i] = undefined;
            } else {
                // 相同内容 不一样的名字
                if (v.name === nV.address) {
                    arr[i] = undefined;
                } else if (v.address === nV.name) {
                    arr[index] = undefined;
                } else {
                    arr[i] = undefined;
                    console.log(`same name not same content ${JSON.stringify(v, null, 4)} ${JSON.stringify(nV, null, 4)}`);
                }
            }
        }
        else if (v.name && noName(nV.name)) arr[index] = undefined;
        else if (noName(v.name) && nV.name) arr[i] = undefined;
        else if (noName(v.name) && noName(nV.name)) arr[i] = undefined;
        else { throw new Error('that all'); }
    });
    return arr.filter(v => v);

    function noName(name) {
        // 这里还没有硬编码写入  所以只要判断是否非空即可
        return !name.trim();
    }
}


/**
 * @name:
 * @description: 校验用 这个是直接去重，不管 name。如果数量和 removeUniq 一致的话校验通过
 * @param {type}
 * @return {type}
 */
function removeUniq(type, arr) {
    return _.uniqWith(arr, (a, b) => {
        const aS = makeUniqString(type, a);
        const bS = makeUniqString(type, b);
        return aS === bS;
    });
}


function makeUniqString(type, v) {
    // 这里的数据能拿到 ms 时间戳 所以可以使用  v.date 作为 精确ID
    switch (type) {
        case 'logs':
            return `${v.number}-${v.date}-${v.type}-${v.dur}`;
        case 'sms':
            return `${v.address}-${v.date}-${v.body}-${v.type}`;
        default:
            throw new Error('unknown type', type);
    }
}
