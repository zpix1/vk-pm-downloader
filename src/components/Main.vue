<template>
  <div>
    Ваш токен:
    <input v-bind:value="token">
    <div>Ваше имя: {{ name }}</div>
    <button @click="save">Downloadtest</button>
    <v-container fluid grid-list-xl>
      <v-layout row wrap>
        <v-flex md8 xs12>
          <ChatList v-bind:chats="chats"/>
        </v-flex>
        <v-flex md4 xs12>
          <v-card>Скачать</v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import { saveAs } from "file-saver";
import API from "../libs/api";
import Analyzes from "../libs/utils";

import ChatList from "./ChatList";

export default {
  name: "Main",
  data: function() {
    return {
      token: null,
      name: null,
      chats: []
    };
  },
  created: function() {
    this.token = localStorage.getItem('pm_token');
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
        console.log(this.chats);
      }
    );
  },
  methods: {
    save: function() {
      saveAs(
        new Blob(["Hello, world!"], { type: "text/plain;charset=utf-8" }),
        "321.txt"
      );
    }
  },
  components: { ChatList }
};
</script>

<style>
.wrapper {
  max-width: 1000px;
  margin: auto;
}
</style>
