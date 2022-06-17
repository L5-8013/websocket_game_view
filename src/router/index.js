import {
  createRouter,
  createWebHashHistory
} from "vue-router"

import Game from '../view/game.vue'

const routes = [{
      path: '/',
      name: 'home',
      component: () => import('../view/home.vue')
  },
  {
      path: '/game',
      name: 'Game',
      component: Game
  },
  {
      path: '/:catchAll(.*)', //如果没有匹配项, 匹配所有路径 vue2 使用 * ；vue3 使用 `/:pathMatch(.*)* ` 或者 `/:pathMatch(.*)` 或者 `/:catchAll(.*)`
      redirect: '/' //重定向到首页(也可以渲染一个404组件)
  }
]

const router = createRouter({
  history: createWebHashHistory(), // 哈希值模式
  routes
})

export default router