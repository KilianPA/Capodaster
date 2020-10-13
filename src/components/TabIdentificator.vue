<template>
  <div>
    <canvas id="canvas" style='display:none'></canvas>
<!--    <video :style="{height: '150px', width: '150px'}" id="video" autoplay ></video>-->

    <tab-camera-preview/>
<!--    <q-card class="q-pa-md">-->
<!--      <img class="hidden" src="img.jpg" id="text-img"/>-->
<!--      <input type="file" @change="getFile"/>-->
<!--      <q-inner-loading :showing="loading">-->
<!--        <q-spinner-tail size="50px" color="primary" />-->
<!--      </q-inner-loading>-->
<!--      <q-linear-progress v-if="progress > 0" class="q-mt-md" size="25px" :value="progress" color="primary">-->
<!--        <div class="absolute-full flex flex-center">-->
<!--          <q-badge text-color="primay" :label="progressShow" />-->
<!--        </div>-->
<!--      </q-linear-progress>-->
<!--      <div class="q-mt-md">-->
<!--        {{ log }}-->
<!--      </div>-->
<!--      <img ref="source" class="hidden"/>-->
<!--      <img ref="result" class="hidden"/>-->
<!--      <canvas ref="canvas" class="canvas"/>-->
<!--    </q-card>-->
    <q-card v-if="chordsResult.length" class="q-pa-md q-mt-md">
      <tab-identificator-show-chords :chords="chordsResult"/>
      <q-separator class="q-mt-md"/>
      <div class="text-center q-mt-md">
        <q-btn @click="goToChordsFormatter" color="primary" outline> Transposer automatiquement </q-btn>
        <q-btn class="q-mt-md" @click="goToCapodaster" color="primary" outline> Transposer avec le capo </q-btn>
      </div>
    </q-card>
  </div>
</template>

<script>
const FRAMES_X = 200 // calculate every x frames

const WIDTH = 640
const HEIGHT = 480
// const TIMEOUT = 500

let video, canvas, ctx

const pica = require('pica')()
import chordsMajor from './resources/chordsMajor.json'
import chordsMinor from './resources/chordsMinor.json'
import Tesseract, { createWorker, PSM, OEM } from 'tesseract.js'
import { uid } from 'quasar'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import TabIdentificatorShowChords from 'components/tabidentificator/TabIdentificatorShowChords'
import TabCameraPreview from 'components/tabidentificator/TabCameraPreview'
export default {
  name: 'TabIdentificator',
  components: {
    TabCameraPreview,
    TabIdentificatorShowChords
  },
  data () {
    return {
      cameraPreview: '',
      file: '',
      imageSrc: '',
      canvas: '',
      context: '',
      chronoCount: 0,
      currentSize: 0,
      chrono: 0,
      chordsResult: [],
      loading: false,
      worker: null,
      progress: 0,
      log: '',
      dropzoneOptions: {
        url: this.getFile,
        thumbnailWidth: 150
      },
      ticks: 0,
      constraints: {
        audio: false,
        video: true,
        advanced: [{
          facingMode: 'environment'
        }]
      }

    }
  },
  computed: {
    allChords () {
      var arr = []
      arr = arr.concat(this.englishChords)
      arr = arr.concat(this.frenchChords)
      return arr
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
    },
    progressShow () {
      return 'Recherche d\'accord dans la photo..' + (this.progress * 100).toFixed(0) + '%'
    }
  },
  mounted () {
    this.$store.dispatch('toolbar/setTitle', 'Idendificateur de tablature')
    // this.$refs.imgSrc.onload = () => {
    //   this.chrono = setInterval(() => { this.chronoCount++ }, 1000)
    //   // this.recognize(this.$refs.imgSrc)
    // }
    // console.log(navigator)
    // navigator.mediaDevices
    //   .getUserMedia(this.constraints)
    //   .then(this.handleSuccess)
    //   .catch((error) => console.log(error))
    // if (!navigator.mediaDevices && !navigator.getUserMedia && !navigator.webkitGetUserMedia &&
    //   !navigator.mozGetUserMedia && !navigator.msGetUserMedia) {
    //   alert('User Media API not supported.')
  },
  methods: {
    getChord (chord) {
      if (chord.includes('m')) {
        if (chordsMinor.filter(c => c.french === chord).length) {
          return (chordsMinor.filter(c => c.french === chord)[0].name)
        }
        if (chordsMinor.filter(c => c.name === chord).length) {
          return (chordsMinor.filter(c => c.name === chord)[0].name)
        }
      } else {
        if (chordsMajor.filter(c => c.french === chord).length) {
          return (chordsMajor.filter(c => c.french === chord)[0].name)
        }
        if (chordsMajor.filter(c => c.name === chord).length) {
          return (chordsMajor.filter(c => c.name === chord)[0].name)
        }
      }
    },
    formatChord () {
      var arr = []
      this.chordsResult.forEach(chord => {
        arr.push({
          value: this.getChord(chord),
          id: uid()
        })
      })
      return arr
    },
    goToChordsFormatter () {
      this.$router.push({
        name: 'chords',
        params: { chords: this.formatChord() }
      })
    },
    goToCapodaster () {
      this.$router.push({
        name: 'capodaster',
        params: { chords: this.formatChord() }
      })
    },
    async getFile (e) {
      this.chrono = setInterval(() => { this.chronoCount++ }, 1000)
      this.showFile(e.target.files[0])
      const resizedCanvas = document.createElement('canvas')
      var scale = 5
      this.$refs.source.onload = () => {
        resizedCanvas.height = this.$refs.source.height / scale
        resizedCanvas.width = this.$refs.source.width / scale
        this.resizeImage(this.$refs.source, resizedCanvas)
      }
      // setTimeout(() => {

      // }, 100)
    },
    readURL (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target.result)
        reader.onerror = e => reject(e)
        reader.readAsDataURL(file)
      })
    },
    async recognize (file) {
      var lng = 'fra'
      this.worker = createWorker({
        workerPath: './tesseract/worker.min.js',
        corePath: './tesseract/tesseract-core.wasm.js',
        langPath: './tesseract/langs',
        logger: m => {
          this.log = (m)
          if (m.status === 'loading tesseract core') {
            this.$q.loading.show({
              delay: 400 // ms
            })
          }
          if (m.status === 'recognizing text') {
            this.$q.loading.hide()
            this.progress = m.progress
          }
        }
      })
      await this.worker.load()
      await this.worker.loadLanguage(lng)
      await this.worker.initialize(lng, OEM.TESSERACT_ONLY)
      await this.worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO
      })
      const { data: { text } } = await this.worker.recognize(file)
      this.worker.terminate()
      this.formatText(text)
    },
    async recognize2 (file) {
    },
    resizeImage (from, to) {
      pica.resize(from, to, {
        quality: 0,
        unsharpAmount: 200,
        unsharpRadius: 0.5
        // unsharpThreshold: 0.255
      })
        .then(result => {
          this.$refs.result.src = result.toDataURL()
          setTimeout(() => {
            this.addBorder(this.$refs.result)
          }, 100)
        })
    },
    addBorder (img) {
      this.canvas = this.$refs.canvas
      this.context = this.canvas.getContext('2d')
      this.drawImage(img)
      this.context.lineWidth = '6'
      this.context.rect(0, 0, img.width, img.height)
      this.context.strokeStyle = '#7c1818'
      this.context.strokeWidth = 1
      this.context.stroke()
      this.canvas.toBlob(blob => {
        this.currentSize = ((blob.size / 1024 / 1024).toFixed(2) + 'MB')
      })
      this.recognize(this.canvas)
      // for (var i = 0; i < data.length; i++) {
      //   if (i < (img.width * 3)) {
      //     data[i] = 255
      //   }
      // }
      // this.context.putImageData(imageData, 0, 0)
    },
    drawImage (image) {
      // Set the canvas the same width and height of the image
      this.canvas.width = image.width
      this.canvas.height = image.height
      this.context.drawImage(image, 0, 0)
    },
    showFile (file) {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        this.$refs.source.src = e.target.result
      }
    },
    urltoFile (url, filename, mimeType) {
      return (fetch(url)
        .then(function (res) { return res.arrayBuffer() })
        .then(function (buf) { return new File([buf], filename, { type: mimeType }) })
      )
    },
    captureImage () {
      // CameraPreview.start({
      //   toBack: true,
      //   rotateWhenOrientationChanged: false
      // }).then(() => {
      //   // CameraPreview.capture().then(result => {
      //   //   this.currentImage = 'data:image/jpeg;base64,' + result.value
      //   //   console.log(this.currentImage)
      //   //   this.imageSrc = this.currentImage
      //   //   CameraPreview.stop()
      //   // })
      // })
      // requestAnimationFrame(this.captureImage)
      // const image = await Camera.getPhoto({
      //   quality: 20,
      //   allowEditing: false,
      //   preserveAspectRatio: true,
      //   saveToGallery: false,
      //   resultType: CameraResultType.Uri
      // })
      // // image.webPath will contain a path that can be set as an image src.
      // // You can access the original file using image.path, which can be
      // // passed to the Filesystem API to read the raw data of the image,
      // // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
      // this.imageSrc = image.webPath
    },
    tick () {
      this.ticks++
      window.requestAnimationFrame(this.tick)
      if (this.ticks % FRAMES_X !== 0) return
      console.log('tick')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      console.log(canvas)
      Tesseract.recognize(
        canvas,
        'fra'
      ).then(({ data: { text } }) => {
        console.log(text)
        this.formatText(text)
      })
    },
    handleSuccess (stream) {
      video = document.querySelector('#video')
      canvas = document.querySelector('#canvas')
      ctx = canvas.getContext('2d')
      canvas.width = WIDTH
      canvas.height = HEIGHT

      window.stream = stream // make stream available to browser console
      video.srcObject = stream
      window.requestAnimationFrame(this.tick)
    }

  }
}
</script>

<style >
  .img-responsive {
    display: block;
    width: 100%;
    max-width: 100%;
    height: auto;
  }
  .test {
  }

  .canvas {
    max-width: 100%;
  }
</style>
