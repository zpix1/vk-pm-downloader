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
            <v-progress-linear v-model="currentDialogProgress"></v-progress-linear>
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
    API.loadVK("users.get", {}, d => {
      this.name = `${d[0].first_name} ${d[0].last_name}`;
      API.uid = d[0].id;
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
      this.currentDialogLabel = `${status} ${current}/${max}`;
    },
    reportDialogProgress: function(status, current, max) {
      console.log(current, max);
      this.currentDialogPart = Math.ceil(current/max*100);
    },
    downloadSelected: function() {
      this.downloading = true;
      var zip = new JSZip();

      var selectedChats = this.chats.filter(c => c.selected);
      var len = selectedChats.length;
      var i = 0;
      var callback = obj => {
        zip.file(obj.filename, obj.data);
        setTimeout(() => {
          i++;
          if (i < len) {
            let peerID = selectedChats[i].peer_id;
            if (peerID > 0) {
              // console.log(peerID + ": analyze...");
              this.reportProgress(`Загрузка ${selectedChats[i].peerInfo.first_name} ${selectedChats[i].peerInfo.last_name}`, i + 1, len);
              Analyzes.dialog(peerID, callback, this.reportDialogProgress);
            }
          } else {
            // console.log("DONE");
            zip.generateAsync({ type: "blob" }).then(content => {
              saveAs(content, "result.zip");
            });
            this.downloading = false;
            this.reportProgress("Готово", len, len);
          }
        }, 1000);
      };
      this.reportProgress(`Загрузка ${selectedChats[i].peerInfo.first_name} ${selectedChats[i].peerInfo.last_name}`, i + 1, len);
      Analyzes.dialog(selectedChats[i].peer_id, callback, this.reportDialogProgress);
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
