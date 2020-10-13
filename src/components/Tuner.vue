<template>
    <div v-if="result && permissionGranted" class="text-center full-width full-height">
      <div class="row q-pa-md container-tuner-block">
        <div class="col-md-4 col-xs-4 relative-position">
          <div :style="redBlock"
               :class="currentPos === 'left' ? 'text-center container-tuner container-red absolute-left' : 'text-center container-tuner absolute-left container-grey'"/>
        </div>
        <div class="text-center container-green col-md-4 col-xs-4">
          <div :style="greenBlock"
               :class="currentPos === 'center' ? 'bg-primary container-tuner' : 'container-grey container-tuner'"/>
        </div>
        <div class="col-md-4 col-xs-4 relative-position">
          <div :style="redBlock"
               :class="currentPos === 'right' ? 'container-tuner container-red absolute-right' : 'container-tuner container-grey absolute-right'"/>
        </div>
      </div>
      <div class="q-mt-lg text-h4 full-width text-primary text-weight-light text-center">
        <div v-if="hertz" class="text-bold"> {{ hertz.toFixed(2) }} hz</div>
        <div class="text-weight-light text-grey-5">{{ result.freq.toFixed(2) }} hz</div>
      </div>
      <div class="full-width q-mt-lg">
        <q-btn-toggle
          v-model="freqDefault"
          unelevated
          no-caps
          @input="initChordFrequency"
          :options="[
          {label: '440hz', value: 440},
          {label: '442hz', value: 442}
        ]"
        />
      </div>
      <q-page-sticky expand position="bottom" class="row q-page-sticky q-mb-md">
        <div class="full-width text-grey-5 row">
          <div class="col-4 text-chord-between">
            <span>
              {{ chordsPrevAndNext.prev }}
            </span>
          </div>
          <div class="col-4 text-center text-chord text-primary">
            <span>
              {{ result.chord }}
            </span>
          </div>
          <div class="col-4 text-chord-between">
            <span>
              {{ chordsPrevAndNext.next }}
            </span>
          </div>
        </div>
      </q-page-sticky>
    </div>
</template>

<script>
const Pitchfinder = require('pitchfinder')
const detectPitchDynamic = new Pitchfinder.DynamicWavelet()

export default {
  name: 'Tuner',
  components: {
  },
  data () {
    return {
      freqDefault: 442,
      deviceReady: false,
      permissionGranted: false,
      audioinput: '',
      result: '',
      hertz: '',
      perfectPitch: '',
      currentPitch: '',
      chordsFrequency: [],
      lockChord: {
        current: '',
        locked: false,
        occurence: 0
      }
    }
  },
  computed: {
    tunerIsLocked () {
      return this.lockChord.locked
    },
    chordsPrevAndNext () {
      var obj = {
        next: '',
        prev: ''
      }
      if (this.result && this.chordsFrequency.length) {
        obj.next = (this.chordsFrequency[this.result.index + 1].chord)
        obj.prev = (this.chordsFrequency[this.result.index - 1].chord)
      }
      return obj
    },
    currentFreq () {
      if (this.result.freq) {
        return this.result.freq.toFixed(2)
      } return null
    },
    currentPos () {
      var sign = (Math.sign(this.hertz - this.result.freq))
      var interval = Math.abs(this.hertz - this.result.freq)
      if (interval > 0.8) {
        return sign > 0 ? 'right' : 'left'
      }
      return 'center'
    },
    redBlock () {
      var width = (this.$q.screen.width / 5)
      return { width: width + 'px', height: width + 'px' }
    },
    greenBlock () {
      var width = (this.$q.screen.width / 4) + 'px'
      return { width: width, height: width }
    }
  },
  beforeDestroy () {
    if (window.audioinput.isCapturing()) {
      console.log('kill recorder')
      this.stopCapture()
    }
  },
  mounted () {
    this.$store.dispatch('toolbar/setTitle', 'Accordeur')
    this.initChordFrequency()
    this.startCapture()
    document.addEventListener('deviceready', () => {
      this.deviceReady = true
      window.audioinput.checkMicrophonePermission((hasPermission) => {
        if (hasPermission) {
          this.permissionGranted = true
        } else {
          // Ask the user for permission to access the microphone
          window.audioinput.getMicrophonePermission((hasPermission, message) => {
            if (hasPermission) {
              this.permissionGranted = true
            } else {
              console.warn('User denied permission to record.')
            }
          })
        }
      })
      window.addEventListener('audioinput', this.onAudioInputCapture, false)
    }, false)
  },
  methods: {
    startCapture () {
      var captureCfg = {
        sampleRate: window.audioinput.SAMPLERATE.CD_AUDIO_44100Hz,
        bufferSize: 16384,
        normalize: true
      }
      window.audioinput.initialize(captureCfg, () => {
        console.log('Start capture..')
        window.audioinput.start(captureCfg)
      })
    },
    stopCapture () {
      try {
        if (window.audioinput && window.audioinput.isCapturing()) {
          if (window.audioinput) {
            window.audioinput.stop()
            console.log('Stop capture..')
          }
        }
      } catch (e) {
        alert('stopCapture exception: ' + e)
      }
    },
    onAudioInputCapture (evt) {
      try {
        if (evt && evt.data) {
          this.convertToNote(evt.data)
        }
      } catch (ex) {
        alert('onAudioInputCapture ex: ' + ex)
      }
    },
    convertToNote (float32Array) {
      var freqDynamic = (detectPitchDynamic(float32Array))
      if (freqDynamic && freqDynamic > 49 && freqDynamic < 1347) {
        if (this.lockChord.locked && freqDynamic < (this.lockChord.current + 10) && freqDynamic > (this.lockChord.current - 10)) {
          this.formatFreq(freqDynamic)
        }
        if (!this.lockChord.locked) {
          this.formatFreq(freqDynamic)
        }
      }
    },
    formatFreq (freq) {
      this.result = this.getClosestFreq(freq)
      this.lockTuner(this.result.freq)
      this.hertz = freq
    },
    lockTuner (freq) {
      if (this.lockChord.current !== freq) {
        this.lockChord.current = freq
        this.lockChord.occurence = 0
      } else {
        this.lockChord.occurence++
      }
      this.lockChord.locked = this.lockChord.occurence > 2
    },
    getClosestFreq (freq) {
      var frequenceFound = (this.closest(this.chordsFrequency.map(f => f.freq), freq))
      return this.chordsFrequency.filter((f, x) => {
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
    initChordFrequency () {
      this.chordsFrequency = []
      for (var i = 0; i < 40; i++) {
        this.chordsFrequency.push(this.generateChordFrequency(i))
        this.chordsFrequency.push(this.generateChordFrequency(-Math.abs(i)))
      }
      this.result = this.chordsFrequency[2]
      this.result.index = 2
      console.log(this.result)
    },
    generateChordFrequency (p) {
      var A4 = this.freqDefault
      var C0 = A4 * Math.pow(2, -4, 75)
      // const chords = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
      const chords = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
      var a = (Math.pow(2, (1 / 12)))
      var freq = (A4 * Math.pow(a, p))
      var h = Math.round(12 * Math.log2(freq / C0))
      var n = h % 12
      return { freq: freq, chord: chords[n] }
    }
  },
  watch: {
    tunerIsLocked () {
      if (this.tunerIsLocked) {
        setTimeout(() => {
          this.lockChord.locked = false
        }, 1000)
      }
    }
  }
}
</script>

<style>

</style>
