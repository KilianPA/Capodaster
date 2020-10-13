<template>
  <div class="relative-position full-height">
    <div class="text-center q-pa-md">
      <q-btn v-if="state.ready && !cameraStarted" color="primary" icon="camera_alt" label="Ouvrir la caméra" @click="startCamera" />
    </div>
    <div class="row full-width margin-bottom-page fixed-bottom">
      <q-separator v-if="cameraStarted" size="2px" spaced="20px" class="bg-primary"/>
      <div class="col-md-12 q-mb-lg text-center col-xs-12">
        <q-btn v-if="cameraStarted && state.ready" color="primary" @click="takePicture" round icon="camera_alt" size="20px"/>
        <q-btn v-if="cameraStarted && state.ready" class="q-ml-sm" color="primary" @click="stopCamera" round icon="check" size="12px"/>
      </div>
      <div class="col-md-12 col-xs-12 q-mb-md" ref="img"></div>
    </div>
    <q-separator v-if="cameraStarted" size="2px" spaced="20px" class="bg-primary"/>
    <q-linear-progress :query="progress < imgsToRecognize.length" v-if="progress > 0" class="q-mt-md" size="25px" :value="currentProgress" color="primary">
      <div class="absolute-full flex flex-center">
        <q-badge text-color="primay" :label="progressShow"/>
      </div>
    </q-linear-progress>
    <canvas ref="canvas" class="hidden" id="canvas"></canvas>
    <div v-if="!cameraStarted" class="q-pa-md q-mt-md">
      {{ chordsResult }}
    </div>
  </div>
</template>

<script>
import chordsMajor from '../resources/chordsMajor.json'
import chordsMinor from '../resources/chordsMinor.json'
import { Plugins } from '@capacitor/core'
import { createScheduler, createWorker, OEM, PSM } from 'tesseract.js'
const { CameraPreview } = Plugins
export default {
  name: 'TabCameraPreview',
  data () {
    return {
      cameraInstance: '',
      state: {
        ready: false
      },
      canvas: {
        width: 1280,
        height: 960
      },
      ctx: '',
      ticks: 0,
      progress: 0,
      imageSrc: '',
      cameraStarted: false,
      chronoCount: 0,
      chrono: '',
      result: '',
      worker: '',
      loop: '',
      imgsToRecognize: [],
      chordsResult: [],
      imgId: 1
    }
  },
  beforeDestroy () {
    this.cameraStarted = false
  },
  computed: {
    currentProgress () {
      return this.progress / this.imgsToRecognize.length
    },
    progressShow () {
      return 'Recherche d\'accord dans la photo..' + (this.currentProgress * 100).toFixed(0) + '%'
    },
    englishChords () {
      var arr = []
      arr = arr.concat(chordsMinor.map(chord => chord.name))
      arr = arr.concat(chordsMajor.map(chord => chord.name))
      return arr
    },
    frenchChords () {
      var arr = []
      arr = arr.concat(chordsMinor.map(chord => chord.french))
      arr = arr.concat(chordsMajor.map(chord => chord.french))
      return arr
    }
  },
  mounted () {
    this.ctx = this.$refs.canvas.getContext('2d')
    this.$refs.canvas.width = this.canvas.width
    this.$refs.canvas.height = this.canvas.height
    this.state.ready = true
    this.initScheduler().then(() => {
      this.state.ready = true
    })
  },
  methods: {
    startCamera () {
      this.progress = 0
      if (this.imgsToRecognize.length) {
        this.imgsToRecognize.forEach(img => {
          img.remove()
        })
        this.imgsToRecognize = []
      }
      this.cameraInstance = CameraPreview
      this.cameraInstance.start({
        toBack: true,
        rotateWhenOrientationChanged: false
      }).then(() => {
        this.$store.dispatch('tabIdentificator/setCamera', this.cameraInstance)
        this.cameraStarted = true
      })
    },
    initPictureAuto () {
      this.loop = setInterval(() => this.takePicture(), 1000)
      setTimeout(() => {
        console.log('Stop loop')
        clearInterval(this.loop)
      }, 10000)
    },
    takePicture () {
      this.cameraInstance.capture().then((result) => {
        var data = 'data:image/jpeg;base64,' + result.value
        this.createImg(data)
        // this.imageSrc = this.currentImage
        // this.recognize(this.$refs.imgSrc)
      })
    },
    createImg (base64) {
      var img = document.createElement('img')
      img.src = base64
      img.id = 'img' + this.imgId
      img.classList.add('img-preview')
      img.width = 50
      img.height = 50
      this.$refs.img.appendChild(img)
      img.onload = () => {
        this.imgsToRecognize.push(img)
      }
      this.imgId++
    },
    startRecognize () {
      this.$q.loading.show({
        delay: 400 // ms
      })
      this.imgsToRecognize.forEach((img, index) => {
        this.recognize(img, index)
      })
    },
    stopCamera () {
      this.startRecognize()
      this.cameraStarted = false
      this.$store.dispatch('tabIdentificator/setCamera', null)
      clearInterval(this.loop)
      // window.cancelAnimationFrame(this.takePicture)
      this.cameraInstance.stop()
    },
    async recognize (img, index) {
      console.log('Recognize..')
      console.log(img)
      this.ctx.drawImage(img, 0, 0, this.$refs.canvas.width, this.$refs.canvas.height)
      // Tesseract.recognize(
      //   this.$refs.canvas,
      //   'fra',
      //   { logger: m => console.log(m) }
      // ).then(({ data: { text } }) => {
      //   this.result += ' ' + (text)
      // })
      this.addJobScheduler(this.$refs.canvas, index)
      // var lng = 'fra'
      // var worker = createWorker({
      //   workerPath: './tesseract/worker.min.js',
      //   corePath: './tesseract/tesseract-core.wasm.js',
      //   langPath: './tesseract/langs',
      //   logger: m => {
      //     this.log = (m)
      //     // console.log(m)
      //     if (m.status === 'loading tesseract core') {
      //       // this.$q.loading.show({
      //       //   delay: 400 // ms
      //       // })
      //     }
      //     if (m.status === 'recognizing text') {
      //       this.progress = m.progress
      //     }
      //   }
      // })
      // await worker.load()
      // await worker.loadLanguage(lng)
      // await worker.initialize(lng, OEM.TESSERACT_ONLY)
      // await worker.setParameters({
      //   tessedit_pageseg_mode: PSM.AUTO
      // })
      // const { data: { text } } = await worker.recognize(this.$refs.canvas)
      // if (text) {
      //   console.log(text)
      //   // this.formatText(text)
      // } else {
      //   console.log('no text')
      // }
      // worker.terminate()
    },
    async createOwnWorker () {
      var lng = 'fra'
      var worker = createWorker({
        workerPath: './tesseract/worker.min.js',
        corePath: './tesseract/tesseract-core.wasm.js',
        langPath: './tesseract/langs',
        logger: m => {
          this.log = (m)
          console.log(m)
          if (m.status === 'loading tesseract core') {
            // this.$q.loading.show({
            //   delay: 400 // ms
            // })
          }
          if (m.status === 'recognizing text') {
            // this.progress = m.progress
          }
        }
      })
      await worker.load()
      await worker.loadLanguage(lng)
      await worker.initialize(lng, OEM.TESSERACT_ONLY)
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO
      })
      return worker
    },
    async initScheduler (image) {
      const worker = await this.createOwnWorker()
      const worker1 = await this.createOwnWorker()
      this.scheduler = createScheduler()
      this.scheduler.addWorker(worker)
      this.scheduler.addWorker(worker1)
      return this.scheduler
      // const { data: { text } } = await scheduler.addJob('recognize', image, options);
    },
    async addJobScheduler (img, index) {
      this.scheduler.addJob('recognize', img).then(data => {
        this.$q.loading.hide()
        console.log(index, this.imgsToRecognize.length)
        this.formatText(data.data.text)
        this.progress++
      })
    },
    formatText (text) {
      text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      var arr = []
      this.frenchChords.forEach(chord => {
        if (text.includes(chord.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) {
          arr.push(chord)
        }
      })
      if (!arr.length) {
        this.englishChords.forEach(chord => {
          if (text.includes(chord.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) {
            arr.push(chord)
          }
        })
      }
      arr.forEach(chord => {
        if (!this.chordsResult.includes(chord)) {
          this.chordsResult.push(chord)
        }
      })
    }
  }
}
</script>

<style>

</style>
