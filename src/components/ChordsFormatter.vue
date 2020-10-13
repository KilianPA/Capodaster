<template>
  <div class="q-pa-lg margin-bottom-page">
    <q-card class="q-card-bg">
      <component-title title="Transposer des accords"/>
      <waves/>
      <div class="q-card-content">
        <item-title :title="title"/>
        <div class="q-pa-sm row">
            <chord-selector v-for="(chord) in chordsSelected" v-model="chordsSelected" :chord="chord" :key="chord.id"/>
        </div>
        <div class="text-center q-mt-sm">
          <q-btn @click="addChordSelector" color="info" size="10px" round icon="add"/>
        </div>
        <q-separator class="q-mt-md"/>
        <div class="text-center q-mt-md">
          <q-btn :disable="chordsSelected.length === 0" ref="submitBtn" :loading="loading" color="info" @click="browseChords"> Valider </q-btn>
        </div>
        <item-info :description="description" :example="example" />
      </div>
    </q-card>
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut">
      <q-card v-if="resultChords.length" class="q-card-bg q-mt-lg">
        <ChordItem v-for="(chord) in resultChords" :chord="chord" :key="chord.id"/>
      </q-card>
    </transition>
  </div>
</template>

<script>
import chordsMajor from './resources/chordsMajor.json'
import chordsMinor from './resources/chordsMinor.json'
import ChordItem from './chord/ChordItem'
import ChordSelector from './chord/ChordSelector'
import { uid } from 'quasar'
import ItemInfo from './common/ItemInfo'
import ItemTitle from './common/ItemTitle'
import ComponentTitle from 'components/common/ComponentTitle'
import Waves from 'components/common/Waves'
export default {
  name: 'ChordsFormatter',
  components: { Waves, ComponentTitle, ItemTitle, ItemInfo, ChordSelector, ChordItem },
  data () {
    return {
      loading: false,
      title: 'Choisissez vos accords',
      description: 'Utiliser cet outil pour transposer automatiquement vos accords barrés à l\'aide d\'un capo',
      example: 'F devient un C avec un capo à la case 5',
      counter: 1,
      chordsSelected: [],
      chordsFind: [],
      chordsMajor: chordsMajor,
      chordsMinor: chordsMinor
    }
  },
  computed: {
    resultChords () {
      return this.chordsFind.filter((key, index) => index < 4)
    },
    chordSelectedFiltered () {
      return this.chordsSelected.map(chord => chord.value)
    }
  },
  mounted () {
    if (this.$route.params.chords) {
      this.chordsSelected = this.$route.params.chords
    } else {
      this.addChordSelector()
    }
  },
  methods: {
    addChordSelector () {
      this.chordsSelected.push({ value: 'C', id: uid() })
    },
    browseChords () {
      var arrChords = []
      this.loading = true
      setTimeout(() => {
        for (var i = 1; i <= 11; i++) {
          var arrTone = {}
          arrTone.id = uid()
          arrTone.capo = i
          arrTone.chords = []
          this.chordSelectedFiltered.forEach(chord => {
            arrTone.chords.push(this.getChordNextTo(chord, i))
          })
          arrTone.crossedNumber = arrTone.chords.filter(chord => chord.crossed).length
          arrChords.push(arrTone)
        }
        this.chordsFind = (arrChords.sort((a, b) => a.crossedNumber - b.crossedNumber))
        this.loading = false
      }, 1000)
    },
    getChordNextTo (chord, tone) {
      var allChords = this.chordsMajor
      if (chord.includes('m')) {
        allChords = this.chordsMinor
      }
      var pos = (allChords.map(e => {
        return e.name
      }).indexOf(chord))
      var nextPost = pos - tone
      if (nextPost < 0) {
        nextPost = nextPost + (allChords.length)
      }
      var objReturn = Object.assign({}, allChords[nextPost])
      objReturn.previous = chord + ' / ' + allChords[pos].french
      return (objReturn)
    },
    removeSelectedChord (id) {
      this.chordsSelected = this.chordsSelected.filter(chord => chord.id !== id)
    }
  },
  provide () {
    return {
      chordSelectedFiltered: () => this.chordSelectedFiltered,
      removeSelectedChord: this.removeSelectedChord
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
