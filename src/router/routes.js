const routes = [
  {
    path: '/',
    redirect: 'capodaster',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/capodaster',
        name: 'capodaster',
        component: () => import('components/Capodaster.vue')
      },
      {
        path: '/chords',
        name: 'chords',
        component: () => import('components/ChordsFormatter.vue')
      },
      {
        path: '/tab-identificator',
        name: 'tab-identificator',
        component: () => import('components/TabIdentificator.vue')
      },
      {
        path: '/tuner',
        name: 'tuner',
        component: () => import('components/Tuner.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
