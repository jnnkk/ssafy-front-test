import { createRouter, createWebHistory } from 'vue-router'
import MainView from '@/views/MainView.vue'
import MemberView from '@/views/MemberView.vue'
import MyPageView from '@/views/MyPageView.vue'
import TourMapView from '@/views/TourMapView.vue'
import NoticeDetail from '@/views/NoticeDetail.vue'
import QnADetail from '@/views/QnADetail.vue'
import Board from '@/views/BoardView.vue'
import Notice from '@/views/NoticeBoard.vue'
import QnACreate from '@/views/QnACreate.vue'
import BoardCreate from '@/views/BoardCreate.vue'
import BoardDetail from '@/views/BoardDetail.vue'
import BoardEdit from '@/views/BoardEdit.vue'
import PlanDetail from '@/views/PlanDetail.vue'
import PlanCreate from '@/views/PlanCreate.vue'
import NoticeCreate from '@/views/NoticeCreate.vue'
import AdminPage from '@/views/AdminPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MainView,
    },

    {
      path: '/member',
      name: 'member',
      component: MemberView,
    },
    {
      path: '/mypage',
      name: 'mypage',
      component: MyPageView,
      meta: { requiresAuth: true },
    },
    {
      path: '/map',
      name: 'map',
      component: TourMapView,
    },
    {
      path: '/boards',
      name: 'BoardList',
      component: Board,
      meta: { requiresAuth: true },
    },
    {
      path: '/boards/create',
      name: 'BoardCreate',
      component: BoardCreate,
      meta: { requiresAuth: true },
    },
    {
      path: '/boards/:id',
      name: 'BoardDetail',
      component: BoardDetail,
      meta: {requireAuth: true},
    },
    {
    path: '/boards/:id/edit',
    name: 'BoardEdit',
    component: BoardEdit
  },
    {
      path: '/notice/:category',
      name: 'noticeList',
      component: Notice,
    },

    {
      path: '/notices/:id',
      name: 'NoticeDetail',
      component: NoticeDetail,
    },

    {
      path: '/questions/:id',
      name: 'QnADetail',
      component: QnADetail,
      props: true,
    },
    {
      path: '/qna/create',
      name: 'QnACreate',
      component: QnACreate,
    },
    {
      path: '/plan/:id',
      name : 'PlanDetail',
      component: PlanDetail,
    },
    {
      path: '/plan/create',
      name: 'PlanCreate',
      component : PlanCreate,
    },
    {
      path:'/notice/create',
      name : 'NoticeCreate',
      component : NoticeCreate,
    },
    {
      path:'/admin',
      nmae:  'AdminPage',
      component: AdminPage,
    }
  ],
})
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken')
  if (to.meta.requiresAuth && !token) {
    return next({ path: '/' }) // 로그인 페이지로 리다이렉트
  }
  next()
})
export default router
