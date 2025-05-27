<template>
  <div class="notice-detail-container">
    <!-- 1) 최상단 고정 헤더 -->
     <div class="notice-inner">
    <header class="detail-header">
      <h1>공지사항</h1>
       <button @click="goBack" class="btn-back">뒤로가기</button>
    </header>

    <div class="notice-box">
    <!-- 2) 카테고리/제목/날짜 한 줄 -->
    <section class="notice-meta">
      <span class="badge">{{ notice.category }}</span>
      <h2 class="notice-title">{{ notice.title }}</h2>
      <time class="notice-date">{{ formatDate(notice.updateDate) }}</time>
    </section>

    <!-- 3) 본문 -->
    <article class="notice-content" v-html="notice.content"></article>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute ,useRouter} from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const notice = ref({
  category: '',
  title: '',
  updateDate: '',
  content: ''
})

function formatDate(ts) {
  // yyyy-MM-dd 형태로 포맷팅
  const d = new Date(ts)
  const yy = d.getFullYear()
  const mm = String(d.getMonth()+1).padStart(2,'0')
  const dd = String(d.getDate()).padStart(2,'0')
  return `${yy}-${mm}-${dd}`
}

async function fetchNotice() {
  try {
    const boardId = route.params.id;
    const { data } = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/notices/${boardId}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    })
    // data 구조에 맞게 필드 매핑
    notice.value.category   = data.value.category
    notice.value.title      = data.value.title
    notice.value.updateDate = data.value.updateDate   // 또는 creationDate
    // 줄바꿈을 <br>로 바꿔서 v-html에 렌더링
    notice.value.content    = data.value.content.replace(/\n/g,'<br/>')
  } catch (err) {
    console.error('공지 상세 조회 실패', err)
  }
}
function goBack() {
  router.back();
}
onMounted(fetchNotice)
</script>

<style scoped>
/* 1) 화면 전체 흰 배경 */
.notice-detail-container {
  width: 100%;
  background: #fff;
  min-height: 100vh;
}

/* 2) 실제 콘텐츠 박스: max-width 고정 + 자동 중앙 정렬 */
.notice-inner {
  max-width: 1200px;
  margin: 0 auto;
  /* 상하 40px, 좌우는 뷰포트 너비의 10% 씩 패딩 */
  padding: 40px 10vw;
  min-height: 100vh;
  box-sizing: border-box;
}
/* 1) 헤더 */
.detail-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
  text-align: center;
}
.detail-header h1 {
  margin: 0;
  font-size: 28px;
}
.btn-back {
  background: none;
  border: none;
  color: #555;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  justify-self: flex-end;
}
.notice-box {
  border: 1px solid #ddd;      /* 연한 회색 테두리 */
  border-radius: 8px;          /* 모서리 둥글게 */
  padding: 24px;               /* 내부 여백 */
  background-color: #fafafa;   /* 희미한 배경색 (선택) */
  margin-top: 24px;            /* 헤더와 약간 떨어뜨리기 */
}

/* 2) 메타 정보 (카테고리/제목/날짜) */
.notice-meta {
  display: flex;
  align-items: center;  /* 전체는 가운데 정렬 유지 */
  margin: 24px 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
}
.badge {
  font-size: 14px;
  color: #666;
  margin-right: 12px;
}
.notice-title {
  flex: 1;
  font-size: 20px;
  margin: 0;
  color: #333;
}
.notice-date {
  font-size: 14px;
  color: #999;
}

/* 3) 본문 */
.notice-content {
  padding-top: 16px;
  line-height: 1.6;
  color: #444;
  min-height:50vh;
  /* white-space: pre-wrap; // v-html 에선 이미 <br/> 삽입 */
}
</style>
