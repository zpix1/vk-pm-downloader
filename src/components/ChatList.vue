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
          <v-list-tile v-for="c in chats.slice(0, showChatsCount)" :key="c.peer_id" avatar>
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
            <a v-if="!selectLast" @click="unlockDialog = true">разблокировать</a>
            <v-list-tile-action v-if="selectLast">
              <v-checkbox v-model="notShowSelected"></v-checkbox>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-flex>
    <v-dialog v-model="unlockDialog" width="700">
    <v-card>
      <v-card-title class="headline" primary-title>Разблокировка</v-card-title>
      <v-card-text>
        <p>Сейчас VK PM Downloader может загружать максимум {{ showChatsCount }} чатов, однако вы можете разблокировать его, чтобы загружать до 1000 чатов.</p>
        <p>Разблокировка стоит <b>150 рублей</b>, чтобы купить - свяжитесь со мной в Telegram - <a href="https://tglink.ru/zpix1">@zpix1</a> или по почте <a href="mailto:zpix-dev@list.ru">zpix-dev@list.ru</a></p>
        <v-form>
          <v-text-field v-model="code" mask="####-####-####-####" label="Код активации"></v-text-field>
          <v-btn color="success" @click="checkCode">активировать</v-btn>
        </v-form>
        <v-alert :value="error" type="error">{{ error }}</v-alert>
      </v-card-text>
    </v-card>
  </v-dialog>
  </v-layout>
</template>

<script>
import { declOfNum, checkActivationCode } from "../libs/helper";

export default {
  name: "ChatList",
  props: ["chats"],
  data: function() {
    return {
      error: null,
      code: "",
      showChatsCount: 10,
      selectLast: false,
      unlockDialog: false
    };
  },
  methods: {
    declOfNum: declOfNum,
    checkCode: function () {
      if (checkActivationCode(this.code)) {
        this.selectLast = true;
        localStorage.setItem('pm_activation_code', this.code);
        this.error = null;
        this.unlockDialog = false;
      } else {
        this.error = 'Введенный код не валиден'
      }
    }
  },
  created: function() {
    this.code = localStorage.getItem('pm_activation_code', this.code);
    if (checkActivationCode(this.code)) {
      this.selectLast = true;
      localStorage.setItem('pm_activation_code', this.code);
    }
  },
  watch: {
    chats: function (oldV, newV) {
      if (!this.selectLast) {
        for (let i = this.showChatsCount; i < this.chats.length; i++) {
          this.chats[i].selected = false;
        }
        this.$forceUpdate();
      }
    }
  },
  computed: {
    allSelected: {
      get: function() {
        if (!this.selectLast) {
          return this.chats.slice(0, this.showChatsCount).every(c => c.selected);
        } else {
          return this.chats.every(c => c.selected);
        }
      },
      set: function() {
        let t = !this.allSelected;
        for (let i = 0; i < (this.selectLast ? this.chats.length : this.showChatsCount); i++) {
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
</style>
