<template>
  <q-footer>
    <q-tabs
      class="bg-accent"
      v-model="tab"
      narrow-indicator
    >
      <q-route-tab
        icon="img:capodaster.svg"
        to="/capodaster"
        exact
      />
      <q-route-tab
        icon="img:chord_white.svg"
        to="/chords"
        exact
      />
<!--      <q-route-tab-->
<!--        icon="visibility"-->
<!--        to="/tab-identificator"-->
<!--        exact-->
<!--      />-->
<!--      <q-route-tab-->
<!--        icon="people"-->
<!--        to="/tuner"-->
<!--        exact-->
<!--      />-->
    </q-tabs>
  </q-footer>
</template>

<script>
export default {
  name: 'MenuNavigation',
  data () {
    return {
      tab: 'mails'
    }
  },
  mounted () {
  }
}
</script>

<style scoped>

</style>
