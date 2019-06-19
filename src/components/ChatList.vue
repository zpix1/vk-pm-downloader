<template>
  <v-layout row>
    <v-flex>
      <v-card>
        <v-list subheader>
          <v-subheader>Выбрать чаты</v-subheader>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>Выбрать все</v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-checkbox color="green" v-model="allSelected"></v-checkbox>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-tile
            v-for="c in chats.slice(0, showChatsCount)"
            :key="c.peer_id"
            avatar
          >
            <v-list-tile-avatar>
              <img :src="c.peerInfo.photo_100">
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>{{ c.peerInfo.first_name }} {{ c.peerInfo.last_name }}</v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-checkbox v-model="c.selected"></v-checkbox>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-tile v-if="chats.length > showChatsCount">
            <v-list-tile-content>
              <v-list-tile-title>И еще {{chats.length - showChatsCount}} {{declOfNum(chats.length - showChatsCount, ['чат', 'чата', 'чатов'])}}</v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-checkbox v-model="notShowSelected"></v-checkbox>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import {declOfNum} from '../libs/helper';

export default {
  name: "ChatList",
  props: ["chats"],
  data: function () {
    return {
      showChatsCount: 10
    }
  },
  methods: {
    declOfNum: declOfNum
  },
  computed: {
    allSelected: {
      get: function() {
        // console.log(this.chats.every(c => c.selected));
        return this.chats.every(c => c.selected);
      },
      set: function() {
        let t = !this.allSelected;
        for (let i = 0; i < this.chats.length; i++) {
          this.chats[i].selected = t;
        }
        this.$forceUpdate();
      }
    },
    notShowSelected: {
      get: function () {
        return this.chats.slice(this.showChatsCount).every(c => c.selected);
      },
      set: function () {
        let t = !this.notShowSelected;
        for (let i = this.showChatsCount; i < this.chats.length; i++) {
          this.chats[i].selected = t;
        }
        this.$forceUpdate();
      }
    }
  }
};
</script>

<style>
</style>
