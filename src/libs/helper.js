function declOfNum(number, titles) {  
    let cases = [2, 0, 1, 1, 1, 2];  
    return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];  
}

function checkActivationCode(code) {
    if (!code) {
        return false;
    }
    if (code.substr(0, 4) === '1235') {
        return true;
    }
    return false;
}

export { declOfNum, checkActivationCode }