import API from "./api";
var Analyzes = {
	dialog: function (peerId, callback) {
		var tsStatus,
			pbStatus,

			isStoppedByUser = false,

			setStatus = function (text, current, max) {
				
			},

			init = function () {
				setStatus("Инициализация", 0, 1);
				API.loadVK("execute",
					{
						code: (
							"var o=%o;return{u:API.users.get({user_ids:o,fields:\"photo_100,online,first_name_ins,last_name_ins\",v:5.2})[0],m:API.messages.getHistory({user_id:o,v:5.2}).count};"
						).replace(/%o/i, Math.abs(peerId))
					},
					function (result) {
						saveInfo(result);
					});
			},

			dialogInfo,

			saveInfo = function (result) {
				dialogInfo = {
					user: result.u,
					chat: result.c,
					count: result.m,
					isChat: !!result.c
				};
				start(0);
			},
			start = function (offset) {
				if (offset === false || isStoppedByUser) return;
				setStatus("Загружаю сообщения", offset, dialogInfo.count);
				var str = [], t = (peerId > 0 ? "user" : "chat");
				for (var i = 0, l = 25; i < l; ++i) {
					str.push("API.messages.getHistory({" + t + "_id:" + Math.abs(peerId) + ",v:5.2,offset:" + (offset + (i * 200)) + ",count:200}).items");
				}
				;
				API.loadVK("execute",
					{
						code: "return[" + str.join(",") + "];"
					},
					function (data) {
						if ((data = saveMessages(data)).isFull) {
							analyze(data.messages);
							setTimeout(function () {
								start(offset + (25 * 200))
							}, 300);
						}
						else {
							analyze(data.messages);
							showStat(stat);
						}
						;
					});
			},

			db = [],
			saveMessages = function (data, offset) {
				var messages = [], isFull = true;
				data.forEach(function (item) {
					if (Array.isArray(item))
						messages = messages.concat(item);
				});
				isFull = data[data.length - 1] && data[data.length - 1].length == 200;
				data = null;
				db = db.concat(messages);

				return {messages: messages, isFull: isFull};
			},

			stat = {
				attachments: 0,
				photos: 0,
				videos: 0,
				audios: 0,
				docs: 0,
				walls: 0,
				wall_replys: 0,
				maps: 0,
				stickers: 0,
				forwarded: 0,
				users: {},
				censored: 0,
				welcomes: 0,
				comings: 0,
				abuses: 0,
				words: {},
				wordsCount: 0,
				dates: {}
			},

			analyze = function (messages) {
				//setStatus("Анализ...", 0, dialogInfo.count);
				messages.forEach(function (message, index) {
					updateInfo(message);
				});
			},

			censor = function () {
				return /(^|\s)((д(о|o)+лб(а|a)+)?(е|e|ё)+(б|п)т?(а|a)+?|(п(р|p)и+)?пи+(з|3)д((а|a)+(н(у|y)+т(ы+(й+|а+я+|(е|e)+))?)?|(е|e)+ц)|((з|3)(а|a)+)?(е|e|ё)+((б|п)(а|a)+?(л((о|o)+|(е|e)+т)?|н(у+т)?(ь((с|c)я+)?|ый?)|ть?|ыш|и+(с|c)ь)?)?|(о|o|а|a)+?(х|x)(у|y)+(й(ня)?|(е|e|ё)+((с|c)(о|o)+(с|c)|в|н|л(а|a)*)(н?(ы+й|(а|a)+я|(о|o)+(е|e)+)|ш(ий|(а|a)я|(о|o)(е|e))|а|a|ый|лa?)?)|пи+д(о|o|а|a)+?(р|p)+((а|a)+?(с|c)?ы?)?|бл((е|e)+(а|a)+|я+)(ть)?)(?=(\s|$))/img;
			},

			ignore = ["не", "а", "я", "с", "и", "в", "у", "то", "как", "по", "о", "к", "или", "на", "но", "что", "кто", "http", "https", "a", "of", "i", "it", "is"],

			n2 = function (n) {
				return n < 10 ? "0" + n : n;
			},

			getDate = function (m) {
				var d = new Date((m.date || m) * 1000);
				return d.getFullYear() + "-" + n2(d.getMonth() + 1) + "-" + n2(d.getDate());
			},

			updateInfo = function (i) {
				var fromId = i.from_id || i.user_id, d;
				if (stat.users[fromId]) stat.users[fromId]++; else stat.users[fromId] = 1;
				if ((d = getDate(i)) && stat.dates[d]) stat.dates[d]++; else stat.dates[d] = 1;
				if (i.attachments) {
					stat.attachments += i.attachments.length;
					i.attachments.forEach(function (l) {
						stat[l.type + "s"]++;
					});
				}
				;
				if (i.geo)
					stat.maps++;
				if (i.fwd_messages)
					stat.forwarded += i.fwd_messages.length;
				if (censor().test(i.body))
					stat.censored++;
				if (/(прив(ет)?|зда?р(а|о)в(ствуй(те)?)?|hi|hello|qq|добр(ый|ой|ого|ое)\s(день|ночи|вечер|утро))/i.test(i.body))
					stat.welcomes++;
				if (/(пока|до\s?св(и|е)дания|спок(ойной ночи|и)?|пэздуй с мопэда|до (завтр(а|о)|встречи))/i.test(i.body))
					stat.comings++;
				if (/(д(е|и)+б(и+л)?|д(о|а)+лб(о|а)+е+б|ху+(е|и)+с(о|а)+с|у?еб(ла+(н|сос)|ок)|му+да+к|пи+до+?р(ила+)?|даун|су+ка+)/i.test(i.body))
					stat.abuses++;
				i.body.replace(/[\(\)\[\]\{\}<>\s,.:;'\"_\/\\\|\?\*\+!@#$%\^=\~—¯_-]+/igm, " ").replace(/\s{2,}/gm, "").split(" ").forEach(function (word) {
					word = word.trim().toLowerCase();
					stat.wordsCount++;
					if (!word || ~ignore.indexOf(word)) return;
					stat.words[word] = stat.words[word] ? stat.words[word] + 1 : 1;
				});

			},

			showStat = function (d) {
                var json = [];
                db.forEach(function (item) {
                    json.push(saver.minifyMessage(item));
                });
                var blob = new Blob(["\ufeff", JSON.stringify({
                    meta: {
                        v: "1.2",
                        p: peerId,
                        a: API.uid,
                        t: dialogInfo.isChat
                            ? dialogInfo.chat.title
                            : dialogInfo.user.first_name + " " + dialogInfo.user.last_name,
                        d: parseInt(new Date() / 1000),
                    },
                    data: json
                })], {
                    type: "application/json;charset=utf-8"
                });

                // saveAs(blob, "dialog" + peerId + ".json");
                callback({'filename': "dialog" + peerId + ".json", data: blob});
			},
			d2006 = 1138741200,
			saver = {
				minifyMessage: function (m) {
					var o = {
						i: m.id,
						f: m.from_id,
						t: m.body,
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
										m: o.photo_2560,
										s: o.photo_1280,
										n: o.photo_807,
										o: o.photo_604,
										t: o.photo_130
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
									s: o.duration
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
									g: o.genre_id
								};
							case "doc":
								return {
									t: 3,
									o: o.owner_id,
									i: o.id,
									n: o.title,
									e: o.ext,
									s: o.size
								};
							case "sticker":
								return {
									t: 4,
									i: o.id
								};
							default:
								return {
									t: -1,
									s: i.type
								};
						}
					});
				},
				minifyForwardedMessages: function (a) {
					return a.map(function (i) {
						var o = {
							f: i.user_id,
							t: i.body,
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
	openDialogFile: function () {
		var pageWrap,
			filePickerForm,
			openFile = function (fileNode) {
				var file = fileNode.files[0];

				if (!file) {
					return alert("Вы не выбрали файл");
				}

				var fr = new FileReader();
				fr.onerror = function (event) {
					console.error("Analyzes.openDialogFile@openFile", event);
					alert("Произошла ошибка чтения файла.\n\n" + event.toString());
				};
				fr.onload = function (event) {
					console.info("Analyzes.openDialogFile@openFile", event);
					return checkFile(fr.result);
				};
				fr.readAsText(file);
			},
			checkFile = function (data) {
				try {
					data = JSON.parse(data);
					if (!data.meta || data.meta && (!data.meta.t || !data.meta.v || !data.meta.p || !data.meta.d) || !data.data)
						throw "Неизвестный формат";
				}
				catch (e) {
					console.error("Analyzes.openDialogFile@checkFile: ", e);
					return alert("Ошибка чтения файла.\nФайл поврежден и/или имеет неизвестную структуру.")
				}
				finally {
					return readFile(data);
				}
			},
			dialogActivity,
			showDialogActivity = function () {
				if (dialogActivity) {
					return dialogActivity;
				}

				dialogActivity = e("div", {"class": "imdialog-list imdialog-list-chat"});
				return dialogActivity;
			},
			meta,
			db,
			VERSION,
			d2006 = 1138741200,
			readFile = function (data) {
				db = data.data;
				meta = data.meta;
				VERSION = parseInt(meta.v);
				var userIds = [],
					add = function (i) {
						if (i.m)
							i.m.forEach(add);
						if (~userIds.indexOf(i.f))
							return;
						userIds.push(i.f);
					};
				data.data.forEach(function (i) {
					add(i);
				});
				userIds.length = 1000;
				API.loadVK("users.get",
					{
						user_ids: userIds.join(","),
						fields: "photo_50,online,first_name_acc,last_name_acc"
					},
					function (result) {
						saveUsers(result);
					});
				setActivity(showDialogActivity());
				showItems(0);
			},
			saveUsers = function (users) {
				Local.AddUsers(users);

				if (meta.p < 0) {
					return;
				}

				var w = Local.Users[meta.p];
				console.log(w);

				$.element("anza").innerHTML = " с " + w.first_name_acc + " " + w.last_name_acc;
			},
			showItems = function (i) {
				for (var l = i + 100, k; i < l; ++i) {
					k = db[i];
					if (!k) continue;
					dialogActivity.appendChild(IM.item({
							out: (!meta.a ? API.uid : meta.a) == k.f,
							user_id: k.f,
							from_id: k.f,
							date: k.d + d2006,
							body: k.t,
							read_state: true,
							id: k.i,
							attachments: explainAttachments(k.a),
							fwd_messages: explainForwardedMessages(k.m)
						},
						{
							to: meta.p
						}));
				}
				if (db.length > i + 100) {
					var next = i + 100;
					dialogActivity.appendChild(e("div",
						{
							"class": "button-block",
							html: "Далее",
							onclick: function () {
								$.elements.remove(this);
								showItems(next);
							}
						}));
				}
			},
			fixDate = function (u) {
				return u + d2006;
			},
			explainAttachments = function (a) {
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
									duration: i.s
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
									genre_id: i.g
								}
							};
						case 3:
							return {
								type: "doc", doc: {
									owner_id: i.o,
									id: i.i,
									title: i.n,
									ext: i.e,
									size: i.s
								}
							};
						default:
							return {
								t: -1,
								s: i.type
							};
					}
				});
			},
			explainForwardedMessages = function (f) {
				if (!f) {
					return false;
				}
				f.forEach(function (i) {
					return {
						user_id: i.f,
						date: i.date + d2006,
						body: i.t,
						attachments: explainAttachments(i.a),
						fwd_messages: explainForwardedMessages(i.m)
					};
				});
			};
	},
};
export default Analyzes;