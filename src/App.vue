<template>
  <v-app id="app">
    <main>
      <div class="header">VK PM Downloader  v{{ v }} <span class="free-label">Now free and open source</span></div> 
      <Main/>
    </main>
  </v-app>
</template>

<script>
import Main from "./components/Main.vue";

export default {
  name: "app",
  components: {
    Main
  },
  computed: {
    v: function () {
      return process.env.VERSION;
    }
  }
};
</script>

<style>
.header {
  margin-top: 10px;
  text-align: center;
  font-size: 30px;
}

.free-label {
  font-size: 15px;
  text-decoration: underline;
  vertical-align: top;
}
</style>
