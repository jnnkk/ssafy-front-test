<template>
  <div class="outer-board-container">
     <div class="board-inner">
  <div class="board-container">
    <!-- 1) 제목 -->
    <header class="board-header">
      <h1>{{ pageTitle }}</h1>
    </header>

    <!-- 2) 탭 + 글쓰기 버튼을 한 줄에 -->
    <div class="board-controls">
      <nav class="tab-nav">
        <ul>
          <li
            v-for="tab in tabs"
            :key="tab"
            :class="{ active: tab === currentTab }"
            @click="onChangeTab(tab)"
          >
            {{ tab }}
          </li>
        </ul>
      </nav>
      <div class = "btn-wrapper" v-show="currentTab === 'Q&A' || ((currentTab === 'NOTICE') &&  (loginUser.role === 'ADMIN'))"> 
        <button @click="goToCreate" class="btn-create">글쓰기</button>
      </div>
      </div>

    <!-- 3) 본문 테이블 -->
    <main class="board-main">
      <table class="post-table">
        <thead>
          <tr>
            <th style="width: 10%">No</th>
            <th style="width: 20%">카테고리</th>
            <th>제목</th>
            <th style="width: 20%">작성일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(post,index) in pagedPosts" :key="post.id" @click="goToDetail(post.id)">
            <td>{{ index+1 }}</td>
            <td>{{ post.category }}</td>
            <td class="title-cell">{{ post.title }}</td>
            <td>{{ post.date }}</td>
          </tr>
          <tr v-if="!posts.length">
            <td colspan="4" class="no-data">게시물이 없습니다.</td>
          </tr>
        </tbody>
      </table>

      <nav class="pagination">
        <button @click="prevPage" :disabled="page === 1">이전</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="page === totalPages">다음</button>
      </nav>
    </main>
  </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted , watch} from 'vue'
import {  useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const loginUser = ref({})
// ——————————————————————
// 1) 반응형 상태 선언
// ——————————————————————
const tabs = ['NOTICE', 'Q&A']
const currentTab = ref(route.params.category || 'NOTICE')
console.log(currentTab.value);
watch(() => route.params.category, newCat => {
  currentTab.value = newCat || 'NOTICE'
  fetchPosts()
})
function onChangeTab(tab) {
  router.push({ name: 'noticeList', params: { category: tab } })
}
const posts = ref([])
const page = ref(1)
const pageSize = ref(5)
const pageTitle = computed(() => {
  return currentTab.value === 'NOTICE' ? '공지사항' : 'Q&A'
})
// ——————————————————————
// 2) Computed: 페이징 처리
// ——————————————————————
const pagedPosts = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return posts.value.slice(start, start + pageSize.value)
})
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(posts.value.length / pageSize.value))
})

// ——————————————————————
// 3) API 호출 함수
// ——————————————————————
async function fetchPosts() {
  const base = import.meta.env.VITE_APP_BASE_URL
  const endpoint = currentTab.value === 'NOTICE' ? '/notices' : '/questions'

  try {
    const res = await axios.get(`${base}${endpoint}`)
    // ① res.data.value 가 배열인지, 아니라면 빈 배열로:
    const raw = res.data.value ?? []
    const listArr = Array.isArray(raw) ? raw : []

    if (currentTab.value === 'NOTICE') {
      posts.value = listArr.map((item) => ({
        id: item.boardId,
        category: item.category,
        title: item.title,
        date: item.creationDate.split(' ')[0],
      }))
    } else {
      posts.value = listArr.map((item) => ({
        id: item.questionId,
        category: 'Q&A',
        title: item.title,
        date: item.createDate.split(' ')[0],
        isAnswered: item.isAnswered,
      }))
    }
    console.log(posts.value)
    page.value = 1
  } catch (err) {
    console.error('게시물 조회 실패', err)
    posts.value = []
  }
}
// ——————————————————————
// 4) 이벤트 핸들러
// ——————————————————————


function goToDetail(id) {
  if (currentTab.value === 'NOTICE') {
    router.push({ name: 'NoticeDetail', params: { id } })
  } else {
    console.log(currentTab.value)
    router.push({ name: 'QnADetail', params: { id } })
  }
}
function goToCreate() {
  const category = currentTab.value.toLowerCase() // 'notice' or 'q&a'
  if (category === 'notice') {
    router.push({ name: 'NoticeCreate' })
  } else {
    router.push({ name: 'QnACreate' })
  }
}
function prevPage() {
  if (page.value > 1) page.value--
}
function nextPage() {
  if (page.value < totalPages.value) page.value++
}

// ——————————————————————
// 5) 마운트 시 최초 호출
// ——————————————————————
onMounted(() => {
  const saved = sessionStorage.getItem('loginUser')
  if (saved) loginUser.value = JSON.parse(saved)
  fetchPosts()
  })
</script>
<style scoped>
.outer-board-container {
  width: 100%;
  background: #fff;
  min-height: 50vh;
  display: flex;
  justify-content: center; /* 수평 중앙 유지 */
 align-items: flex-start; /* 수직은 위에 붙도록 */
}
.board-inner {
 width: 100%;
  max-width: 1200px;    /* 원하는 너비로 */
  box-sizing: border-box;
}
.board-container {
  width: 100%;
  max-width: 1500px;
  background: #fff;
  min-height: 75vh;
  margin-bottom:10%;
  /* 뷰포트 전체 높이 확보 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* 최상단부터 쌓이도록 */
  padding-top : 100px;
  align-items: stretch; /* 내부 모든 자식(헤더, 탭, 메인)을 가운데로 */
}

/* 1) 헤더를 flex로 중앙 정렬 */

.board-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px; /* 헤더와 탭 사이 여백 */
}

/* 2) h1은 기본 흐름에 맡기고 margin만 조정 */
.board-header h1 {
  position: static;
  transform: none;
  font-size: 36px;
  margin: 0;
}
.board-main {
  /* 기존 padding, 위치 조정 없이 */
  margin-top: 40px; /* 원하는 값으로 조정 */
  flex: 1;               /* 남는 공간 모두 차지 */
  width: 100%;
  overflow-y: auto; 
}
/* 3) 탭 네비 (기존 스타일 유지) */
.tab-nav {
  margin-bottom: 32px;
  margin-left: 0%;
  flex: 1;
  display: flex;
  justify-content: center;  /* ul 전체가 가운데로 */
}
.tab-nav ul {
   display: flex;
  gap: 48px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.tab-nav li {
  list-style: none;
  font-size: 18px;
  color: #888;
  cursor: pointer;
  padding-bottom: 6px;
  position: relative;
}
.tab-nav li.active {
  color: #333;
  font-weight: 600;
}
.tab-nav li.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background: #333;
}
.board-controls {
  display: flex;
  flex-direction: column;   /* ← 좌/우 끝으로 밀기 */
  width: 100%;                    /* ← 컨테이너 전체 너비 확보 */
}
.btn-wrapper {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
/* 기존 margin-left:auto, margin-right:auto 제거 */
.btn-create {
  margin: 0;         /* ← 좌우 여백 리셋 */
  padding: 12px 24px;
  font-size: 16px;
  background-color: #333;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}

/* 5) 테이블 스타일 */
.post-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
  table-layout: fixed;
}
.post-table th,
.post-table td {
  padding: 20px;
  font-size: 20px;
  border-bottom: 1px solid #eee;
  text-align: center;
  color: #444;
}
.post-table thead th {
  font-weight: 600;
  background: #fafafa;
}
.post-table tbody tr:hover {
  background: #f9f9f9;
  cursor: pointer;
}

/* 6) 페이징 중앙 정렬 */
.pagination {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 24px;
}
.pagination button {
  margin: 0 8px;
}
</style>
