import sha512 from 'js-sha512';
import salt from '../../codes_stuff/salt.js';
import encodes from '../../codes_stuff/encrypted.js';

let OptEncodes = new Set(encodes);

function declOfNum(number, titles) {
    let cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

function getRanges(array) {
    var ranges = [],
        rstart, rend;
    for (var i = 0; i < array.length; i++) {
        rstart = array[i];
        rend = rstart;
        while (array[i + 1] - array[i] == 1) {
            rend = array[i + 1];
            i++;
        }
        rstart++;
        rend++;
        ranges.push(rstart == rend ? rstart + '' : rstart + '-' + rend);
    }
    return ranges;
}

function loadRanges(ranges, maxV) {
    // 0 - not selected
    // 1 - selected

    var resultRange = Array.apply(null, {
        length: maxV
    }).map(() => 0);

    if (!(/^((\d+-\d+,? ?)|(\d+,? ?))+$/.test(ranges))) {
        return false;
    }
    var splitted = ranges.split(',');
    for (var i = 0; i < splitted.length; i++) {
        if (splitted[i].includes('-')) {
            let f = Number(splitted[i].split('-')[0].trim()) - 1;
            let t = Number(splitted[i].split('-')[1].trim()) - 1;
            var cond = ((f >= 0) && (f < t)) && (t < maxV);
            if (cond) {
                for (var j = f; j < t + 1; j++) {
                    if (resultRange[j] != 1) {
                        resultRange[j] = 1;
                    } else {
                        return false;
                    }
                }
            } else {
                return false;
            }
        } else {
            let j = Number(splitted[i].split('-')[0].trim()) - 1;
            if (j >= 0 && j < maxV) {
                if (resultRange[j] != 1) {
                    resultRange[j] = 1;
                } else {
                    return false;
                }
            }
        }
    }
    return resultRange;
}


function capitalizeFirstLetter(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
}

function isPrime(num) {
    for (let i = 2; i * i < num; i++) {
        if (num % i == 0) {
            return false;
        }
    }
    return true;
}

// window.checkActivationCode = checkActivationCode;

function checkActivationCode(code, userid) {

    if (!code) {
        return { res: false, expl: 'no code found' };
    }
    
    // if (code.includes('pers')) {

    // }

    if (OptEncodes.has(sha512(code + salt))) {
        return { res: true, expl: 'ok!' };
    } else {
        return { res: false, expl: 'code not valid' };
    }

    // b, d, c, a 
    // 0, 1, 2, 3
    // 1, 3, 2, 0
    // var a = parseInt(code.substr(12, 4));
    // var b = parseInt(code.substr(0, 4));
    // var c = parseInt(code.substr(8, 4));
    // var d = parseInt(code.substr(4, 4));

    // if ((a < b) && (b < c) && (c < d)) {
    //     if (isPrime(a) && isPrime(b) && isPrime(c) && isPrime(d)) {
    //         return true;
    //     }
    // }
    // return false;
}

export {
    declOfNum,
    checkActivationCode,
    getRanges,
    loadRanges,
    capitalizeFirstLetter
}