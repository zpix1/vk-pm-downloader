<template>
  <v-layout row>
    <v-flex>
      <v-card>
        <v-list subheader>
          <v-subheader>Выбрать чаты</v-subheader>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>Выбрать диапазон</v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-text-field
                :rules="chatRangeTextRules"
                style="max-width: 190px;"
                v-model="chatRangeText"
              ></v-text-field>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>Выбрать все</v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-action @click="chatsUpdated">
              <v-checkbox color="green" v-model="allSelected"></v-checkbox>
            </v-list-tile-action>
          </v-list-tile>

          <!-- <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>Выбрать только личные диалоги</v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-action @click="chatsUpdated">
              <v-checkbox color="green" v-model="otherSelected"></v-checkbox>
            </v-list-tile-action>
          </v-list-tile> -->

          <v-list-tile v-for="c in chats.slice(0, showChatsCount)" :key="c.peer_id" avatar>
            <v-list-tile-avatar>
              <img :src="c.peerInfo.photo_100" />
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>{{ c.peerInfo.first_name }} {{ c.peerInfo.last_name }}</v-list-tile-title>
            </v-list-tile-content>

            <v-chip @click="selectType('group')" v-if="c.type === 'group'">Группа</v-chip>
            <v-chip @click="selectType('chat')"  v-if="c.type === 'chat'">Беседа</v-chip>
            <v-chip @click="selectType('user')"  v-if="c.type === 'user'">Пользователь</v-chip>

            <v-list-tile-action @click="chatsUpdated">
              <v-checkbox v-model="c.selected"></v-checkbox>
            </v-list-tile-action>
          </v-list-tile>

          <v-list-tile v-if="chats.length > showChatsCount">
            <v-list-tile-content>
              <v-list-tile-title>И еще {{chats.length - showChatsCount}} {{declOfNum(chats.length - showChatsCount, ['чат', 'чата', 'чатов'])}}</v-list-tile-title>
            </v-list-tile-content>

            <v-btn color='primary' v-if="!selectLast" @click="unlockDialog = true">разблокировать</v-btn>

            <v-btn color='info' v-if="selectLast" @click="showAll = !showAll"> {{ showAll ? 'свернуть': 'развернуть' }} </v-btn>

            <!-- <v-list-tile-action v-if="selectLast" @click="chatsUpdated">
              <v-checkbox v-model="notShowSelected"></v-checkbox>
            </v-list-tile-action> -->
          </v-list-tile>

          <div v-if="(chats.length > showChatsCount) && (showAll)" transition="scale-transition">
            <v-list-tile
              v-for="c in chats.slice(showChatsCount, chats.length)"
              :key="c.peer_id"
              avatar
            >
              <v-list-tile-avatar>
                <img :src="c.peerInfo.photo_100" />
              </v-list-tile-avatar>

              <v-list-tile-content>
                <v-list-tile-title>{{ c.peerInfo.first_name }} {{ c.peerInfo.last_name }}</v-list-tile-title>
              </v-list-tile-content>

              <v-chip @click="selectType('group')" v-if="c.type === 'group'">Группа</v-chip>
              <v-chip @click="selectType('chat')"  v-if="c.type === 'chat'">Беседа</v-chip>
              <v-chip @click="selectType('user')"  v-if="c.type === 'user'">Пользователь</v-chip>

              <v-list-tile-action @click="chatsUpdated">
                <v-checkbox v-model="c.selected"></v-checkbox>
              </v-list-tile-action>
            </v-list-tile>
          </div>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import {
  declOfNum,
  checkActivationCode,
  getRanges,
  loadRanges
} from "../libs/helper";

export default {
  name: "ChatList",
  props: ["chats", "userid"],
  data: function() {
    return {
      error: null,
      code: "",
      showChatsCount: 10,
      showAll: false,
      selectLast: false,
      chatRangeText: null,
      chatRangeTextRules: [
        v => !!v || "введите диапазон",
        v =>
          !!loadRanges(
            v,
            this.selectLast ? this.chats.length : this.showChatsCount
          ) || "диапазон не валиден"
      ]
    };
  },
  methods: {
    declOfNum: declOfNum,
    chatsUpdated: function() {
      var selected = [];
      for (var i = 0; i < this.chats.length; i++) {
        if (this.chats[i].selected) {
          selected.push(i);
        }
      }
      this.chatRangeText = getRanges(selected).join(", ");
    },
    selectType(type) {
      var selected = [];
      for (var i = 0; i < (this.selectLast ? this.chats.length : this.showChatsCount); i++) {
        if (this.chats[i].type === type) {
          selected.push(i);
          this.chats[i].selected = true;
        } else {
          // this.chats[i].selected = false;
        }
      }
      this.chatRangeText = getRanges(selected).join(", ");
    }
  },
  created: function() {
    this.code = localStorage.getItem("pm_activation_code", this.code);
    if (checkActivationCode(this.code)) {
      this.selectLast = true;
      localStorage.setItem("pm_activation_code", this.code);
    }
  },
  watch: {
    chats: function() {
      if (!this.selectLast) {
        for (let i = this.showChatsCount; i < this.chats.length; i++) {
          this.chats[i].selected = false;
        }
        this.$forceUpdate();
      }
      this.chatsUpdated();
    },
    chatRangeText: function(newV) {
      var range = loadRanges(
        newV,
        this.selectLast ? this.chats.length : this.showChatsCount
      );
      if (range) {
        for (var i = 0; i < this.chats.length; i++) {
          this.chats[i].selected = range[i];
        }
        this.$forceUpdate();
      }
    }
  },
  computed: {
    allSelected: {
      get: function() {
        if (!this.selectLast) {
          return this.chats
            .slice(0, this.showChatsCount)
            .every(c => c.selected);
        } else {
          return this.chats.every(c => c.selected);
        }
      },
      set: function() {
        let t = !this.allSelected;
        for (
          let i = 0;
          i < (this.selectLast ? this.chats.length : this.showChatsCount);
          i++
        ) {
          this.chats[i].selected = t;
        }
        this.$forceUpdate();
      }
    },
    notShowSelected: {
      get: function() {
        return this.chats.slice(this.showChatsCount).every(c => c.selected);
      },
      set: function() {
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
span.v-chip__content {
    user-select: none; /* standard syntax */
    -webkit-user-select: none; /* webkit (safari, chrome) browsers */
    -moz-user-select: none; /* mozilla browsers */
    -khtml-user-select: none; /* webkit (konqueror) browsers */
    -ms-user-select: none; /* IE10+ */
}
</style>
