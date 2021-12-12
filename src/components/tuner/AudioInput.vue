<template>
  <div>
    <q-btn @click="startCapture">Start</q-btn>
    <q-btn @click="stopCapture">Stop</q-btn>
    {{ lock.array.length }}
    {{ averageFreq }}
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'AudioInput',
  data () {
    return {
      permissionGranted: false,
      deviceReady: false,
      frequency: 440,
      bufferSize: 4096,
      lock: {
        frequency: null,
        array: [],
        active: false,
        occurence: 0
      },
      fftSize: 2048,
      analyser: null,
      audioCtx: null,
      gainNode: null,
      lastRms: 0,
      rmsThreshold: 0.006,
      assessedStringsInLastFrame: false,
      assessStringsUntilTime: 0,
      frequencyBuffer: null,
      dispatchAnimation: null,
      strings: null,
      stringsKeys: null
    }
  },
  computed: {
    averageFreq () {
      var average = 0
      this.lock.array.forEach(val => {
        average += val
      })
      return average / this.lock.array.length
    }
  },
  mounted () {
    document.addEventListener('deviceready', () => {
      this.initAudio()
    }, false)
  },
  methods: {
    initAudio () {
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
    },
    initString () {
      this.strings = {
        e2: {
          offset: Math.round(this.audioCtx.sampleRate / 82.4069),
          difference: 0
        },

        a2: {
          offset: Math.round(this.audioCtx.sampleRate / 110),
          difference: 0
        },

        d3: {
          offset: Math.round(this.audioCtx.sampleRate / 146.832),
          difference: 0
        },

        g3: {
          offset: Math.round(this.audioCtx.sampleRate / 195.998),
          difference: 0
        },

        b3: {
          offset: Math.round(this.audioCtx.sampleRate / 246.932),
          difference: 0
        },

        e4: {
          offset: Math.round(this.audioCtx.sampleRate / 329.628),
          difference: 0
        }
      }
      this.stringsKeys = Object.keys(this.strings)
    },
    initAudioContext () {
      this.audioCtx = window.audioinput.getAudioContext()
      console.log(this.audioCtx)
      this.analyser = this.audioCtx.createAnalyser()
      this.gainNode = this.audioCtx.createGain()
      this.gainNode.gain.value = 0
      this.analyser.fftSize = this.fftSize
      this.analyser.smoothingTimeConstant = 0
      this.frequencyBuffer = new Float32Array(this.fftSize)
    },
    startCapture () {
      var captureCfg = {
        sampleRate: window.audioinput.SAMPLERATE.CD_AUDIO_44100Hz,
        bufferSize: this.bufferSize,
        normalize: true
      }
      window.audioinput.initialize(captureCfg, () => {
        console.log('Start capture..')
        window.audioinput.start(captureCfg)
        // this.initAudioContext()
        // this.initString()
        // window.audioinput.connect(this.analyser)
        // this.analyser.connect(this.gainNode)
        // this.gainNode.connect(this.audioCtx.destination)
        // this.dispatchAudioData()
      })
    },
    stopCapture () {
      try {
        if (window.audioinput && window.audioinput.isCapturing()) {
          if (window.audioinput) {
            window.audioinput.stop()
            console.log('Stop capture..')
            cancelAnimationFrame(this.dispatchAnimation)
          }
        }
      } catch (e) {
        alert('stopCapture exception: ' + e)
      }
    },
    onAudioInputCapture (evt) {
      try {
        if (evt && evt.data) {
          // console.log(evt)
          this.autocorrelateAudioData(evt.data)
          // console.log(this.findFrequency(evt.data, this.bufferSize))
        }
      } catch (ex) {
        alert('onAudioInputCapture ex: ' + ex)
      }
    },
    dispatchAudioData (time) {
      // var frequency = this.autocorrelateAudioData(time)
      // console.log(frequency)
      // this.dispatchAnimation = requestAnimationFrame(this.dispatchAudioData)
    },
    autocorrelateAudioData (frequencyBuffer) {
      // const searchSize = this.frequencyBufferLength * 0.5
      // let offsetKey = null
      // let offset = 0
      // let difference = 0
      // const tolerance = 0.001
      let rms = 0
      const rmsMin = 0.080
      // const assessedStringsInLastFrame = this.assessedStringsInLastFrame

      // Figure out the root-mean-square, or rms, of the audio. Basically
      // this seems to be the amount of signal in the buffer.
      for (let d = 0; d < frequencyBuffer.length; d++) {
        rms += frequencyBuffer[d] * frequencyBuffer[d]
      }

      rms = Math.sqrt(rms / frequencyBuffer.length)
      // // If there's little signal in the buffer quit out.
      if (rms < rmsMin) {
        return 0
      } else {
        var buffer = this.xcorr(frequencyBuffer, new Float32Array(frequencyBuffer.length))
        var locations = this.findpeaks(buffer)
        var diffs = this.diff(locations)
        var freq = window.audioinput.SAMPLERATE.CD_AUDIO_44100Hz / this.median(diffs)
        console.log(freq)
        this.$emit('input', freq)
      }
      //
      // // Only check for a new string if the volume goes up. Otherwise assume
      // // that the string is the same as the last frame.
      // if (rms > this.lastRms + this.rmsThreshold) { this.assessStringsUntilTime = time + 250 }
      //
      // if (time < this.assessStringsUntilTime) {
      //   this.assessedStringsInLastFrame = true
      //
      //   // Go through each string and figure out which is the most
      //   // likely candidate for the string being tuned based on the
      //   // difference to the "perfect" tuning.
      //   for (let o = 0; o < this.stringsKeys.length; o++) {
      //     offsetKey = this.stringsKeys[o]
      //     offset = this.strings[offsetKey].offset
      //     difference = 0
      //
      //     // Reset how often this string came out as the closest.
      //     if (assessedStringsInLastFrame === false) { this.strings[offsetKey].difference = 0 }
      //
      //     // Now we know where the peak is, we can start
      //     // assessing this sample based on that. We will
      //     // step through for this string comparing it to a
      //     // "perfect wave" for this string.
      //     for (let i = 0; i < searchSize; i++) {
      //       difference += Math.abs(this.frequencyBuffer[i] -
      //         this.frequencyBuffer[i + offset])
      //     }
      //
      //     difference /= searchSize
      //
      //     // Weight the difference by frequency. So lower strings get
      //     // less preferential treatment (higher offset values). This
      //     // is because harmonics can mess things up nicely, so we
      //     // course correct a little bit here.
      //     this.strings[offsetKey].difference += (difference * offset)
      //   }
      // } else {
      //   this.assessedStringsInLastFrame = false
      // }
      //
      // // If this is the first frame where we've not had to reassess strings
      // // then we will order by the string with the largest number of matches.
      // if (assessedStringsInLastFrame === true &&
      //   this.assessedStringsInLastFrame === false) {
      //   this.stringsKeys.sort(this.sortStringKeysByDifference)
      // }
      //
      // // Next for the top candidate in the set, figure out what
      // // the actual offset is from the intended target.
      // // We'll do it by making a full sweep from offset - 10 -> offset + 10
      // // and seeing exactly how long it takes for this wave to repeat itself.
      // // And that will be our *actual* frequency.
      // const searchRange = 10
      // const assumedString = this.strings[this.stringsKeys[0]]
      // const searchStart = assumedString.offset - searchRange
      // const searchEnd = assumedString.offset + searchRange
      // let actualFrequency = assumedString.offset
      // let smallestDifference = Number.POSITIVE_INFINITY
      //
      // for (let s = searchStart; s < searchEnd; s++) {
      //   difference = 0
      //
      //   // For each iteration calculate the difference of every element of the
      //   // array. The data in the buffer should be PCM, so values ranging
      //   // from -1 to 1. If they match perfectly then they'd essentially
      //   // cancel out. But this is real data so we'll be looking for small
      //   // amounts. If it's below tolerance assume a perfect match, otherwise
      //   // go with the smallest.
      //   //
      //   // A better version of this would be to curve match on the data.
      //   for (let i = 0; i < searchSize; i++) {
      //     difference += Math.abs(this.frequencyBuffer[i] -
      //       this.frequencyBuffer[i + s])
      //   }
      //
      //   difference /= searchSize
      //
      //   if (difference < smallestDifference) {
      //     smallestDifference = difference
      //     actualFrequency = s
      //   }
      //
      //   if (difference < tolerance) {
      //     actualFrequency = s
      //     break
      //   }
      // }
      //
      // this.lastRms = rms
      // return this.audioCtx.sampleRate / actualFrequency
    },
    xcorr (input, output) {
      var n = input.length,
        norm, sum, i, j

      for (i = 0; i < n; i++) {
        sum = 0
        for (j = 0; j < n; j++) {
          sum += (input[j] * (input[j + i] || 0)) // Pad input with zeroes
        }
        if (i === 0) norm = sum
        output[i] = sum / norm
      }
      return output
    },
    findpeaks (data) {
      var locations = [0]

      for (var i = 1; i < data.length - 1; i++) {
        if (data[i] > 0 && data[i - 1] < data[i] && data[i] > data[i + 1]) {
          locations.push(i)
        }
      }
      return locations
    },
    diff (data) {
      return data.reduce(function (acc, value, i) {
        acc[i] = data[i] - data[i - 1]; return acc
      }, []).slice(1)
    },
    median (data) {
      var half
      data.sort(function (a, b) { return a - b })
      half = Math.floor(data.length / 2)
      if (data.length % 2) { return data[half] } else { return (data[half - 1] + data[half]) / 2.0 }
    },
    lockFreq (freq) {
      this.lock.array.push(freq)
      // if (!this.lock.frequency) {
      //   this.lock.frequency = freq
      // }
      // if (freq <= (this.lock.frequency + 1) && freq >= (this.lock.frequency - 1)) {
      //   this.lock.occurence++
      //   if (this.lock.occurence === 3) {
      //     this.lock.active = true
      //     setTimeout(() => {
      //       this.lock.active = false
      //     }, 2000)
      //   }
      //   return freq
      // } else {
      //   if (!this.lock.active) {
      //     this.lock.frequency = freq
      //     this.lock.occurence = 0
      //     return freq
      //   }
      // }
    },
    findFrequency (buffer, sampleRate) {
    }
  },
  destroyed () {
    this.startCapture()
  },
  watch: {
    permissionGranted () {
      if (this.permissionGranted) {
        this.startCapture()
      }
    }
  }
}
</script>

<style scoped>

</style>
