<template>
  <div class="text-xs-center wrapper">
    Ваш токен:
    <input v-bind:value="token">
    <div>Ваше имя: {{ name }}</div>
    <v-container fluid grid-list-xl>
      <v-layout row wrap>
        <v-flex md8 xs12>
          <ChatList v-bind:chats="chats"/>
        </v-flex>
        <v-flex md4 xs12>
          <v-card>
            <v-subheader>Скачать</v-subheader>
            <div> {{ currentDialogLabel }} </div>
            <v-progress-linear v-if="downloading" v-model="currentDialogProgress"></v-progress-linear>
            <v-progress-linear hidden v-model="currentDialogPart"></v-progress-linear>
            <v-card-text style="padding-top: 0px;">
              <v-select
                v-model="fileType"
                persistent-hint
                :hint="fileType === 'JSON' ? 'для последующей обработки' : 'для непосредственного просмотра'"
                :items="['JSON', 'HTML']"
                label="Тип файлов"
              ></v-select>
              <br>

              <v-btn
                v-if="countSelected > 0 && !downloading"
                color="success"
                @click="downloadSelected"
              >Скачать {{ countSelected }}</v-btn>
              <v-btn v-else color="info" disabled>Скачать {{ countSelected }}</v-btn>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import { saveAs } from "file-saver";
import JSZip from "jszip";
import API from "../libs/api";
import Analyzes from "../libs/utils";
import Convertor from "../libs/convertor";

import ChatList from "./ChatList";

export default {
  name: "Main",
  data: function() {
    return {
      token: null,
      name: null,
      currentDialogProgress: 0,
      currentDialogLabel: "",
      currentDialogPart: 0,
      downloading: false,
      fileType: "JSON",
      chats: []
    };
  },
  created: function() {
    

    this.token = localStorage.getItem("pm_token");
    API.token = this.token;
    
    API.loadVK("users.get", { fields: 'photo_50'}, d => {
      this.name = `${d[0].first_name} ${d[0].last_name}`;
      API.uid = d[0].id;
      API.myself = d[0];
    });


    API.loadVK(
      "execute",
      {
        code:
          "return API.messages.getConversations({count:40,extended:1,v:5.80});"
      },
      d => {
        let ans = [];
        for (let i = 0; i < d.items.length; i++) {
          let pid = d.items[i].conversation.peer.id;
          for (let j = 0; j < d.profiles.length; j++) {
            if (d.profiles[j].id < 0) break;
            if (d.profiles[j].id === pid) {
              ans.push({
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
        this.chats = ans;
      }
    );
  },
  methods: {
    reportProgress: function(status, current, max) {
      this.currentDialogProgress = Math.ceil(current/max*100);
      if (max == 0) {
        this.currentDialogLabel = `${status}`;
      } else {
        this.currentDialogLabel = `${status} ${current}/${max}`;
      }
    },
    reportDialogProgress: function(status, current, max) {
      this.currentDialogPart = Math.ceil(current/max*100);
    },
    downloadSelected: function() {
      this.downloading = true;
      var zip = new JSZip();

      var selectedChats = this.chats.filter(c => c.selected);
      var len = selectedChats.length;
      var i = 0;
      
      var callback = obj => {
        var blob
        if (this.fileType === "JSON") {
          blob = new Blob([obj.data], {type : 'application/json'});
        } else {
          blob = new Blob([obj.data], {type : 'application/html'});
        }
        
        zip.file(obj.filename, blob);
        setTimeout(() => {
          i++;
          if (i < len) {
            let peerID = selectedChats[i].peer_id;
            if (peerID > 0) {
              this.reportProgress(`Загрузка ${selectedChats[i].peerInfo.first_name} ${selectedChats[i].peerInfo.last_name}`, i + 1, len);
              Analyzes.dialog(peerID, convertCallback, this.reportDialogProgress, `${selectedChats[i].peerInfo.first_name} ${selectedChats[i].peerInfo.last_name}`);
            }
          } else {
            this.reportProgress("Создание zip архива", 0, 0);
            zip.generateAsync({ type: "blob" }).then(content => {
              saveAs(content, `result${this.fileType}_${new Date(Date.now()).toLocaleString().replace(/, /g, "_")}.zip`);
              this.reportProgress("Готово", 0, 0);
              this.downloading = false;
            });
          }
        }, 1000);
      };
      var convertCallback = json => {
        if (this.fileType === 'HTML') {
          this.reportProgress(`Конвертация в HTML ${selectedChats[i].peerInfo.first_name} ${selectedChats[i].peerInfo.last_name}`, i + 1, len);
          Convertor.json2html(json, API.uid, callback);
        }
        else
          callback(json);
      };
      this.reportProgress(`Загрузка ${selectedChats[i].peerInfo.first_name} ${selectedChats[i].peerInfo.last_name}`, i + 1, len);
      Analyzes.dialog(selectedChats[i].peer_id, convertCallback, this.reportDialogProgress, `${selectedChats[i].peerInfo.first_name} ${selectedChats[i].peerInfo.last_name}`);
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
  components: { ChatList }
};
</script>

<style>
.wrapper {
  margin: auto;
  text-align: center;
  max-width: 1000px;
}
</style>
