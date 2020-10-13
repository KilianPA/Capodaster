import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'
// import { CameraPreview } from 'capacitor-camera-preview'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function (/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  Router.beforeEach((to, from, next) => {
    if (from.name === 'tab-identificator') {
      console.log(Router.app.$store.getters['tabIdentificator/getCamera'])
      if (Router.app.$store.getters['tabIdentificator/getCamera']) {
        const camera = Router.app.$store.getters['tabIdentificator/getCamera']
        camera.stop()
        Router.app.$store.dispatch('tabIdentificator/setCamera', null)
      }
    }
    next()
  })

  return Router
}
