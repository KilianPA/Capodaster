<template>
  <div>
    coucou
  </div>
</template>

<script>
export default {
  name: 'PageIndex',
  components: {},
  mounted () {
    this.$store.dispatch('toolbar/setTitle', 'Accueil')
  }
}
</script>
