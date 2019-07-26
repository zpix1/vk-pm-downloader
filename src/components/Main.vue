<template>
  <div class="text-xs-center wrapper">
    <div>
      <v-dialog v-model="dialog" width="700">
        <v-card>
          <v-card-title class="headline" primary-title>Вход по паролю</v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field v-model="login" label="Логин"></v-text-field>
              <v-text-field v-model="password" type="password" label="Пароль"></v-text-field>
              <v-btn color="success" @click="passwordLogin">Войти</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
    <v-container fluid grid-list-xl style="padding-top: 0;">
      <v-layout row wrap>
        <v-flex md12 xs12>
          <v-card>
            <v-subheader>Ваш аккаунт</v-subheader>
            <v-card-text>
              <v-layout row>
                <v-flex xs9>
                  <v-form class="text-xs-left">
                    <div>
                      <v-text-field
                        v-model="token"
                        @change="tokenUpdated"
                        label="Токен"
                        required
                        style="max-width: 300px;padding-bottom:0px; margin-bottom:0px;"
                      ></v-text-field>
                      <a @click="dialog = true">или вход через логин и пароль</a>
                    </div>
                    <v-text-field
                      v-bind:value="(myself && myself.first_name + ' ' + myself.last_name) || ''"
                      label="Имя"
                      readonly
                      disabled
                    ></v-text-field>
                    <v-btn v-if="inittingStage === 0" color="success" @click="init">Войти</v-btn>
                    <v-btn v-else color="success" disabled>Войти</v-btn>

                    <v-progress-circular v-if="inittingStage === 1" indeterminate color="primary"></v-progress-circular>
                  </v-form>
                </v-flex>

                <v-flex xs3>
                  <v-img
                    class="round"
                    aspect-ratio="1"
                    contain
                    :src="(myself && myself.photo_200) || 'https://placehold.jp/100x100.png'"
                  ></v-img>
                </v-flex>
              </v-layout>
              <v-alert :value="error" type="error">{{ error }}</v-alert>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
      <v-layout row wrap>
        <v-flex md8 xs12>
          <ChatList v-bind:chats="chats" />
        </v-flex>
        <v-flex md4 xs12>
          <v-card>
            <v-subheader>Скачать</v-subheader>
            <div>{{ currentDialogLabel }}</div>
            <v-progress-linear v-if="downloading" v-model="currentDialogProgress"></v-progress-linear>
            <v-progress-linear hidden v-model="currentDialogPart"></v-progress-linear>
            <v-card-text style="padding-top: 0px;">
              <v-select
                v-model="fileType"
                persistent-hint
                :hint="fileType === 'JSON' ? 'для последующей обработки' : 'для непосредственного просмотра (генерируется из JSON, занимает больше времени)'"
                :items="['JSON', 'HTML']"
                label="Тип файлов"
              ></v-select>
              <br />
              <div style="text-align: left;">
                <a @click="attachmentsDownloadMenu = true">Скачать вложения?</a>
              </div>
              <v-dialog v-model="attachmentsDownloadMenu" width="700">
                <v-card>
                  <v-card-text>
                    <p class="title">Скачать вложения</p>
                    <p>Данная версия сайта не поддерживает выкачку вложений, она качает прямые ссылки, чего зачастую достаточно для сохранения данных.</p>
                    <p>
                      <b>ОДНАКО</b>, если вам нужно именно сохранить вложения на диск, я разработал скрипт, который находит в скачанных HTML вложения и качает их.
                    </p>
                    <p>
                      Скрипт python3 (соотвественно нужен интерпретатор python3 на компьютере).
                      <br />Скрипт качает
                      <b>только фото и аудио сообщения</b>.
                      <br />Скрипт консольный, т.е. управляется через интерфейс командной строки.
                      <br />Инструкция по использованию скрипта выдается при покупке.
                    </p>
                    <p>
                      Цена скрипта
                      <b>300 рублей</b>,
                      <br />чтобы купить - свяжитесь со мной в Telegram -
                      <a
                        href="https://tglink.ru/zpix1"
                      >@zpix1</a> или по почте
                      <a href="mailto:zpix-dev@list.ru">zpix-dev@list.ru</a>
                    </p>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" flat @click="attachmentsDownloadMenu = false">Закрыть</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-btn
                v-if="countSelected > 0 && !downloading"
                color="success"
                @click="downloadSelected"
              >Скачать {{ countSelected }}</v-btn>
              <v-btn v-else color="info" disabled>Скачать {{ countSelected }}</v-btn>
            </v-card-text>
          </v-card>
          <div style="margin-top: 24px;">
            <About></About>
          </div>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import { saveAs } from "file-saver";
import axios from "axios";
import JSZip from "jszip";
import { slugify } from "transliteration";

import API from "../libs/api";
import Analyzes from "../libs/utils";
import Convertor from "../libs/convertor";
import { capitalizeFirstLetter } from "../libs/helper";

import ChatList from "./ChatList";
import About from "./About";
export default {
  name: "Main",
  data: function() {
    return {
      dialog: false,
      token: null,
      myself: null,
      currentDialogProgress: 0,
      currentDialogLabel: "",
      currentDialogPart: 0,
      downloading: false,
      inittingStage: 0,
      error: false,
      fileType: "HTML",
      chats: [],
      login: "",
      password: "",
      attachmentsDownloadMenu: false
    };
  },
  created: function() {
    if (process.env.NODE_ENV === "development") {
      this.token = localStorage.getItem("pm_token");
      API.token = this.token;
      this.init();
    }
  },
  methods: {
    passwordLogin: function() {
      this.dialog = false;
      this.inittingStage = 1;
      axios
        .post("https://apidog.ru/api/v2/apidog.authorize", {
          login: this.login,
          password: this.password,
          application: 1
        })
        .then(d => {
          d = d.data;
          if (d.response.errorId === 73) {
            this.error =
              "ВК просит ввести капчу, а я эту функцию не сделал. Ждите.";
            this.tokenUpdated();
            return;
          } else if (!d.response.userAccessToken) {
            this.error = "Неверная пара логин/пароль.";
            this.tokenUpdated();
            return;
          }
          this.token = d.response.userAccessToken;
          this.tokenUpdated();
          this.init();
        });
    },
    tokenUpdated: function() {
      this.inittingStage = 0;
      this.chats = [];
      this.myself = null;
      this.currentDialogLabel = "";
      API.token = this.token;
    },
    init: function() {
      this.error = false;
      this.inittingStage = 1;
      API.loadVK(
        "users.get",
        { fields: "photo_50, photo_100, photo_200" },
        d => {
          if (!d) {
            this.error = "Токен не валиден или недостаточно прав.";
            this.tokenUpdated();
            return;
          }
          this.myself = d[0];
          API.uid = d[0].id;
          API.myself = d[0];
        },
        e => {
          this.error = `Ошибка сети (${e})`;
          this.tokenUpdated();
        }
      );

      var str = [];

      for (var i = 0; i < 25; i++) {
        str.push(
          `API.messages.getConversations({offset: ${i *
            40}, count:40, extended: 1, v:5.80})`
        );
      }

      API.loadVK(
        "execute",
        {
          code: "return[" + str.join(",") + "];"
        },
        data => {
          if (!data) {
            this.error = "Токен не валиден или недостаточно прав.";
            this.tokenUpdated();
            return;
          }
          // ans.push({
          //   peer_id: pid,
          //   last_message: d.items[i].last_message,
          //   peerInfo: d.profiles[j],
          //   selected: true
          // });

          let ans = [];
          let gids = new Set();
          for (let idx = 0; idx < data.length; idx++) {
            let d = data[idx];
            for (let i = 0; i < d.items.length; i++) {
              let pid = d.items[i].conversation.peer.id;
              for (let j = 0; j < d.profiles.length; j++) {
                if (d.profiles[j].id < 0) {
                  break;
                }
                if (d.profiles[j].id === pid) {
                  ans.push({
                    type: "user",
                    peer_id: pid,
                    last_message: d.items[i].last_message,
                    peerInfo: d.profiles[j],
                    selected: true
                  });
                  d.items[i].peerInfo = d.profiles[j];
                  break;
                }
              }
            }

            if (d.groups) {
              for (let i = 0; i < d.groups.length; i++) {
                if (!gids.has(d.groups[i].id)) {
                  gids.add(d.groups[i].id);
                  let info = {
                    id: -d.groups[i].id,
                    first_name: "Группа",
                    last_name: d.groups[i].name,
                    photo_100: d.groups[i].photo_100,
                    photo_50: d.groups[i].photo_50
                  };
                  ans.push({
                    type: "group",
                    peer_id: -d.groups[i].id,
                    last_message: "",
                    peerInfo: info,
                    selected: true
                  });
                }
              }
            }
          }
          this.chats = ans;
          this.inittingStage = 3;
        },
        e => {
          this.error = `Ошибка сети (${e})`;
          this.tokenUpdated();
        }
      );
    },
    reportProgress: function(status, current, max) {
      this.currentDialogProgress = Math.ceil((current / max) * 100);
      if (max == 0) {
        this.currentDialogLabel = `${status}`;
      } else {
        this.currentDialogLabel = `${status} ${current}/${max}`;
      }
    },
    reportDialogProgress: function(status, current, max) {
      this.currentDialogPart = Math.ceil((current / max) * 100);
    },
    downloadSelected: function() {
      this.downloading = true;
      var zip = new JSZip();

      var selectedChats = this.chats.filter(c => c.selected);
      var len = selectedChats.length;
      var i = 0;

      var callback = obj => {
        var blob;
        if (this.fileType === "JSON") {
          blob = new Blob([obj.data], { type: "application/json" });
        } else {
          blob = new Blob([obj.data], { type: "application/html" });
        }

        zip.file(obj.filename, blob);
        setTimeout(() => {
          i++;
          if (i < len) {
            let peerID = selectedChats[i].peer_id;
            this.reportProgress(
              `Загрузка ${selectedChats[i].peerInfo.first_name} ${selectedChats[i].peerInfo.last_name}`,
              i + 1,
              len
            );
            Analyzes.dialog(
              peerID,
              convertCallback,
              this.reportDialogProgress,
              `${selectedChats[i].peerInfo.first_name} ${selectedChats[i].peerInfo.last_name}`
            );
          } else {
            this.reportProgress("Создание zip архива", 0, 0);
            zip
              .generateAsync({
                type: "blob",
                compression: "DEFLATE",
                comment: `Generated with VK PM Downloader v${process.env.VERSION}`,
                compressionOptions: {
                  level: 6
                }
              })
              .then(content => {
                saveAs(
                  content,
                  `result_${capitalizeFirstLetter(
                    slugify(this.myself.last_name)
                  )}_${capitalizeFirstLetter(
                    slugify(this.myself.first_name)
                  )}_(id${this.myself.id})_${this.fileType}_${new Date(
                    Date.now()
                  )
                    .toLocaleString()
                    .replace(/, /g, "_")}.zip`
                );
                this.reportProgress("Готово", 0, 0);
                this.downloading = false;
              });
          }
        }, Math.random * 750 + 500);
      };
      var convertCallback = json => {
        if (this.fileType === "HTML") {
          this.reportProgress(
            `Конвертация в HTML ${selectedChats[i].peerInfo.first_name} ${selectedChats[i].peerInfo.last_name}`,
            i + 1,
            len
          );
          Convertor.json2html(json, API.uid, callback);
        } else callback(json);
      };
      this.reportProgress(
        `Загрузка ${selectedChats[i].peerInfo.first_name} ${selectedChats[i].peerInfo.last_name}`,
        i + 1,
        len
      );
      Analyzes.dialog(
        selectedChats[i].peer_id,
        convertCallback,
        this.reportDialogProgress,
        `${selectedChats[i].peerInfo.first_name} ${selectedChats[i].peerInfo.last_name}`
      );
    }
  },
  computed: {
    countSelected: function() {
      var ans = 0;
      for (var i = 0; i < this.chats.length; i++) {
        if (this.chats[i].selected) ans++;
      }
      return ans;
    }
  },
  components: { ChatList, About }
};
</script>

<style>
.wrapper {
  margin: auto;
  text-align: center;
  max-width: 1000px;
}
.round {
  max-height: 125px;
  max-width: 125px;
  border-radius: 50%;
  margin-top: 23px;
  margin: auto;
}
</style>
