<template>
  <v-toolbar-title>
    <v-row align="center" no-gutters>
      <v-col cols="auto">
        <router-link class="text-white" to="/">
          <v-img src="/src/assets/img/logo.png" width="60" height="60" />
        </router-link>
      </v-col>
      <v-col cols="auto">
        <router-link class="text-white ml-2" to="/">거기어때</router-link>
      </v-col>
    </v-row>
  </v-toolbar-title>
  <v-spacer />
  <v-list class="d-flex gap-2 bg-transparent h-100">
    <!-- 로그인된 상태 -->
    <template v-if="loginUser.userId !== -1">
      <v-list-item class="nav-item">
        <router-link class="text-white" to="/map">관광지도</router-link>
      </v-list-item>
      <div v-if = "loginUser.role == 'ADMIN'">
        <v-list-item class="nav-item">
        <router-link class="text-white" to="/admin">관리자페이지</router-link>
      </v-list-item>
      </div>
      <div >
        <v-list-item class="nav-item">
          <router-link class="text-white" to="/mypage">마이페이지</router-link>
        </v-list-item>
      </div>
      <v-list-item class="nav-item">
        <a class="text-white" href="#" @click.prevent="logout">로그아웃</a>
      </v-list-item>
      <v-list-item class="nav-item">
        <router-link class="text-white" to="/notice/NOTICE">게시판</router-link>
      </v-list-item>
      <v-list-item>
        <router-link class="nav-link nav-item text-white" to="/boards">일정공유</router-link>
      </v-list-item>
    </template>

    <!-- 비로그인 상태 -->
    <template v-else>
      <v-list-item class="nav-item">
        <v-btn class="text-white" variant="text" @click="modal.open()">로그인</v-btn>
      </v-list-item>
      <v-list-item class="nav-item">
        <v-btn class="text-white" variant="text" @click="modal.open()">회원가입</v-btn>
      </v-list-item>
    </template>
  </v-list>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthModalStore } from '@/stores/authmodal'
import { useRouter } from 'vue-router'
const router = useRouter()
const modal = useAuthModalStore()

const loginUser = ref({ userId: -1, userName: '', email: '', role: '' })

async function fetchMe() {
  try {
    const token = sessionStorage.getItem('accessToken')
    const { data } = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    // data 에서 바로 꺼내 쓰시면 됩니다.
    loginUser.value.userId = data.value.userId
    loginUser.value.userName = data.value.userName
    loginUser.value.email = data.value.email
    loginUser.value.role = data.value.role
    sessionStorage.setItem('loginUser', JSON.stringify(loginUser.value))
    console.log('saved JSON:', sessionStorage.getItem('loginUser'))
  } catch (e) {
    console.error('사용자 정보 불러오기 실패', e)
  }
}

function logout() {
  // 로그아웃 로직 구현
  // 예: axios.post('/api/v1/logout', {}, { withCredentials: true })...
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('loginUser')
  // 2) axios 헤더에서 삭제
  delete axios.defaults.headers.common['Authorization']
  loginUser.value.id = -1
  loginUser.value.userName = ''
  loginUser.value.email = ''
  loginUser.value.role = ''
  router.replace({ name: 'home' }).then(() => {
    window.location.reload()
  })
}

onMounted(fetchMe)
</script>

<style scoped>
.nav-item {
  font-size: 1.2rem !important;
}

/* hover 효과 -> 호버시에 배경이 글래어 처리 트랜지션 처리로 서서히 */
.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transition: background-color 0.3s ease;
  cursor: pointer;
}

a {
  text-decoration: none;
}
</style>
