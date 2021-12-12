<template>
  <div>
    <q-layout container :style="fullHeight" class="shadow-2 rounded-borders">
<!--      <toolbar/>-->
      <q-page-container :style-fn="{minHeight:  'calc(100vh - 48px)'}">
        <q-page>
          <router-view />
        </q-page>
      </q-page-container>
      <menu-navigation/>
    </q-layout>
  </div>
</template>

<script>
import MenuNavigation from 'components/common/MenuNavigation'
export default {
  name: 'MainLayout',
  components: { MenuNavigation },
  computed: {
    fullHeight () {
      return { height: this.$q.screen.height + 'px' }
    }
  },
  mounted () {
    // this.$router.go({ name: 'capodaster' })
    window.addEventListener('load', function () {
      setTimeout(function () {
        // This hides the address bar:
        window.scrollTo(0, 1)
      }, 0)
    })
  },
  data () {
    return {
    }
  }
}
</script>
