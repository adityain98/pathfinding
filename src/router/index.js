import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing-page',
      redirect: {
        name: 'dijkstra'
      }
    },
    {
      path: '/dijkstra',
      name: 'dijkstra',
      meta: {
        title: 'Dijkstra Algorithm',
        algorithm: 'dijkstra'
      },
      component: () => import('@/views/LandingPage.vue')
    },
    {
      path: '/a-star',
      name: 'a-star',
      meta: {
        title: 'A* Algorithm',
        algorithm: 'aStar'
      },
      component: () => import('@/views/LandingPage.vue')
    }
  ]
})

router.beforeEach((to) => {
  // assign title
  document.title = to.meta?.title ? to.meta?.title + ' - ' : '' + 'Pathfinding Vizualizer - adityain98'
})

export default router
