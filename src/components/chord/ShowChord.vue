<template>
  <vc-chord-diagram bg-color="#494977" :color="color || randomColor()" :position="formatChord(chord).startAt !== 0 " :title="chord" width="50" height="50" :setup="formatChord(chord)" />
</template>

<script>
import chordsStrings from '../resources/chordsString.json'
import 'vc-chord-diagram/dist/lib/vc-chord-diagram.min.css'
import VcChordDiagram from 'vc-chord-diagram'
export default {
  props: {
    chord: String,
    color: String
  },
  components: { VcChordDiagram },
  data () {
    return {
      colors: ['#5cabfe', '#ff6a9a', '#8d80ff'],
      chordsStrings: chordsStrings,
      template: {
        startAt: 1, // position to start the chord at
        tuning: ['E', 'A', 'D', 'G', 'B', 'E'], // tuning
        strings: [{ // strings array, starting from the lowest string
          fret: 0, // fret (regardless of the startAt, frets should always start from 0)
          finger: 'x' // finger ('x' means muted, '0' - open string)
        }, {
          fret: 0,
          finger: 0
        }, {
          fret: 2,
          finger: 3
        }, {
          fret: 2,
          finger: 2
        }, {
          fret: 1,
          finger: 1
        }, {
          fret: 0,
          finger: 0
        }]
      }
    }
  },
  methods: {
    formatChord (chord) {
      var clone = Object.assign({}, this.template)
      if (this.chordsStrings.filter(c => c.name === chord).length) {
        var chordString = this.chordsStrings.filter(c => c.name === chord)[0]
        if (chordString.capo) {
          clone.startAt = chordString.capo
        }
        clone.strings = chordString.strings
      }
      return clone
    },
    randomColor () {
      return this.colors[Math.floor(Math.random() * this.colors.length)]
    }
  },
  name: 'ShowChord'
}
</script>

<style scoped>

</style>
