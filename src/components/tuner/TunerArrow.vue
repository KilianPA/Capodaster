<template>
  <div>
    <div ref="containerInterval" class="container-item-interval row text-center justify-center relative-position q-mt-lg">
      <div class="container-cursor" :style="{left: leftCursor + 'px'}">
        <q-separator color="red" class="cursor-tuner margin-auto rounded-borders" size="2px" vertical/>
      </div>
      <div class="item-interval col-1" v-for="n in itemsInterval" :key="n.text">
        <div :style="{height: n.lineHeight}" class="full-width text-center">
          <q-separator class="margin-auto rounded-borders" size="2px" vertical/>
        </div>
        <div class="full-width text-tuner-interval q-mt-xs text-grey"> {{ n.text }} </div>
      </div>
    </div>
    <div class="full-width text-center text-chord" v-if="currentNote">
      {{ currentNote.note }}
    </div>
  </div>
</template>

<script>
export default {
  props: ['value'],
  name: 'TunerArrow',
  computed: {
  },
  data () {
    return {
      step: 0,
      itemsInterval: [
        {
          lineHeight: '8px',
          text: '-30'
        },
        {
          lineHeight: '15px',
          text: '-20'
        },
        {
          lineHeight: '18px',
          text: '-15'
        },
        {
          lineHeight: '23px',
          text: '-10'
        },
        {
          lineHeight: '28px',
          text: '-5'
        },
        {
          lineHeight: '31px',
          text: '0'
        },
        {
          lineHeight: '28px',
          text: '5'
        },
        {
          lineHeight: '23px',
          text: '10'
        },
        {
          lineHeight: '18px',
          text: '15'
        },
        {
          lineHeight: '13px',
          text: '20'
        },
        {
          lineHeight: '8px',
          text: '30'
        }
      ],
      notesFrequency: [],
      freqDefault: 440,
      currentNote: null,
      leftCursor: 0
    }
  },
  mounted () {
    this.initNoteFrequency()
    this.step = (parseInt(getComputedStyle(document.querySelector('.item-interval')).width))
  },
  methods: {
    initNoteFrequency () {
      this.notesFrequency = []
      for (var i = 0; i < 40; i++) {
        this.notesFrequency.push(this.generateChordFrequency(i))
        this.notesFrequency.push(this.generateChordFrequency(-Math.abs(i)))
      }
      this.result = this.notesFrequency[2]
      this.result.index = 2
    },
    generateChordFrequency (p) {
      var A4 = this.freqDefault
      var C0 = A4 * Math.pow(2, -4, 75)
      // const chords = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
      const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
      var a = (Math.pow(2, (1 / 12)))
      var freq = (A4 * Math.pow(a, p))
      var h = Math.round(12 * Math.log2(freq / C0))
      var n = h % 12
      return { freq: freq, note: notes[n] }
    },
    getClosestFreq (freq) {
      var frequenceFound = (this.closest(this.notesFrequency.map(f => f.freq), freq))
      return this.notesFrequency.filter((f, x) => {
        if (f.freq === frequenceFound) {
          f.index = x
          return f
        }
      })[0]
    },
    closest (array, num) {
      var i = 0
      var minDiff = 1000
      var ans
      for (i in array) {
        var m = Math.abs(num - array[i])
        if (m < minDiff) {
          minDiff = m
          ans = array[i]
        }
      }
      return ans
    },
    setCursor: function (interval) {
      var sign = (Math.sign(interval))
      // console.log('interval '- + interval)
      interval = Math.abs(interval * 100).toFixed(2)
      if (interval > 30) {
        interval = 30
      }
      var { value, min } = this.getCloserStep(parseInt(interval))
      var finalPixel = (value) * (this.step * 2)
      if (interval < 30) {
        finalPixel += (((interval - min) * (this.step * 2)) / 5)
      }
      this.leftCursor = (finalPixel * (sign *= -1))
    },
    getCloserStep (interval) {
      if (interval < 5) return { value: 0, min: 0 }
      if (interval > 5 && interval < 10) return { value: 1, min: 5 }
      if (interval > 10 && interval < 15) return { value: 2, min: 10 }
      if (interval > 15 && interval < 20) return { value: 3, min: 15 }
      if (interval > 20 && interval < 30) return { value: 4, min: 20 }
      if (interval >= 30) return { value: 5, min: 30 }
      return { value: 0, min: 0 }
    }
  },
  watch: {
    value () {
      this.currentNote = (this.getClosestFreq(this.value))
      // console.log('Frequence juste', this.currentNote.freq)
      // console.log('Frequence trouvée', this.value)
      if (this.currentNote) {
        this.setCursor(this.currentNote.freq - this.value)
      }
    }
  }
}
</script>

<style>

</style>
