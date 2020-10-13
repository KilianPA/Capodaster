<template>
  <div class="row col-md-12 col-xs-12 q-mb-sm">
    <div class="col-md-6 col-xs-6">
      <q-select color="info" map-options emit-value dense outlined filled v-model="model" :options="currentOptions"/>
    </div>
    <div class="col-md-4 col-xs-4 text-center">
      <q-toggle color="info" v-model="minor" label="Mineur"/>
    </div>
    <div class="col-md-2 q-pl-md col-xs-2 q-pt-sm">
      <q-btn @click="removeSelectedChord(chord.id)" size="11px" class="text-info" flat icon="close"/>
    </div>
  </div>
</template>

<script>
import chordsMajor from '../resources/chordsMajor.json'
import chordsMinor from '../resources/chordsMinor.json'
export default {
  name: 'ChordSelector',
  props: ['value', 'chords', 'count', 'uuid', 'chord'],
  inject: ['removeSelectedChord'],
  model: {
    prop: 'chords',
    event: 'input'
  },
  computed: {
    val () {
      return { value: this.model, id: this.id }
    },
    isLast () {
      return false
    },
    currentOptions () {
      var arr = this.minor ? this.chordsMinor : this.chordsMajor
      return arr.map(chord => {
        return {
          value: chord.name,
          label: chord.name + ' / ' + chord.french
        }
      })
    }
  },
  data () {
    return {
      id: this.chord.id,
      model: '',
      minor: false,
      chordsMajor: chordsMajor,
      chordsMinor: chordsMinor
    }
  },
  beforeMount () {
    if (this.chord.value) {
      this.model = this.chord.value
      if (this.model.includes('m')) {
        this.minor = true
      }
    }
  },
  mounted () {
  },
  methods: {
    handleSelect () {
      if (this.chords.filter(chord => chord.id === this.id).length) {
        this.chords.filter(chord => chord.id === this.id)[0].value = this.model
      } else {
        this.chords.push(this.val)
      }
    }
  },
  watch: {
    model () {
      this.handleSelect()
    },
    minor () {
      if (this.minor) {
        if (this.model && !this.model.includes('m')) {
          this.model = this.model + 'm'
        }
      } else {
        if (this.model) {
          this.model = this.model.replace('m', '')
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
