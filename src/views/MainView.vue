<template>
  
  <!-- 메인 컨텐츠 -->
  <v-container v-if="isLogin" class="pa-0 my-5 d-flex flex-column align-center">
    <v-container class="d-flex align-center"
    style="margin-bottom: 50px;">
      <MainInfo />
      <MainWeatherInformation />
    </v-container>
    <h2 class="my-4 text-center text-h4 font-weight-bold mb-4">지역 관광지 바로가기</h2>
    <MainLocalInformation 
    style="margin-bottom: 50px;"/>
    <MainBoardInformation />
  </v-container>

  <!-- 메인 배너 -->
  <MainBanner v-else />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MainInfo from '@/components/MainInfo.vue'
import MainBanner from '@/components/MainBanner.vue'
import MainBoardInformation from '@/components/MainBoardInformation.vue'
import MainLocalInformation from '@/components/MainLocalInformation.vue'
import MainWeatherInformation from '@/components/MainWeatherInformation.vue'
import axios from 'axios'

const isLogin = ref(false)
const loginUser = ref({ userId: -1, userName: '', email: '', role: '' })

onMounted(async () => {
  async function fetchMe() {
    try {
      const token = sessionStorage.getItem('accessToken')
      const { data } = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      })
      // data 에서 바로 꺼내 쓰시면 됩니다.
      loginUser.value.userId = data.value.userId
      loginUser.value.userName = data.value.userName
      loginUser.value.email = data.value.email
      loginUser.value.role = data.value.role
      sessionStorage.setItem('loginUser', JSON.stringify(loginUser.value))
    } catch (e) {
      console.error('사용자 정보 불러오기 실패', e)
    }
  }

  await fetchMe()

  isLogin.value = !!sessionStorage.getItem('loginUser')
})

// 3개씩 나누기
</script>

<style scoped>
h2 {
  font-family: 'GongGothicMedium'
}

/* Vuetify의 기본 마진을 제거하고 커스텀 마진 적용 */
:deep(.v-container) {
  margin: 0 !important;
  padding: 0 !important;
}
</style>
