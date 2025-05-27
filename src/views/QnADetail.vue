<template>
  <div class="qna-detail-container">
    <div class="page-title">QnA</div>

    <!-- 헤더 -->
    <header class="detail-header">
      <h1>제목 : {{ question.title }}</h1>
      <button @click="goBack" class="btn-back">뒤로가기</button>
    </header>

    <!-- 메시지 목록 -->
    <div class="messages">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['message', msg.sender === 'USER' ? 'user' : 'admin']"
      >
        <div class="sender-label">
          {{ msg.sender === 'USER' ? '질문자' : '답변자' }}
          <div v-if="(msg.sender=== 'ADMIN') && (loginUser.role === 'ADMIN')" class = "ans-del" @click="deleteAnswer()">
            삭제
          </div>
        </div>
        <div class="bubble">
          <!-- 관리자 답변 제목 -->
          <template v-if="msg.sender === 'ADMIN' && msg.title">
            <div class="answer-title">{{ msg.title }}</div>
          </template>
          {{ msg.content }}
        </div>
        <div v-if="msg.sender === 'ADMIN' && question.answered && question.isChecked==0" class="action-buttons">
          <button @click="updateCheckStatus(false)" class="btn-submit">수정 요청</button>
          <button @click="updateCheckStatus(true)" class="btn-submit">답변 완료</button>
        </div>
        <div class="time">{{ formatTime(msg.date) }}</div>
      </div>
        
    </div>

   


    <!-- ADMIN만 보이는 답변 입력 영역 -->
    <div v-if="loginUser.role === 'ADMIN'" class="reply-input">
      <textarea
        v-model="replyText"
        placeholder="답변을 입력하세요..."
      ></textarea>
      <button @click="postAnswer">답변 등록</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

// 라우터, 파라미터 세팅
const route = useRoute()
const router = useRouter()
const questionId = parseInt(route.params.id)

// 로그인 사용자 정보 (예: localStorage 또는 글로벌 스토어에서 로드)
const loginUser = ref({ })
onMounted(() => {
   const saved = sessionStorage.getItem('loginUser')
  if (saved) loginUser.value = JSON.parse(saved)
  })

// 질문 객체
const question = ref({
  questionId: 0,
  userId: 0,
  title: '',
  content: '',
  view: 0,
  answered: false,
  createDate: '',
  updateDate: '',
  isChecked: 0, // 답변 완료 여부
})
// 메시지 배열
const messages = ref([])
// 답변 입력용
const replyText = ref('')

function formatTime(timestamp) {
  if (!timestamp) return ''
  const iso = timestamp.replace(' ', 'T')
  const d = new Date(iso)
  return isNaN(d)
    ? timestamp.slice(11, 16)
    : d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

// 상세 조회 및 메시지 구성
async function fetchDetail() {
  try {
    const qRes = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/questions/${questionId}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    })
    const qData = qRes.data.value ?? {}
    question.value= qData
    console.log(qData)
    console.log(question)
    const msgs = []
    msgs.push({
      id: `q-${qData.questionId}`,
      sender: 'USER',
      content: qData.content,
      date: qData.createDate,
    })

    const aRes = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/questions/${questionId}/answers`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    })
    const answers = aRes.data.value || []
    answers.forEach(ans => {
      msgs.push({
        id: `a-${ans.id}`,
        sender: 'ADMIN',
        title: ans.answerTitle,
        content: ans.answerContent,
        date: ans.answeredDate,
      })
    })

    if (answers.length === 0) {
      msgs.push({
        id: 'waiting',
        sender: 'ADMIN',
        content: '답변자 답변 기다리는중....',
        date: '',
      })
    }

    messages.value = msgs
    
  } catch (err) {
    console.error('상세 조회 실패', err)
  }
}

function goBack() {
  router.back();
}
// isChecked 상태 업데이트
async function updateCheckStatus(isChecked) {
  try {
    const result = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/questions/${questionId}/request`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      params:  {isChecked}
    })
    if(result.data.value === 'checked'){
      question.value.isChecked = 1;
      console.log(question.value.answered);
    } else{
      question.value.answered = true;
      question.value.isChecked = 2;
      console.log(question.value.answered);
    }
  } catch (err) {
    console.error('상태 업데이트 실패', err)
  }
}
async function deleteAnswer() {
  if (!confirm('정말 이 답변을 삭제하시겠습니까?')) return
  try {
    await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/questions/${questionId}/answers`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    })
    fetchDetail()
  } catch (err) {
    console.error('답변 삭제 실패', err)
  }
}

// 답변 등록
async function postAnswer() { 
  if (!replyText.value.trim()) return
  try {
    await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/questions/${questionId}/answers`, {
      questionId,
      answerTitle: '',
      answerContent: replyText.value,
      adminId: loginUser.value.userId,
    }, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    })
    replyText.value = ''
    fetchDetail()
  } catch (err) {
    console.error('답변 등록 실패', err)
  }
}

onMounted(fetchDetail)
</script>

<style scoped>
.qna-detail-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  position: relative;
}

.page-title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 40px;
  text-align: center;
}
.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}
.detail-header h1 {
  flex: 1;
  text-align: center;
  margin-left: 100px;
}
.question-title {
  font-size: 28px;
  margin: 0;
}
.btn-back {
  background: none;
  border: none;
  color: #555;
  font-size: 16px;
  cursor: pointer;
}
.detail-header .btn-back {
  margin-left: auto;
}
.btn-submit{
  margin-top : 1rem;
  padding: 0.5rem 1rem;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
}
.messages {
  display: flex;
  flex-direction: column;
  gap: 100px;
  overflow-y: auto;
  padding-bottom: 100px;
  max-height: calc(100% - 200px);
  margin-top: 150px;
}

.message {
  display: flex;
  flex-direction: column;
  width: auto;
  max-width: 70%;
}
.message.admin {
  align-self: flex-start;
}
.message.user {
  align-self: flex-end;
}

.bubble {
  display: inline-block;
  width: auto;
  max-width: 100%;
  padding: 24px 20px; /* 세로 패딩 키움 */
  border-radius: 20px;
  line-height: 1.6;
  word-break: break-word;
  background: #f1f0f0;
  font-size: 24px;
}
.message.user .bubble {
  background: #dcf8c6;
}

.bubble::after {
  content: '';
  position: absolute;
  top: 20px;
  border-width: 12px;
  border-style: solid;
}
.message.admin .bubble::after {
  left: -12px;
  border-color: transparent #f1f0f0 transparent transparent;
}
.message.user .bubble::after {
  right: -12px;
  border-color: transparent transparent transparent #dcf8c6;
}
.sender-label {
  display: flex;
  justify-content: space-between;
  font-size: 30px;
  font-weight: 600;
  margin-left: 20px;
  margin-bottom: 8px;
  color: black;
}
.ans-del{
  margin-top :10px;
  font-size : 20px;
}
.answer-title {
  font-weight: 600;
  margin-bottom: 8px;
}
.time {
  font-size: 14px;
  color: #999;
  margin-top: 6px;
  align-self: flex-end;
}

.reply-input {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fafafa;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}
.reply-input textarea {
  flex: 1;
  resize: none;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 12px;
  height: 56px;
  font-size: 16px;
}
.reply-input button {
  padding: 0 20px;
  border: none;
  border-radius: 12px;
  background: #333;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}
.qna-detail-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  position: relative;
}

.page-title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 40px;
  text-align: center;
}
.reply-input button {
  padding: 0 20px;
  border: none;
  border-radius: 12px;
  background: #333;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}
</style>
