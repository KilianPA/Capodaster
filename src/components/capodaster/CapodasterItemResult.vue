<template>
  <div class="row">
    <div class="col-md-5 col-xs-5 text-center q-pa-md">
      <show-chord :chord="chord.previous"/>
    </div>
    <div class="col-md-2 col-xs-2 text-center relative-position">
      <q-icon class="absolute-center text-info" size="25px" name="arrow_right_alt"/>
    </div>
    <div class="col-md-5 col-xs-5 text-center q-pa-md">
      <show-chord :chord="chordName"/>
    </div>
  </div>
</template>

<script>
import ShowChord from 'components/chord/ShowChord'
export default {
  components: { ShowChord },
  props: {
    chord: Object
  },
  computed: {
    chordName () {
      if (this.chord) {
        return this.chord.name + ' / ' + this.chord.french
      } return ''
    }
  },
  name: 'CapodasterItemResult'
}
</script>

<style scoped>

</style>
