<template>
  <div>
    <audio-input v-model="frequency" />
    <div v-if="currentNote">
<!--      {{ frequency.toFixed(2) }} / {{ currentNote.freq.toFixed(2) }}-->
<!--      {{ currentNote.note }}-->
    </div>
    <tuner-arrow v-model="frequency"/>
  </div>
</template>

<script>
import AudioInput from 'components/tuner/AudioInput'
import TunerArrow from 'components/tuner/TunerArrow'
export default {
  name: 'Tuner',
  components: { TunerArrow, AudioInput },
  data () {
    return {
      notesFrequency: [],
      freqDefault: 440,
      frequency: 0,
      currentNote: null
    }
  },
  mounted () {
    // this.frequency = (Math.random() * (165.10 - 164.51 + 1) + 164.51)
    // this.frequency = 165.4008911568945
    // setInterval(() => {
    //   this.frequency = (Math.random() * (165.10 - 164.51 + 1) + 164.51)
    // }, 1000)
  },
  methods: {
  },
  watch: {
  }
}
</script>

<style scoped>

</style>
