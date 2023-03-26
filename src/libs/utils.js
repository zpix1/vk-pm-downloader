import API from "./api";
import {
	slugify
} from "transliteration";
import {
	capitalizeFirstLetter
} from "./helper";
import {
	timeouts
} from "./constant";
// var codeSent = 0;
var Analyzes = {
	dialog: function (peerId, callback, statusFunction, peerName = "") {
		var isStoppedByUser = false,

			setStatus = statusFunction,

			init = function () {
				setStatus("Инициализация", 0, 1);
				let code = '';
				if (peerId < 0) {
					code = "var o=%o;return{u:API.groups.getById({group_ids:o,fields:\"photo_100\",v:5.81})[0],m:API.messages.getHistory({user_id:-o,v:5.81}).count};";
				} else {
					code = "var o=%o;return{u:API.users.get({user_ids:o,fields:\"photo_100,online,first_name_ins,last_name_ins\",v:5.81})[0],m:API.messages.getHistory({user_id:o,v:5.81}).count};";
				}
				API.loadVK("execute", {
					code: (
						code
					).replace(/%o/i, Math.abs(peerId))
				},
				function (result) {
					if (result[name]) {
						result.first_name = 'Группа';
						result.last_name = result.name;
					}
					saveInfo(result);
				});
			},

			dialogInfo,

			saveInfo = function (result) {


				dialogInfo = {
					user: result.u,
					count: result.m
				};
				start(0);
			},
			start = function (offset, size = 25) {
				if (offset === false || isStoppedByUser) return;
				var str = [];
				for (var i = 0, l = size; i < l; ++i) {
					str.push("API.messages.getHistory({user_id:" + peerId + ",v:5.81,offset:" + (offset + (i * 200)) + ",count:200}).items");
				}

				API.loadVK("execute", {
						code: "return[" + str.join(",") + "];" 
					},
					function (data) {
						if ((data = saveMessages(data)).isFull) {
							setTimeout(function () {
								start(offset + (size * 200))
							}, timeouts.inUtils);
						} else {
							showStat();
						}
					},
					function (error) {
						// eslint-disable-next-line
						console.error(error, "retry in 2 seconds");
						setTimeout(function () {
							start(offset, 1);
						}, timeouts.inUtils);
					});
			},

			db = [],
			saveMessages = function (data) {
				var messages = [],
					isFull = true;
				data.forEach(function (item) {
					if (Array.isArray(item))
						messages = messages.concat(item);
				});
				isFull = data[data.length - 1] && data[data.length - 1].length == 200;
				data = null;
				db = db.concat(messages);

				return {
					messages: messages,
					isFull: isFull
				};
			},
			showStat = function () {
				var json = [];
				db.forEach(function (item) {
					json.push(saver.minifyMessage(item));
				});
				var jsonString = JSON.stringify({
					meta: {
						v: "1.2",
						p: peerId,
						a: API.uid,
						t: dialogInfo.isChat ?
							dialogInfo.chat.title :
							dialogInfo.user.first_name + " " + dialogInfo.user.last_name,
						d: parseInt(new Date() / 1000),
					},
					data: json
				})

				// saveAs(blob, "dialog" + peerId + ".json");
				callback({
					'filename': "dialog" + peerId + "_" + capitalizeFirstLetter(slugify(peerName).replace(/-/g, " ")).replace(/ /g, "_") + ".json",
					data: jsonString
				});
			},
			d2006 = 1138741200,
			saver = {
				minifyMessage: function (m) {
					var o = {
						i: m.id,
						f: m.from_id,
						t: m.text,
						d: m.date - d2006
					};
					if (m.attachments)
						o.a = saver.minifyAttachments(m.attachments);
					if (m.fwd_messages)
						o.m = saver.minifyForwardedMessages(m.fwd_messages);
					return o;
				},
				minifyAttachments: function (a) {
					var o;
					return a.map(function (i) {
						o = i[i.type];
						switch (i.type) {
							case "photo":
								return {
									t: 0,
										s: {
											m: o.sizes[Math.floor(o.sizes.length * 1) - 1].url,
											s: o.sizes[Math.floor(o.sizes.length * 0.7)].url,
											n: o.sizes[Math.floor(o.sizes.length * 0.5)].url,
											o: o.sizes[Math.floor(o.sizes.length * 0.4)].url,
											t: o.sizes[Math.floor(o.sizes.length * 0.2)].url
										},
										z: o.description || "",
										q: o.lat || 0,
										w: o.long || 0,
										o: o.user_id || o.owner_id,
										i: o.id,
										d: o.date - d2006
								};
							case "video":
								return {
									t: 1,
										o: o.owner_id,
										i: o.id,
										n: o.title,
										z: o.description,
										d: o.date - d2006,
										s: {
											m: o.photo_2560,
											s: o.photo_1280,
											n: o.photo_807,
											o: o.photo_604,
											t: o.photo_130
										}
								};
							case "audio":
								return {
									t: 2,
										o: o.owner_id,
										i: o.id,
										a: o.artist,
										n: o.title,
										d: o.duration,
										l: o.lyrics_id,
										g: o.genre_id,
										url: o.url
								};
							case "doc":
								return {
									t: 3,
										o: o.owner_id,
										i: o.id,
										n: o.title,
										e: o.ext,
										s: o.size,
										url: o.url
								};
							case "sticker":
								return {
									t: 4,
									i: o.id
								};
							case "gift":
								return {
									t: 5,
									i: o.id
								};
							case "link":
								return {
									t: 6,
									i: o.id,
									v: o.url
								};
							default:
								return {
									t: -1,
									s: i.type,
									v: i
								};
						}
					});
				},
				minifyForwardedMessages: function (a) {
					return a.map(function (i) {
						var o = {
							f: i.from_id,
							t: i.text,
							d: i.date - d2006
						};
						if (i.attachments)
							o.a = saver.minifyAttachments(i.attachments);
						if (i.fwd_messages)
							o.m = saver.minifyForwardedMessages(i.fwd_messages);
						return o;
					});
				}
			}
		init();
	},
	statDialogChate: null,

};
export default Analyzes;