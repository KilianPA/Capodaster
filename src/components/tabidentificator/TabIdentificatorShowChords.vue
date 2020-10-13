<template>
  <div>
    <div class="full-width">
      <q-chip removable v-for="(chord, index) in chords" :key="index">
        {{ chord }}
      </q-chip>
    </div>
  </div>
</template>

<script>
export default {
  props: { chords: Array },
  name: 'TabIdentificatorShowChords'
}
</script>

<style scoped>

</style>
