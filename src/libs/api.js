import axios from 'axios';
var API = {token: null}
API.loadVK = function(method, data, callback) {
    let url =
        `https://cors-anywhere.herokuapp.com/https://api.vk.com/method/${method}?access_token=${this.token}&v=5.1&https=1&${Object.keys(data).reduce(function(a,k){a.push(k+'='+encodeURIComponent(data[k]));return a},[]).join('&')}`;
    axios.get(url).then((d) => {
        console.log(d);
        callback(d.data.response);
    }).catch(console.error);
}
export default API;