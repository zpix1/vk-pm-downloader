import API from './api.js';
import {
    galleryJS,
    galleryCSS
} from './gallery';

var Convertor = {}
Convertor.API = API;
var d2006 = 1138741200;
var fixDate = function (u) {
    return u + d2006;
}

function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var year = a.getFullYear();
    var month = a.getMonth() + 1;
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = '  ' + date + '/' + month + '/' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}


var explainAttachments = function (a) {
    if (!a) {
        return false;
    }

    return a.map(function (i) {

        switch (i.t) {
            case 0:
                return {
                    type: "photo", photo: {
                        photo_2560: i.s.m,
                        photo_1280: i.s.s,
                        photo_807: i.s.n,
                        photo_604: i.s.o,
                        photo_130: i.s.t,
                        description: i.z,
                        lat: i.q,
                        "long": i.w,
                        owner_id: i.o,
                        id: i.i,
                        date: fixDate(i.d)
                    }
                };
            case 1:
                return {
                    type: "video", video: {
                        owner_id: i.o,
                        id: i.i,
                        title: i.n,
                        description: i.z,
                        date: fixDate(i.d),
                        duration: i.s,
                        photo_2560: i.s.m,
                        photo_1280: i.s.s,
                        photo_807: i.s.n,
                        photo_604: i.s.o,
                        photo_130: i.s.t
                    }
                };
            case 2:
                return {
                    type: "audio", audio: {
                        owner_id: i.o,
                        id: i.i,
                        artist: i.a,
                        title: a.n,
                        duration: i.d,
                        lyrics_id: i.l,
                        genre_id: i.g,
                        url: i.url
                    }
                };
            case 3:
                return {
                    type: "doc", doc: {
                        owner_id: i.o,
                        id: i.i,
                        title: i.n,
                        ext: i.e,
                        size: i.s,
                        url: i.url
                    }
                };
            case 4:
                return {
                    type: "sticker", sticker: {
                        id: i.i
                    }
                };
            case 5:
                return {
                    type: "gift", gift: {
                        id: i.i
                    }
                };
            case 6:
            return {
                type: "link", link: {
                    id: i.i,
                    value: i.v
                }
            };
            default:
                return {
                    t: -1,
                    s: i.type
                };
        }
    });
}
var explainForwardedMessages = function (f) {
    if (!f) {
        return false;
    }
    var ans = [];
    f.forEach((i) => {
        ans.push({
            user_id: i.f,
            date: i.d + d2006,
            body: i.t,
            attachments: explainAttachments(i.a),
            fwd_messages: explainForwardedMessages(i.m)
        });
    });
    return ans;
}

function reformatJSON(k, meta, my_id) {
    return {
        out: (!meta.a ? my_id : meta.a) === k.f,
        user_id: k.f,
        from_id: k.f,
        date: k.d + d2006,
        body: k.t,
        read_state: true,
        id: k.i,
        attachments: explainAttachments(k.a),
        fwd_messages: explainForwardedMessages(k.m)
    }
}

var lru = {};
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function getUser(id) {
    // sleep bc rps limit
    if (id in lru) {
        return lru[id];
    } else if (id < 0) {
        let a = (await API.aloadVK('groups.getById', {
            group_ids: Math.abs(id),
            fields: 'photo_100'
        }))[0];
        a.first_name = 'Группа';
        a.last_name = a.name;
        lru[id] = a;
        await sleep(100);
        return a;
    } else {
        let a = (await API.aloadVK('users.get', {
            user_ids: id,
            fields: 'photo_100'
        }))[0];
        lru[id] = a;
        await sleep(100);
        return a;
    }
}

async function json2html(object, my_id, callback) {
    var data = JSON.parse(object.data);
    var newData = [];
    for (let i = 0; i < data.data.length; i++) {
        newData.push(reformatJSON(data.data[i], data.meta, my_id));
    }
    newData = newData.reverse();
    data.meta = await getUser(+data.meta.p);
    var myself = await getUser(my_id);
    var div = document.createElement("div");
    div.className = "messages round_upic main_wrapper";

    var h1 = document.createElement("h1");
    h1.innerText = "PM Downloader // 2019.06";
    div.appendChild(h1);
    for (let i = 0; i < newData.length; i++) {
        if (newData[i].out)
            div.appendChild((await message2tag(newData[i], myself)))
        else
            div.appendChild((await message2tag(newData[i], data.meta)))
    }
    // Create a full page
    var html = document.createElement('html');
    html.innerHTML = `
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>PM Downloader ${object.filename.replace('.json', '.html')}</title>
            <style>
            h4{font-family:inherit;font-weight:500;line-height:1.1;color:inherit;margin-top:10px;margin-bottom:10px;font-size:18px}
            body{font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:14px;line-height:1.42857143;color:#333;background-color:#fff;margin:0}
            hr{height:0;margin-top:20px;margin-bottom:20px;border:0;border-top:1px solid #eee}.messages{margin:30px;text-align:left}.msg_item{overflow:hidden}
            .from,.msg_body,.att_head,.attachments,.attachment,.fwd{margin-left:60px;min-height:1px;padding-right:15px;padding-left:15px}.msg_item{margin-top:5px}
            .upic{float:left}.upic img{vertical-align:top;padding:5px;width:50px;height:50px}.round_upic .upic img{border-radius:50%}a{color:#337ab7;text-decoration:none}
            a:active,a:hover{outline:0}a:focus,a:hover{color:#23527c;text-decoration:underline}
            .att_head{color:#777}.att_ico{float:left;width:11px;height:11px;margin:3px 3px 2px;background-image:url(http://vk.com/images/icons/mono_iconset.gif)}
            .att_photo{background-position:0 -30px;max-width:300px;max-height:300px; margin-bottom: 5px;}.att_audio{background-position:0 -222px}.att_video{background-position:0 -75px}
            .att_doc{background-position:0 -280px}.att_wall,.att_fwd{background-position:0 -194px}.att_gift{background-position:0 -105px}
            .att_sticker{background-position:0 -362px;width:12px;height:12px}.att_link{background-position:0 -237px}.attb_link a span{color:#777!important}
            .att_geo{background-position:0 -165px}.fwd{border:2px solid #C3D1E0;border-width:0 0 0 2px;margin-left:85px}.attachments{margin:5px;float:left}
            .attachment_title{font-size:20px;}.hidden_ta_at{display:none}.main_wrapper{margin:auto;max-width:1000px}
            </style>
            <style>${galleryCSS}</style>
            </head>
            <script>${galleryJS}</script>
        <body>
        </body>
        `
    html.getElementsByTagName("body")[0].appendChild(div);
    var galleryScript = document.createElement('script');
    galleryScript.innerText = `baguetteBox.run('.gallery');`;
    html.getElementsByTagName("body")[0].appendChild(galleryScript);
    var outerDiv = document.createElement('div');
    outerDiv.appendChild(html);

    callback({
        data: outerDiv.innerHTML,
        filename: object.filename.replace('.json', '.html')
    });
}

async function message2tag(message, sender) {
    var name = `${sender.first_name} ${sender.last_name}`;

    var div = document.createElement("div");
    div.className = "msg_item message";
    div.id = message.id;

    var avatarDiv = document.createElement("div");
    avatarDiv.className = "upic";
    var avatarImg = document.createElement("img");
    avatarImg.src = sender.photo_100;
    avatarDiv.appendChild(avatarImg);
    div.appendChild(avatarDiv);

    var messageHead = document.createElement("div");
    messageHead.className = "from";
    var nameB = document.createElement("b");
    nameB.innerText = name + ' ';
    var userA = document.createElement("a");
    userA.href = `https://vk.com/id${sender.id}`;
    userA.target = "_blank";
    userA.innerText = `@id${sender.id}`;
    var msgA = document.createElement("a");
    msgA.href = `#msg${message.id}`;
    msgA.innerText = timeConverter(message.date);
    messageHead.appendChild(nameB);
    messageHead.appendChild(userA);
    messageHead.appendChild(msgA);
    div.appendChild(messageHead);

    var messageBody = document.createElement("div");
    messageBody.className = "msg_body";
    messageBody.innerText = message.body;
    div.appendChild(messageBody);

    if (message.attachments) {
        var attachmentDiv = document.createElement('div');
        attachmentDiv.className = 'attachments';
        attachmentDiv.id = 'attach' + message.id;
        for (let i = 0; i < message.attachments.length; i++) {
            var attachment = message.attachments[i];
            attachmentDiv.appendChild(generateAttachment(attachment));
        }
        div.appendChild(attachmentDiv);
    }

    if (message.fwd_messages) {
        var fwdDiv = document.createElement('div');
        fwdDiv.className = 'fwd';
        for (let i = 0; i < message.fwd_messages.length; i++) {
            var fwd = message.fwd_messages[i];
            var u = await getUser(fwd.user_id);
            if (!u) {
                u = {
                    id: fwd.user_id,
                    first_name: "Ошибка",
                    last_name: `Профиля id${fwd.user_id}`,
                    photo_100: "https://vk.com/images/deactivated_100.png?ava=1"
                }
            }
            fwdDiv.appendChild(await message2tag(fwd, u));
        }
        div.appendChild(fwdDiv);
    }
    return div;
}

function maxRes(photo) {
    var values = 'photo_130 photo_604 photo_807 photo_1280 photo_2560'.split(' ');
    var ans = [0, 0];
    values.forEach(function (f) {
        if (photo[f]) {
            ans[0] = photo[f];
        }
    });
    if (photo.photo_604) {
        ans[1] = photo.photo_604;
    } else {
        values.reverse().forEach(function (f) {
            if (photo[f]) {
                ans[1] = photo[f];
            }
        });
    }
    return ans;
}

function generateAttachment(attachment) {
    var div = document.createElement('div');
    var ta = document.createElement('textarea');
    ta.className = "hidden_ta_at";
    ta.innerText = JSON.stringify(attachment);
    div.appendChild(ta);
    // div.className = 'att_' + attachment.type;
    if (attachment.type === 'photo') {
        // <a href="demo/images/4big.jpg" title="Caption for gallery item 1"><img src="demo/images/4small.jpg" alt="Gallery image 1" /></a>
        let gDiv = document.createElement('div');
        gDiv.className = 'gallery';

        let imgA = document.createElement('a');
        imgA.href = maxRes(attachment[attachment.type])[0];
        imgA.className = 'download_photo_type';
        imgA.dataset.src = maxRes(attachment[attachment.type])[0];
        let img = document.createElement('img');
        img.src = maxRes(attachment[attachment.type])[1];
        img.className = 'att_photo';
        imgA.appendChild(img);
        gDiv.appendChild(imgA);
        div.appendChild(gDiv);
    } else if (attachment.type == 'video') {
        let gDiv = document.createElement('div');
        gDiv.className = 'gallery';

        let textB = document.createElement('b');
        textB.innerText = `<полное видео не показано>`;
        ta.className = '';

        let imgA = document.createElement('a');
        imgA.href = maxRes(attachment[attachment.type])[0];

        let img = document.createElement('img');
        img.src = maxRes(attachment[attachment.type])[1];

        imgA.appendChild(img);
        gDiv.appendChild(imgA);
        div.appendChild(textB);
        div.appendChild(gDiv);
    } else if (attachment.type == 'audio') {
        let gDiv = document.createElement('div');

        let textB = document.createElement('b');
        textB.innerText = attachment[attachment.type].artist;

        let br = document.createElement('br');

        let audio = document.createElement('audio');
        audio.src = attachment[attachment.type].url;
        audio.dataset.src = attachment[attachment.type].url;
        if (attachment[attachment.type].url) {
            audio.className = 'download_audio_message_type';
        }
        audio.controls = 'controls';

        gDiv.appendChild(textB);
        gDiv.appendChild(br);
        gDiv.appendChild(audio);

        div.appendChild(gDiv);
    } else if (attachment.type == 'doc') {
        let gDiv = document.createElement('div');

        let textA = document.createElement('a');
        textA.innerText = attachment[attachment.type].title;
        textA.href = attachment[attachment.type].url;

        gDiv.appendChild(textA);

        div.appendChild(gDiv);
    } else {
        ta.className = '';
    }
    return div;
}

Convertor.json2html = json2html;

export default Convertor;