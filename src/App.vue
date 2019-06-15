<template>
  <div id="app">
    <div class="header">PM Downloader</div>
    <div class="wrapper">
      <Main/>
    </div>
  </div>
</template>

<script>
import Main from './components/Main.vue'

export default {
  name: 'app',
  components: {
    Main
  }
}
</script>

<style>
.header {
  text-align: center;
  font-size: 30px;
}
.wrapper {
  text-align: center;
  padding: 20px;
}
</style>
