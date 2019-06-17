<template>
  <v-app id="app">
    <main>
      <div class="header">VK PM Downloader v1.0</div>
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
  margin-top: 10px;
  text-align: center;
  font-size: 30px;
}
</style>
