import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: () => import('@/views/LandingPage.vue')
    }
  ]
})

router.beforeEach((to) => {
  // assign title
  document.title = to.meta?.title ? to.meta?.title + ' - ' : '' + 'Pathfinding Vizualizer - adityain98'
})

export default router
