import jsonp from 'jsonp';
import jsonpPromise from 'jsonp-promise';
var API = {
    token: null
}
const version = '5.22';
var CORS = '';
if (process.env.NODE_ENV === 'development') {
     CORS = 'https://cors-anywhere.herokuapp.com/'
}
// eslint-disable-next-line
API.loadVK = function (method, data, callback, errorCallback = console.error) {
    let url = `https://api.vk.com/method/${method}?access_token=${this.token}&v=${version}&https=1&${Object.keys(data).reduce(function(a,k){a.push(k+'='+encodeURIComponent(data[k]));return a},[]).join('&')}`;
    // eslint-disable-next-line
    jsonp(url, null, (error, data) => {
        if (data.error) {
            // eslint-disable-next-line
            console.error('load', url, data.error);
        }
        if (error) {
            errorCallback(error);
        } else {
            callback(data.response);
        }
    });
    // axios.get(url).then(d => callback(d.data.response)).catch(errorCallback);
}
API.aloadVK = async function (method, data) {
    let url = `https://api.vk.com/method/${method}?access_token=${this.token}&v=${version}&https=1&${Object.keys(data).reduce(function(a,k){a.push(k+'='+encodeURIComponent(data[k]));return a},[]).join('&')}`;
    let r = await jsonpPromise(url, null, (error, data) => {
        if (error) {
            // eslint-disable-next-line
            console.error(error);
            return error;
        } else {
            return data;
        }
    }).promise;
    if (r.error) {
        // eslint-disable-next-line
        console.error('aload', url, r.error);
        return r.error;
    }
    return r.response;
}
export default API;