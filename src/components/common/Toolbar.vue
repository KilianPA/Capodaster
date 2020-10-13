<template>
    <q-toolbar class="text-white bg-accent rounded-borders text-center">
      <q-toolbar-title>
        {{  title  }}
      </q-toolbar-title>
    </q-toolbar>
</template>

<script>
export default {
  name: 'Toolbar',
  computed: {
    title () {
      return this.$store.getters['toolbar/getTitle']
    }
  },
  data () {
    return {
      state: {
        title: ''
      }
    }
  }
}
</script>
