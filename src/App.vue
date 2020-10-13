<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script>
export default {
  created () {
    this.$q.dark.set(true)
  },
  name: 'App'
}
</script>
