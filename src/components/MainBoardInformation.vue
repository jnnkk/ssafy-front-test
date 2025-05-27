<template>
  <div class="board-container">

    <!-- 메인 콘텐츠 - 공지사항 -->
    <div class="board-list">
      <!-- 헤더 섹션 -->
      <div class="header-section mb-4">
        <v-row>
          <v-col cols="12">
            <h2 class="text-h5 font-weight-bold">게시판</h2>
            <v-divider class="mt-2"></v-divider>
          </v-col>
        </v-row>
      </div>
      
      <!-- 데이터가 없을 때 메시지 표시 -->
      <div v-if="noticeBoards.length === 0 && !loading" class="no-data-message">
        <p class="text-center py-5">등록된 공지사항이 없습니다.</p>
      </div>
      
      <!-- 게시글 항목 반복 -->
      <div 
        v-for="(item, index) in noticeBoards" 
        :key="item.questionId"
        class="board-item"
        @click="viewDetail(item.boardId, 'notice')"
      >
        <div class="d-flex align-center board-item-content">
          <div class="board-category cat-notice">
            공 지
          </div>
          
          <div class="board-title-wrapper">
            <div class="d-flex align-center">
              <span class="board-title">{{ item.title }}</span>
              <v-chip
                v-if="isNew(item.creationDate)"
                x-small
                color="error"
                class="ml-2 new-tag"
              >
                NEW
              </v-chip>
            </div>
          </div>
          
          <div class="board-info d-none d-md-flex">
            <span class="author">{{ item.userName || '관리자' }}</span>
            <span class="date">{{ formatDate(item.creationDate || new Date()) }}</span>
            <span class="views">조회수 {{ item.views || 0 }}</span>
          </div>
        </div>
        <v-divider></v-divider>
      </div>
      
      <!-- 페이지네이션 - 글이 있을 때만 표시 -->
      <div v-if="noticeBoards.length > 0" class="text-center mt-6">
        <v-pagination
          v-model="noticePage"
          :length="noticeTotalPages"
          color="primary"
        ></v-pagination>
      </div>
    </div>

    <!-- 메인 콘텐츠 - QnA -->
    <div class="board-list">
      <!-- 헤더 섹션 -->
      <div class="header-section mb-4">
        <v-row>
          <v-col cols="12">
            <h2 class="text-h5 font-weight-bold">Q & A</h2>
            <v-divider class="mt-2"></v-divider>
          </v-col>
        </v-row>
      </div>
      
      <!-- 데이터가 없을 때 메시지 표시 -->
      <div v-if="qnaBoards.length === 0 && !loading" class="no-data-message">
        <p class="text-center py-5">등록된 Q&A가 없습니다.</p>
      </div>
      
      <!-- 게시글 항목 반복 -->
      <div 
        v-for="(item, index) in qnaBoards" 
        :key="item.questionId"
        class="board-item"
        @click="viewDetail(item.questionId, 'qna')"
      >
        <div class="d-flex align-center board-item-content">
          <div class="board-category cat-event">
            Q & A
          </div>
          
          <div class="board-title-wrapper">
            <div class="d-flex align-center">
              <span class="board-title">{{ item.title }}</span>
              <v-chip
                v-if="isNew(item.createDate)"
                x-small
                color="error"
                class="ml-2 new-tag"
              >
                NEW
              </v-chip>
            </div>
          </div>
          
          <div class="board-info d-none d-md-flex">
            <span class="author">{{ item.author || '관리자' }}</span>
            <span class="date">{{ formatDate(item.createDate || new Date()) }}</span>
            <span class="views">조회수 {{ item.view || 0 }}</span>
          </div>
        </div>
        <v-divider></v-divider>
      </div>
      
      <!-- 페이지네이션 - 글이 있을 때만 표시 -->
      <div v-if="qnaBoards.length > 0" class="text-center mt-6">
        <v-pagination
          v-model="qnaPage"
          :length="qnaTotalPages"
          color="primary"
        ></v-pagination>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const noticeBoards = ref([])  
const qnaBoards = ref([])
const noticePage = ref(1)
const qnaPage = ref(1)
const loading = ref(false)
const noticeTotal = ref(0)
const qnaTotal = ref(0)
const itemsPerPage = 10 // 페이지당 게시글 수

// 페이지 계산
const noticeTotalPages = computed(() => {
  return Math.ceil(noticeTotal.value / itemsPerPage) || 1
})

const qnaTotalPages = computed(() => {
  return Math.ceil(qnaTotal.value / itemsPerPage) || 1
})

// 최신글 확인 (3일 이내)
const isNew = (date) => {
  if (!date) return false
  const postDate = new Date(date)
  const now = new Date()
  const diffTime = Math.abs(now - postDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 3
}

// 날짜 포맷팅 함수
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 상세 페이지 보기
const viewDetail = (id, category) => {
  console.log(`게시글 ${id} 상세보기`)
  if(category === 'qna'){
      router.push({ path: '/questions/' + id })
  }else{
      router.push({ path: '/notices/' + id })

  }
}

async function fetchNoticeBoards() {
  loading.value = true
  try {
    // 페이지 정보를 쿼리 파라미터로 전달
    const data = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/notices`)
    // noticeBoards.value = data.data.value || [] // 페이지네이션된 데이터 구조에 맞게 조정
    noticeTotal.value = data.data.value.length || 0 // 총 게시글 수
    noticeBoards.value = data.data.value.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate)) || []
    console.log(noticeBoards.value)
  } catch (e) {
    console.error('공지사항 데이터 불러오기 실패', e)
    noticeBoards.value = []
  } finally {
    loading.value = false
  }
}

async function fetchQnABoards() {
  loading.value = true
  try {
    // 페이지 정보를 쿼리 파라미터로 전달
    const data = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/questions`)
    // qnaBoards.value = data.data.value || [] // 페이지네이션된 데이터 구조에 맞게 조정
    qnaTotal.value = data.data.value.length || 0 // 총 게시글 수

     const boardWithUserNames = await Promise.all(
      data.data.value.map(async (item) => {
        try {
          const userRes = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/users/${item.userId}`)
          return {
            ...item,
            author: userRes.data.value.userName // 또는 res.data.value.userName 구조에 맞게
          }
        } catch (e) {
          console.warn(`userId ${item.userId} 에 대한 userName 가져오기 실패`, e)
          return {
            ...item,
            author: '알 수 없음'
          }
        }
      })
    )

    qnaBoards.value = boardWithUserNames.sort((a, b) => new Date(b.createDate) - new Date(a.createDate))

  } catch (e) {
    console.error('Q&A 데이터 불러오기 실패', e)
    qnaBoards.value = []
  } finally {
    loading.value = false
  }
}

// 페이지 변경 시 데이터 다시 불러오기
function fetchData() {
  fetchNoticeBoards()
  fetchQnABoards()
}

// 페이지 번호가 변경될 때 데이터 다시 불러오기
import { watch } from 'vue'

watch(noticePage, () => {
  fetchNoticeBoards()
})

watch(qnaPage, () => {
  fetchQnABoards()
})

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
h2 {
  font-family: 'GongGothicMedium'
}

.board-container {
  width: 100%;
  padding: 0;
  background-color: white;
  display: flex;
}

.header-section {
  margin-bottom: 20px;
}

.board-list {
  width: 100%;
  margin: 0 40px;
}

.board-item {
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
}

.board-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.board-item-content {
  padding: 14px 0;
  width: 100%;
}

.board-category {
  min-width: 80px;
  padding: 4px 8px;
  text-align: center;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-right: 16px;
  color: white;
}

.cat-notice {
  background-color: #f44336;
}

.cat-recruitment {
  background-color: #2196F3;
}

.cat-event {
  background-color: #FF9800;
}

.cat-academic {
  background-color: #4CAF50;
}

.cat-general {
  background-color: #9E9E9E;
}

.board-title-wrapper {
  flex: 1;
  overflow: hidden;
  padding-right: 10px;
}

.board-title {
  font-weight: 500;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
}

.board-info {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: #757575;
  white-space: nowrap;
}

.board-info > span {
  margin-right: 16px;
}

.board-info > span:last-child {
  margin-right: 0;
}

.author {
  min-width: 100px;
}

.date {
  min-width: 100px;
}

.new-tag {
  height: 20px !important;
  font-size: 0.6rem !important;
}

.download-icon {
  opacity: 0.5;
  transition: opacity 0.2s;
}

.board-item:hover .download-icon {
  opacity: 1;
}

.no-data-message {
  width: 100%;
  color: #757575;
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

/* 반응형 */
@media (max-width: 960px) {
  .board-category {
    min-width: 60px;
    font-size: 0.7rem;
    margin-right: 10px;
    padding: 3px 5px;
  }
  
  .board-title {
    font-size: 0.85rem;
  }
  
  .download-btn {
    display: none;
  }
}

@media (max-width: 600px) {
  .board-category {
    min-width: 50px;
    font-size: 0.65rem;
    margin-right: 8px;
    padding: 2px 4px;
  }
  
  .board-title {
    font-size: 0.8rem;
  }
}
</style>