<template>
  <div class="border-top q-pb-sm">
    <div class="text-center text-capo bg-accent text-white border-radius-inherit">
      Capodastre : {{ chord.capo }}
      <div class="full-width text-caption text-italic text-grey">
        Nombre d'accords barrés : {{ chord.crossedNumber }}
      </div>
    </div>
    <div class="full-width row q-pa-md q-col-gutter-y-md">
      <div class="col-md-4 col-xs-4 text-center" v-for="(el, index) in chord.chords" :key="index">
        <div :style="{color: colorGenerated[index]}" class="q-pl-sm">
          {{ el.previous }}
        </div>
        <div class="q-pl-sm">
          <q-icon :style="{color: colorGenerated[index]}" class="rotate-90" name="arrow_right_alt"/>
        </div>
        <show-chord :chord="el.name + ' / ' + el.french"  :color="colorGenerated[index]"/>
<!--        <vc-chord-diagram :color="colorGenerated[index]" :position="formatChord(el.name).startAt !== 0 " :title="el.name" width="50" height="50" :setup="formatChord(el.name)" />-->
      </div>
    </div>
  </div>
</template>

<script>
import ShowChord from './ShowChord'
export default {
  props: ['chord'],
  inject: ['chordSelectedFiltered'],
  name: 'ChordItem',
  components: { ShowChord },
  computed: {
    chordSelected () {
      return this.chordSelectedFiltered()
    },
    colorGenerated () {
      var arr = []
      this.chordSelected.forEach(() => {
        arr.push(this.randomColor())
      })
      return arr
    }
  },
  data () {
    return {
      colors: ['#5cabfe', '#ff6a9a', '#8d80ff']
    }
  },
  methods: {
    randomColor () {
      return this.colors[Math.floor(Math.random() * this.colors.length)]
    }
  }
}
</script>

<style>

</style>
