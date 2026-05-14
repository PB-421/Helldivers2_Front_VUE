import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import SuperEarth from '../views/Superearth.vue'
import Terminids from '../views/Terminids.vue'
import Automatons from '../views/Automatons.vue'
import Illuminates from '../views/Illuminates.vue'
import GalaxyStatus from '../views/GalaxyStatus.vue'

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
  {
    path: '/illuminates',
    name: 'Illuminates',
    component: Illuminates
  },
  {
    path: '/war-status',
    name: 'GalaxyMap',
    component: GalaxyStatus
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
