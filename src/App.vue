<template>
  <v-app id="app">
    <main>
      <div class="header">PM Downloader</div>
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
  }
};
</script>

<style>
.header {
  text-align: center;
  font-size: 30px;
}
</style>
