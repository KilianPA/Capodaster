<template>
  <div class="q-pa-lg">
    <q-card class="q-card-bg">
      <component-title title="Capodastre"/>
      <waves/>
      <div class="q-card-content">
        <chord-selector v-for="(chord) in chordsSelected" v-model="chordsSelected" :chord="chord" :key="chord.id"/>
        <div class="text-center q-mt-lg">
          <q-btn @click="addChordSelector" color="info" size="10px" round icon="add"/>
        </div>
        <div class="q-mt-md">
          <q-item>
            <q-item-section avatar>
              <q-icon class="fill-primary" name="img:capodaster_blue.svg"/>
            </q-item-section>
            <q-item-section>
              <q-slider
                color="info"
                v-model="capo"
                :min="1"
                :max="11"
                :step="1"
                label
                label-always
              />
            </q-item-section>
          </q-item>
        </div>
        <q-separator class="q-mt-md"/>
        <div class="text-center q-mt-md">
          <q-btn :disable="chordsSelected.length === 0" :loading="loading" color="info" @click="getChordsTransposed">
            Valider
          </q-btn>
        </div>
        <item-info :description="description"/>

      </div>
    </q-card>
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut">
      <q-card v-if="resultChords.length" class="q-mt-md q-card-bg q-mb-md">
        <div class="full-width text-center text-capo bg-accent text-white">
          Capodastre : {{ resultChords[0].capo }}
        </div>
        <capodaster-item-result v-for="(chord) in resultChords" :chord="chord" :key="chord.id"/>
      </q-card>
    </transition>
  </div>
</template>

<script>
import chordsMajor from './resources/chordsMajor.json'
import chordsMinor from './resources/chordsMinor.json'
import ChordSelector from 'components/chord/ChordSelector'
import CapodasterItemResult from 'components/capodaster/CapodasterItemResult'
import ItemInfo from 'components/common/ItemInfo'
import { uid } from 'quasar'
import ComponentTitle from 'components/common/ComponentTitle'
import Waves from 'components/common/Waves'
export default {
  name: 'Capodaster',
  components: { Waves, ComponentTitle, ItemInfo, CapodasterItemResult, ChordSelector },
  mounted () {
    this.$store.dispatch('toolbar/setTitle', 'Capodastre')
    if (this.$route.params.chords) {
      this.chordsSelected = this.$route.params.chords
    } else {
      this.addChordSelector()
    }
  },
  data () {
    return {
      description: 'Utiliser cet outil pour transposer vos accords',
      loading: false,
      chordsSelected: [],
      capo: 1,
      chordsMajor: chordsMajor,
      chordsMinor: chordsMinor,
      resultChords: []
    }
  },
  methods: {
    addChordSelector () {
      this.chordsSelected.push({ value: 'C', id: uid() })
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
      objReturn.capo = tone
      return (objReturn)
    },
    getChordsTransposed () {
      this.loading = true
      this.resultChords = []
      setTimeout(() => {
        this.loading = false
        this.resultChords = []
        this.chordsSelected.forEach(chord => {
          this.resultChords.push(this.getChordNextTo(chord.value, this.capo))
        })
      }, 1000)
    },
    removeSelectedChord (id) {
      this.chordsSelected = this.chordsSelected.filter(chord => chord.id !== id)
    }
  },
  provide () {
    return {
      removeSelectedChord: this.removeSelectedChord
    }
  }
}
</script>

<style scoped>

</style>
