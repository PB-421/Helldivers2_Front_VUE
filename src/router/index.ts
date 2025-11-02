import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import SuperEarth from '../views/Superearth.vue'
import Terminids from '../views/Terminids.vue'
import Automatons from '../views/Automatons.vue'
// definicion de rutas y componente principal usan (se pueden definir mas comopentes en la view)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/superearth',
    name: 'SuperEarth',
    component: SuperEarth
  },
  {
    path: '/terminids',
    name: 'Terminids',
    component: Terminids
  },
  {
    path: '/automatons',
    name: 'Automatons',
    component: Automatons
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
