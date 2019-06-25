import axios from 'axios';
axios.defaults.headers.post['Content-Type'] ='application/x-www-form-urlencoded';

var API = {token: null}
var CORS = '';
if (process.env.NODE_ENV === 'development') {
    CORS = 'https://cors-anywhere.herokuapp.com/'
}
console.log(CORS);
API.loadVK = function(method, data, callback) {
    let url = `${CORS}https://api.vk.com/method/${method}?access_token=${this.token}&v=5.1&https=1&${Object.keys(data).reduce(function(a,k){a.push(k+'='+encodeURIComponent(data[k]));return a},[]).join('&')}`;
    // eslint-disable-next-line
    axios.get(url).then(d => callback(d.data.response)).catch(console.error);
}
API.aloadVK = async function (method, data) {
    let url = `${CORS}https://api.vk.com/method/${method}?access_token=${this.token}&v=5.1&https=1&${Object.keys(data).reduce(function(a,k){a.push(k+'='+encodeURIComponent(data[k]));return a},[]).join('&')}`;
    let r = await axios.get(url);
    return r.data.response;
}
export default API;