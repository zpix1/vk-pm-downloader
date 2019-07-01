function declOfNum(number, titles) {
    let cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

function getRanges(array) {
    var ranges = [], rstart, rend;
    for (var i = 0; i < array.length; i++) {
        rstart = array[i];
        rend = rstart;
        while (array[i + 1] - array[i] == 1) {
            rend = array[i + 1];
            i++;
        }
        ranges.push(rstart == rend ? rstart+'' : rstart + '-' + rend);
    }
    return ranges;
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

function checkActivationCode(code) {
    if (!code) {
        return false;
    }

    // b, d, c, a 
    // 0, 1, 2, 3
    // 1, 3, 2, 0
    var a = parseInt(code.substr(12, 4));
    var b = parseInt(code.substr(0, 4));
    var c = parseInt(code.substr(8, 4));
    var d = parseInt(code.substr(4, 4));

    if ((a < b) && (b < c) && (c < d)) {
        if (isPrime(a) && isPrime(b) && isPrime(c) && isPrime(d)) {
            return true;
        }
    }
    return false;
}

export {
    declOfNum,
    checkActivationCode,
    getRanges,
    capitalizeFirstLetter
}