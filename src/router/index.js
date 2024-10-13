import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing-page',
      redirect: {
        path: '/dijkstra'
      }
    },
    {
      path: '/dijkstra',
      name: 'landing-page',
      meta: {
        algorithm: 'dijkstra'
      },
      component: () => import('@/views/LandingPage.vue')
    },
    {
      path: '/a-star',
      name: 'landing-page',
      meta: {
        algorithm: 'aStar'
      },
      component: () => import('@/views/LandingPage.vue')
    }
  ]
})

export default router
