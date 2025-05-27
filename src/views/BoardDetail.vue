<template>
  <div class="board-detail-background">
    <div class="board-center">
      <div class="board-detail-layout">
        <!-- 왼쪽: 게시글 내용 -->
        <div class="detail-left">
          <h1 class="title">{{ board.title }}</h1>
          <div class="meta">
            <span class="plan-detail">{{ board.detail }}</span>
            <span class="date">{{ formatDate(board.creationDate) }}</span>
          </div>
          <div class="tags">
            <span class="tag" v-for="tag in board.tags" :key="tag">{{ tag }}</span>
            <div class="edit-post-btn">
              <button class="btn-detail" @click="router.back()">뒤로가기</button>
              <button class="btn-detail" @click="router.push({ name: 'PlanDetail', params: { id: board.planId } })">일정 보기</button>
              <span v-if="loginUser.userId === board.userId">
                <button class="btn-detail" @click="router.push({ name: 'BoardEdit', params: { id: board.id } })">수정</button>
              </span>
            </div>
          </div>
          <div class="image-container" v-if="board.imageUrl && board.imageUrl[0]">
            <img :src="board.imageUrl[0]" alt="게시글 이미지" />
          </div>
          <div class="content" v-html="board.content"></div>
          <div class="action-buttons">
            <v-btn :color="isLikedMarker ? 'primary' : 'grey'" :variant="isLikedMarker ? 'flat' : 'outlined'" size="small" @click="toggleLike" class="like-btn">
              <v-icon small>{{ isLikedMarker ? 'mdi-thumb-up' : 'mdi-thumb-up-outline' }}</v-icon>
              {{ likeCount }}
            </v-btn>
            <v-btn :color="showCommentForm ? 'primary' : 'grey'" :variant="showCommentForm ? 'flat' : 'outlined'" size="small" @click="toggleCommentForm" class="comment-btn">
              <v-icon small>mdi-comment-outline</v-icon>
              💬
            </v-btn>
          </div>
        </div>

        <!-- 오른쪽: 댓글 리스트 (스크롤) -->
        <div class="detail-right" >
          <div class="comments-section" >
            <div class="comment-form"  v-show="showCommentForm">
              <textarea v-model="newComment" placeholder="댓글을 입력하세요..." rows="3" @keyup.enter.prevent="submitComment"></textarea>
              <button class="btn-submit-comment" @click="submitComment" type="button">작성</button>
            </div>
            <div class="comment-list">
              <div class="comment-item" v-for="c in comments" :key="c.commentId">
                <div class="avatar"><img :src="c.profile || defaultAvatar" alt="avatar"/></div>
                <div class="comment-body">
                  <div class="comment-meta">
                    <span class="username">{{ c.userName }}</span>
                    <div class="comment-menu">
                      <button class="menu-btn" @click="toggleMenu(c.commentId)">..</button>
                      <div class="menu-dropdown" v-if="menuOpen === c.commentId && loginUser.userId === c.userId">
                        <button class="dropdown-item edit" @click="onEdit(c)">수정</button>
                        <button class="dropdown-item delete" @click="onDelete(c.commentId)">삭제</button>
                      </div>
                    </div>
                  </div>
                  <div v-if="editingCommentId === c.commentId" class="edit-area">
                    <textarea v-model="editContent" rows="3" placeholder="댓글 수정"></textarea>
                    <div class="edit-actions">
                      <button class="btn-save-edit" @click="onEdit(c)">저장</button>
                      <button class="btn-cancel-edit" @click="cancelEdit()">취소</button>
                    </div>
                  </div>
                  <p v-else class="comment-text">{{ c.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed} from 'vue'
import { useRoute , useRouter } from 'vue-router'
import defaultAvatar from '@/assets/image2.jpg'
import axios from 'axios'
const comments = ref([])
const newComment = ref('')
const router = useRouter()
const route = useRoute()
const showCommentForm = ref(false)
const board = ref({
  title: '',
  detail: '',
  creationDate: '',
  tags: [],
  imageUrl: [],
  content: '',
  planId: '',
  userId: '',
})

// --- 좋아요 상태 관리 ---
const userLikeList       = ref([])   // 내가 좋아요한 리스트
const isLikedMarker      = computed(() => {
   const idNum = Number(route.params.id)
  if (!userLikeList.value && !route.params.id) return false
  return userLikeList.value.some(l => l.boardId === idNum)
})
const boardLikeList = ref([])  // 여기에 boardId별 좋아요 리스트 저장
const likeCount          = ref(0)    // 화면에 표시할 좋아요 개수
let likeId               = null      // 내가 누른 좋아요 레코드 ID

// 특정 게시글 좋아요 리스트(내가 누른) 불러오기

async function fetchLikeList() {
  if (!loginUser.value) return

 // 1) 내가 누른 좋아요 전체 리스트
  const boardId = route.params.id
  if (boardId) {
    try {
      const res2 = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/likes/${boardId}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        }
      })
      likeCount.value = res2.data.value ?? res2.data
      console.log(likeCount.value);
    } catch (e) {
      console.error(`boardId ${boardId} 좋아요 조회 실패`, e)
      boardLikeList.value = []
    }
  }

  try {
    const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/likes`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      params: { userId: loginUser.value.userId }
    })
    userLikeList.value = res.data.value ?? res.data
    console.log(userLikeList);
  } catch {
    userLikeList.value = []
  }
}

// 좋아요 토글
async function toggleLike() {
  if (!loginUser.value) return
  console.log(isLikedMarker.value)
  // 좋아요 안 한 상태 → POST
  if (!isLikedMarker.value) {
    try {
      const res = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/likes`, {
        userId:  loginUser.value.userId,
        boardId: route.params.id
      }, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        }
      })
      likeId = res.data.value?.likeId ?? res.data.likeId
      likeCount.value++
    } catch (e) {
      console.error('좋아요 추가 실패', e)
    }
  }
  // 이미 좋아요 한 상태 → DELETE
  else {
    try {
      await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/likes`,
        {data : {userId:  loginUser.value.userId,
        boardId: Number(route.params.id)},
        headers: {
          'ngrok-skip-browser-warning': 'true',
        }
      }
      )
      likeCount.value = Math.max(0, likeCount.value - 1)
      likeId = null
    } catch (e) {
      console.error('좋아요 취소 실패', e)
    }
  }

  // 내 좋아요 리스트 갱신
  await fetchLikeList()
}
function toggleCommentForm() {
  showCommentForm.value = !showCommentForm.value
}

// --- 편집/메뉴 상태 ---
const menuOpen = ref(null) // 열린 드롭다운의 댓글 ID
const editingCommentId = ref(null) // 현재 편집 중인 댓글 ID
const editContent = ref('') // 편집 textarea 내용
function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  const yyyy = date.getFullYear()
  const mm   = String(date.getMonth() + 1).padStart(2, '0')
  const dd   = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

async function fetchBoard() {
  try {
    const id = route.params.id
    const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/boards/${id}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    })
    const data = res.data.value ?? res.data
    // imageUrl이 중첩된 JSON 문자열로 올 때 파싱
    let images = []
    if (data.imageUrl) {
      const raw = data.imageUrl
      if (Array.isArray(raw) && raw.length) {
        const first = raw[0]
        if (typeof first === 'string') {
          try {
            const parsed = JSON.parse(first)
            images = Array.isArray(parsed) ? parsed : [parsed]
          } catch {
            images = [first]
          }
        } else {
          images = raw
        }
      }
    }
    // 두 슬롯(첫 이미지 + 빈 문자열) 보장
    images.push('')
    board.value = {
      ...data,
      imageUrl: images,
    }
  } catch (e) {
    console.error('게시글 조회 실패', e)
  }
}

async function fetchComments() {
  try {
    const boardId = route.params.id
    const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/comments/${boardId}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    })
    comments.value = res.data.value ?? res.data
    if (comments.value === '해당 게시글에 댓글이 없습니다') {
      comments.value = 0
    }
    await Promise.all(
      comments.value.map(async (c) => {
        try {
          const userRes = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/users/${c.userId}`, {
            headers: {
              'ngrok-skip-browser-warning': 'true',
            }
          })
          const userData = userRes.data.value ?? userRes.data
          c.userName = userData.userName
          c.profile = userData.profile
        } catch {
          c.userName = '알 수 없음'
        }
      }),
    )
  } catch (e) {
    console.error('댓글 조회 실패', e)
  }
}
const loginUser = ref({})
async function submitComment() {
  if (!newComment.value.trim()) return
  const saved = sessionStorage.getItem('loginUser')
  if (saved) {
    loginUser.value = JSON.parse(saved)
  }
  try {
    const boardId = route.params.id

    await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/comments`, {
      boardId: boardId,
      userId: loginUser.value.userId,
      content: newComment.value,
    }, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    })
    newComment.value = ''
    fetchComments()
  } catch (e) {
    console.error('댓글 등록 실패', e)
  }
}
// --- 메뉴 토글 ---
function toggleMenu(commentId) {
  menuOpen.value = menuOpen.value === commentId ? null : commentId
}
function cancelEdit() {
  editingCommentId.value = null
  editContent.value = ''
}
// --- 댓글 삭제 ---
async function onDelete(commentId) {
  try {
    await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/comments?commentId=${commentId}`)
    // 삭제 후 리스트 리프레시
    fetchComments()
  } catch (e) {
    console.error('삭제 실패', e)
    alert('댓글 삭제에 실패했습니다.')
  } finally {
    menuOpen.value = null
  }
}

async function onEdit(comment) {
  // 1) 아직 편집 중이 아니면 → 편집 시작
  if (editingCommentId.value !== comment.commentId) {
    editingCommentId.value = comment.commentId
    editContent.value = comment.content
    menuOpen.value = null
    return
  }
  // 2) 이미 편집 모드라면 → 변경사항 저장
  if (!editContent.value.trim()) return
  try {
    const commentId = comment.commentId
    await axios.put(`${import.meta.env.VITE_APP_BASE_URL}/comments/${commentId}`, {
      content: editContent.value,
      commentId: commentId,
    }, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    })
    editingCommentId.value = null
    fetchComments()
  } catch (e) {
    console.error('댓글 수정 실패', e)
    alert('댓글 수정에 실패했습니다.')
  }
}
onMounted(() => {
  const saved = sessionStorage.getItem('loginUser')
  if (saved) loginUser.value = JSON.parse(saved)
  fetchBoard()
  fetchComments()
  // 3) 내가 좋아요한 리스트 조회
  fetchLikeList()
})
</script>

<style scoped>
.board-detail-background {
  width: 100%;
  background-image: linear-gradient(-20deg, #e9defa 0%, #fbfcdb 100%);
  min-height: 80vh;
}
.board-detail {
  max-width: 800px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.board-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
}
.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}
.meta {
  display: flex;
  gap: 1rem;
  color: #555;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}
.plan-detail {
  font-weight: 500;
}
.date {
  color: #999;
}
.tags {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.edit-post-btn {
  margin-left: auto;
}
.tag {
  padding: 0.3rem 0.8rem;
  border: 1px solid #42b983;
  background: #e6f4ea;
  border-radius: 999px;
  font-size: 0.9rem;
  color: #42b983;
}
.image-container img {
  width: 50%;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}
.content {
  position: relative;
  background: #fff;
  border-left: 4px solid #4f7bf8;  /* 왼쪽에 포인트 컬러 라인 */
  padding: 1.5rem 1rem;
  margin-bottom: 1.5rem;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  line-height: 1.8;
  font-size: 1rem;
  color: #333;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.content:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.comments-section {
  margin-top: 2rem;
}
.comment-form textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  outline: none;
}
.btn-detail{
  margin-right : 30px;
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-submit-comment {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.comment-list {
  margin-top: 1.5rem;
}
.comment-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.comment-body {
  flex: 1;
}
.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}
.username {
  font-weight: 600;
}
.comment-menu {
  position: relative;
  margin-left: auto;
}
.menu-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
}
.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  white-space: nowrap;
}
/* 메뉴 아이템 공통 */
.menu-dropdown .dropdown-item {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
}

/* 수정·삭제 사이에 분리선 넣기 */
.menu-dropdown .dropdown-item + .dropdown-item {
  border-top: 1px solid #eee;
}
.menu-dropdown button {
  width: 100%;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
}
/* 호버 스타일 */
.menu-dropdown .dropdown-item.edit:hover {
  background: #f5f5f5;
}
.menu-dropdown .dropdown-item.delete:hover {
  background: #f5f5f5;
}
/* 1) dropdown 전체에 hover 되면 우선 수정 버튼 배경 없애고 */
/* .menu-dropdown:hover .dropdown-edit {
  background: transparent !important;
} */

/* 2) 오직 수정 버튼에만 hover 중일 때만 회색 배경 */
/* .menu-dropdown .dropdown-edit:hover {
  background: #f5f5f5 !important;
}
.menu-dropdown .dropdown-delete:hover {
  background: #f5f5f5 !important;
} */
.edit-area textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  margin-bottom: 0.5rem;
}
.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-save-edit {
  margin-right: 0.5rem;
}
.btn-cancel-edit {
  margin-left: 0.5rem;
}
.comment-text {
  margin-top: 0.25rem;
  line-height: 1.5;
  font-size: 1rem;
  color: #333;
}
.like-btn  {
  /* 기존 스타일에 추가 */
  min-width: 0 !important;       /* Vuetify 기본 min-width 제거 */
  width: 50px !important;        /* 원하는 너비로 설정 */
  justify-content: center;       /* 아이콘+숫자 중앙 정렬 */
  padding: 4px !important;       /* 버튼 패딩도 줄임 */
}
.comment-btn{
  min-width: 0 !important;       /* Vuetify 기본 min-width 제거 */
  width: 50px !important;        /* 원하는 너비로 설정 */
  justify-content: center;       /* 아이콘+숫자 중앙 정렬 */
  padding: 4px !important;   
}
.btn-toggle{
  display:flex;
  flex-direction : row;
  justify-content: flex-start;
}
.board-center{
  display:flex;
  flex-direction: row;
  justify-content: center;
}
.board-detail-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  padding: 2rem;
  min-width:80vw;
}
.detail-left {
  flex: 2;
}
.detail-right {
  flex: 1;
  max-height: 80vh;
  overflow-y: auto;
  background: #fafafa;
  border-radius: 6px;
  padding: 1rem;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.05);
}
.detail-right::-webkit-scrollbar {
  width: 6px;
}
.detail-right::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 3px;
}
.action-buttons{
  display:flex;
  justify-content: flex-end;
}
</style>
