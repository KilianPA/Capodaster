<template>
  <div class="full-width q-pb-md q-mt-md row">
    <div class="col-xs-1 col-md-1 relative-position">
      <q-icon class="absolute-center" color="white" size="18px" name="info"/>
    </div>
    <div class="col-xs-11 col-md-11 q-pl-sm text-description">
      <div class="full-width">
        <span> {{ description }} </span>
      </div>
      <div v-if="example" class="full-width">
        <span> Exemple:  {{ example }} </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    description: String,
    example: String
  },
  name: 'ItemInfo'
}
</script>

<style scoped>
</style>
