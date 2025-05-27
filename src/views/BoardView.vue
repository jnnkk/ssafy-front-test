<!-- ScheduleVelogBoard.vue -->
<template>
  <div class="board-screen">
    <div class="schedule-board">
      <header class="board-header">
        <h1>일정 공유 게시판</h1>
        <button class="btn-create" @click="goToCreate">일정 등록</button>
      </header>

      <div class="cards">
        <div v-for="evt in pagedEvents" :key="evt.id" class="card" @click="goToDetail(evt.id)">
          <!-- 대표 이미지 삽입 -->

          <h2 class="card-title">{{ evt.title }}</h2>
          <p class="card-date">{{ formatDate(evt.date) }}</p>
          <p class="card-desc">{{ evt.description }}</p>
          <div class="card-images">
            <img
              v-for="(url, idx) in evt.imageUrl"
              :key="idx"
              :src="url"
              alt="게시글 이미지"
              class="card-image"
            />
          </div>
          <div class="card-meta">
            <div class="tags">
              <span class="tag" v-for="tag in  evt.tags.slice(0, 3)" :key="tag"> #{{ tag }} </span>
            </div>
            <div class="stats">
              <span class="likes">👍 {{ evt.likes }}</span>
              <span class="comments">💬 {{ evt.comments }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="text-center mt-6">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          circle
          color="primary"
        />
        </div>
    </div>
    <!-- 필요하다면 페이징 컴포넌트 삽입 -->
  </div>
</template>

<script setup>
import { ref, onMounted , computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const events = ref([])

function formatDate(d) {
  return d.split(' ')[0] // "2025-05-16T..." → "2025-05-16"
}
function stripBrackets(s) {
  if (typeof s !== 'string') return s
  // 1) 정규식으로 한 번에
  return s.replace(/^\[|\]$/g, '')

  // 또는
  // 2) slice 이용
  // return s.startsWith('[') && s.endsWith(']')
  //   ? s.slice(1, -1)
  //   : s
}
const currentPage   = ref(1)
const itemsPerPage  = 16
const totalPages    = computed(() =>
  Math.ceil(events.value.length / itemsPerPage)
)

// 현재 페이지에 해당하는 아이템만
const pagedEvents = computed(() =>
  events.value.slice(
    (currentPage.value - 1) * itemsPerPage,
    currentPage.value * itemsPerPage
  )
)
async function fetchEvents() {
  try {
    const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/boards`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    })
    // { status:"OK", value: [...] } or plain array
    const list = res.data.value ?? []
    console.log('받아온 게시물 개수:', list.length)
    events.value = await Promise.all(list.map(async (item) => {
      // imageUrl이 JSON 문자열로 올 경우 파싱
      let images = []
      if (item.imageUrl) {
        if (Array.isArray(item.imageUrl)) {
          const first = item.imageUrl[0]
          // 첫 요소가 JSON 문자열이면 파싱
          if (typeof first === 'string' && first.trim().startsWith('[')) {
            try {
              const parsed = JSON.parse(first)
              images = Array.isArray(parsed) ? parsed : []
            } catch {
              images = item.imageUrl
            }
          } else {
            images = item.imageUrl
          }
        } else if (typeof item.imageUrl === 'string') {
          // 문자열로만 넘어왔을 때에도 JSON 파싱 후 배열화
          try {
            const parsed = JSON.parse(item.imageUrl)
            images = Array.isArray(parsed) ? parsed : [parsed]
          } catch {
            images = [item.imageUrl]
          }
        }
      }

      // tags 처리
      let tagsArr = []
      if (item.tags) {
        // item.tags 가 문자열인 경우
        if (typeof item.tags === 'string') {
          // 예: "['싸피','레이스']"
          const raw = item.tags.replace(/'/g, '"') // 싱글→더블 쿼트
          try {
            tagsArr = JSON.parse(raw) // ["싸피","레이스"]
          } catch {
            tagsArr = [item.tags] // 파싱 실패 시 그냥 단일 요소 배열
          }

          // item.tags 가 배열 안에 JSON 문자열로 온 경우
        } else if (Array.isArray(item.tags)) {
          const first = item.tags[0]
          if (typeof first === 'string' && first.trim().startsWith('[')) {
            const raw = first.replace(/'/g, '"')
            try {
              tagsArr = JSON.parse(raw)
            } catch {
              tagsArr = item.tags
            }
          } else {
            // 이미 ["싸피","레이스"] 같은 배열로 온 경우
            tagsArr = item.tags
          }
        }
      }
       let commentsCount = 0
        try {
          const commentRes = await axios.get(
            `${import.meta.env.VITE_APP_BASE_URL}/comments/${item.boardId}`,
            {
              headers: {
                'ngrok-skip-browser-warning': 'true',
              }
            }
          )
          const commentsList = commentRes.data.value
          commentsCount = commentsList.length
        } catch (e) {
          console.warn(`boardId ${item.boardId} 댓글 조회 실패`, e)
        }

          let likeCount = 0
        try {
          const likeRes = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/likes/${item.boardId}`, {
            headers: {
              'ngrok-skip-browser-warning': 'true',
            }
          })
          const cnt     = likeRes.data.value ?? likeRes.data
          likeCount     = typeof cnt === 'number' ? cnt : 0
        } catch (e) {
          console.warn(`boardId ${item.boardId} 좋아요 조회 실패`, e)
        }
      console.log(images)
      console.log(tagsArr)
      return {
        id: item.boardId,
        imageUrl: images,
        title: item.title,
        date: item.date || item.creationDate,
        description: item.content,
        tags: tagsArr || [],
        likes: likeCount || 0,
         comments:    commentsCount, 
      }
    })
  )
  } catch (e) {
    console.error(e)
  }
}

function goToDetail(id) {
  router.push({ name: 'BoardDetail', params: { id } })
}
function goToCreate() {
  router.push({ name: 'BoardCreate' })
}

onMounted(fetchEvents)
</script>

<style scoped>
.board-screen {
  min-height: 100vh;
  background-image: linear-gradient(to top, #a8edea 0%, #fed6e3 100%);
}

.schedule-board {
  max-width: 1300px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Noto Sans KR', sans-serif;
}

/* 헤더 */
.board-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}
.board-header h1 {
  flex: 1;
  text-align: center;
  margin-left: 80px;
  font-size: 32px;
  font-weight: 700;
}
.btn-create {
  margin-left: auto;
  padding: 8px 16px;
  background: #3ea6ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 카드 그리드 */
.cards {
  display: grid;
  width: 100%;
  gap: 24px;
  grid-template-columns: repeat(4, 1fr);
  justify-items: stretch;
  align-items: stretch;
}
@media (max-width: 1200px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 900px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .cards {
    grid-template-columns: 1fr;
  }
}

/* 카드 스타일 */
.card {
  width: 100%;
  max-width : 300px;
  min-height: 360px;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  transition: transform .2s, box-shadow .2s;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

/* 카드 콘텐츠 */
.card-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #333;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-date {
  font-size: 14px;
  color: #888;
  margin-bottom: 12px;
}

.card-desc {
  font-size: 15px;
  color: #555;
  margin-bottom: 16px;
  line-height: 1.4;
   white-space: nowrap;       /* 한 줄 고정 */
  overflow: hidden;          /* 넘치는 텍스트 숨기기 */
  text-overflow: ellipsis;
}

/* 이미지 영역 */
.card-images {
  display: flex;
  overflow-x: auto;
  gap: 4px;
  min-height: 150px; /* 이미지 없을 때 공간 확보 */
  margin-bottom: 16px;
}
.card-image {
  flex: 1 0 auto;
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-bottom: 1px solid #eee;
}

/* 태그 & 통계 (카드 하단 고정) */
.card-meta {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.tags {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tags .tag {
  font-size: 13px;
  display: inline-block;
  color: #3ea6ff;
   background: #f4f0fe;
  border-radius: 11px;
  font-size: 13px;
  padding: 2px 10px;
  margin-right: 6px;
  margin-right: 8px;
}

.stats {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #aaa;
}
.stats .likes,
.stats .comments {
  white-space: nowrap;
  margin-left: 12px;
}
</style>

