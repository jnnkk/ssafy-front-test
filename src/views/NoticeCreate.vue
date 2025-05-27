<template>
  <!-- ① 화면 전체를 채우는 래퍼 -->
  <div class="full-screen">
    <div class="inner-container">
      <!-- ② 기존 container : max-width 800px 유지 -->
      <div class="container mt-5">
        <h2 class="mb-4 text-center">공지사항 글 작성</h2>

        <v-form @submit.prevent="submitForm">
          <!-- 제목 입력 -->
          <v-text-field
            label="제목"
            v-model="title"
            required
            outlined
            dense
          ></v-text-field>

          <!-- 내용 입력 -->
          <v-textarea
            label="내용"
            v-model="content"
            rows="10"
            auto-grow
            required
            outlined
            style="min-height: 800px;"
          ></v-textarea>

          <!-- 버튼 -->
          <div class="text-end mt-3">
            <v-btn color="primary" type="submit">등록</v-btn>
            <v-btn class="ms-2" @click="cancel">취소</v-btn>
          </div>
        </v-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref , onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const title = ref('')
const content = ref('')
const router = useRouter()
const loginUser = ref({})
async function submitForm() {
  if (!title.value || !content.value) {
    alert('제목과 내용을 모두 입력해주세요.')
    return
  }
  const payload = new FormData()

// 2) 기본 필드들 append
payload.append('userId', loginUser.value.userId)
payload.append('userName', loginUser.value.userName)
payload.append('title', title.value)
payload.append('content', content.value)
payload.append('category', '공지사항')
payload.append('planId', 0)
payload.append('views', 0)

// 3) 배열(JSON) 필드들은 문자열로
//    tags, imageUrl 처럼 서버에서 JSON을 파싱해주는 로직이 있어야 합니다.
payload.append('tags', JSON.stringify([]))
payload.append('imageUrl', JSON.stringify([]))
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_BASE_URL}/notices`, // 공지사항 등록 엔드포인트
      payload,
       {  headers: { 'Content-Type': 'multipart/form-data',
        'ngrok-skip-browser-warning': 'true',
       }
      })
    console.log('등록 성공:', response.data)
    router.back()
  } catch (err) {
    console.error('등록 실패:', err)
    alert('등록 중 오류가 발생했습니다.')
  }
}

function cancel() {
  router.back()
}
onMounted(()=>{
    const saved = sessionStorage.getItem('loginUser')
  if (saved) loginUser.value = JSON.parse(saved)
})
</script>

<style scoped>
/* 화면 전체를 가득 채우는 래퍼 */
.full-screen {
  width: 100vw; /* 뷰포트 가로 100% */
  height: 100vh; /* 뷰포트 세로 100% */
  box-sizing: border-box;
  display: flex;
  justify-content: center; /* 수평 가운데 정렬 */
  align-items: flex-start; /* 상단 여백 살리려면 flex-start, 중앙 정렬하려면 center */
  padding-top: 2rem; /* mt-5 느낌 살리려면 padding-top 추가 */
  background-color: white; /* 필요 시 배경색 */
}
.inner-container .container {
  max-width: none !important;
  width: 50vw; /* 원하는 만큼 늘려주세요 */
  max-height: none !important;
  height: 50%;
}
</style>
