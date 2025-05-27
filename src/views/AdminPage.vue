<template>
  <div class="admin-page">
    <h1>관리자 페이지</h1>
    <nav class="tabs">
      <ul>
        <li :class="{ active: activeTab === 'schedules' }" @click="changeTab('schedules')">일정공유게시판</li>
        <li :class="{ active: activeTab === 'notices' }" @click="changeTab('notices')">공지사항게시판</li>
        <li :class="{ active: activeTab === 'qna' }" @click="changeTab('qna')">Q&A 게시판</li>
        <li :class="{ active: activeTab === 'users' }" @click="changeTab('users')">회원 정보 관리</li>
      </ul>
    </nav>

    <!-- 일정공유게시판 리스트 -->
    <section v-if="activeTab === 'schedules'" class="panel">
      <h2>일정공유게시판 리스트</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>동작</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item,index) in schedules" :key="item.id">
            <td>{{ index+1 }}</td>
            <td>{{ item.title }}</td>
            <td>{{ item.userName }}</td>
            <td>{{ formatDate(item.creationDate) }}</td>
            <td>
              <button @click="deleteSchedule(item.boardId)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 공지사항게시판 리스트 -->
    <section v-if="activeTab === 'notices'" class="panel">
      <h2>공지사항게시판 리스트</h2>
      <div class = "notice-add">
        <button class = "btn-add" @click="addnotice()">추가</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>동작</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item,index) in notices" :key="item.id">
            <td>{{ index+1 }}</td>
            <td>{{ item.title }}</td>
            <td>{{ item.userName }}</td>
            <td>{{ formatDate(item.creationDate) }}</td>
            <td>
              <button @click="deleteNotice(item.boardId)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Q&A 게시판 리스트 -->
    <section v-if="activeTab === 'qna'" class="panel">
      <h2>Q&A 게시판 리스트</h2>

      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>제목</th>
             <th class="status-header">
        <div class="status-header-inner">
          <span>답변여부</span>
          <select v-model="qnaFilter">
            <option value="all">전체</option>
            <option value="대기중">대기중</option>
            <option value="답변완료">답변완료</option>
            <option value="수정요청">수정요청</option>
            <option value="답변채택">답변채택</option>
          </select>
        </div>
      </th>
            <th>작성자</th>
            <th>작성일</th>
            <th>동작</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item,index) in filteredQnas" :key="item.questionId">
            <td>{{ index+1 }}</td>
            <td @click = "goDetail(item.questionId)" class="clickable">{{ item.title }}</td>
            <td>
              {{ statusAnswer(item.answered, item.isChecked) }}
            </td>  
            <td>{{ item.userName }}</td>
            <td>{{ formatDate(item.createDate) }}</td>
            <td>
              <button @click="deleteQna(item.questionId)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 회원 정보 관리 리스트 -->
    <section v-if="activeTab === 'users'" class="panel">
      <h2>회원 정보 관리</h2>
      <table>
        <thead>
          <tr>
            <th>회원ID</th>
            <th>이름</th>
            <th>이메일</th>
            <th>동작</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user,index) in users" :key="user.id">
            <td>{{ index+1 }}</td>
            <td>{{ user.userName }}</td>
            <td>{{ user.email }}</td>
            <td>
              <button @click="deleteUser(user.userId)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref, computed , onMounted } from 'vue';
import {useRouter} from 'vue-router';
import axios from 'axios';
const activeTab = ref('schedules');
const schedules = ref([]);
const notices = ref([]);
const qnas = ref([]);
const users = ref([]);
const router = useRouter();

function statusAnswer(answered, checked){
  if(answered === false){
    return '대기중'
  }else{
    if(checked == 0){
      return '답변 완료'
    }else if(checked==1){
      return '수정 요청'
    }else{
      return '답변 채택'
    }
  }
}

function changeTab(tab) {
  activeTab.value = tab;
  fetchData(tab);
}
function addnotice(){
  router.push({name: "NoticeCreate"});
}
function goDetail(id){
  router.push({name:"QnADetail", params: { id }})
}

const qnaFilter = ref('all')

// 필터링된 Q&A 목록
const filteredQnas = computed(() => {
  if (qnaFilter.value === 'all') {
    return qnas.value
  }
  if (qnaFilter.value === '대기중') {
    // 아직 답변이 없는 경우
    return qnas.value.filter(item => !item.answered)
  }
  if (qnaFilter.value === '답변완료') {
    return qnas.value.filter(item => item.answered && item.isChecked == 0)
  }
  if (qnaFilter.value === '수정요청') {
    // status 필드가 '수정요청'으로 들어온 경우
    return qnas.value.filter(item => item.answered && item.isChecked == 1)
  }
  if (qnaFilter.value === '답변채택') {
    // status 필드가 '수정요청'으로 들어온 경우
    return qnas.value.filter(item => item.answered && item.isChecked == 2)
  }
  return qnas.value
})

async function fetchData(tab) {
  try {
    switch (tab) {
      case 'schedules':
        schedules.value = (await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/boards`)).data.value;
        break;
      case 'notices':
        notices.value = (await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/notices`)).data.value;
        break;
      case 'qna': {
        // 질문 목록 가져오기
        const questions = (await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/questions`)).data.value;
        // 각 질문에 대해 userId로 사용자 이름 조회
        qnas.value = await Promise.all(
          questions.map(async q => {
            const user = (await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/users/${q.userId}`)).data;
            return { ...q, userName: user.value.userName };
          })
        );
        console.log(questions);
        break;
      }
      case 'users':
        users.value = (await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/users`)).data.value;
        break;
    }
  } catch (err) {
    console.error(err);
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('ko-KR');
}

async function deleteSchedule(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/boards/${id}`);
    schedules.value = schedules.value.filter(item => item.id !== id);
    await fetchData('schedules');
  } catch (err) {
    console.error(err);
    alert('삭제 중 오류가 발생했습니다.');
  }
}

async function deleteNotice(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/notices`,{params: {boardId : id}});
    notices.value = notices.value.filter(item => item.id !== id);
    await fetchData('notices');
  } catch (err) {
    console.error(err);
    alert('삭제 중 오류가 발생했습니다.');
  }
}

async function deleteQna(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/questions`, { params: { questionId: id } });
    qnas.value = qnas.value.filter(item => item.id !== id);
    await fetchData('qna');
  } catch (err) {
    console.error(err);
    alert('삭제 중 오류가 발생했습니다.');
  }
}

async function deleteUser(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/users/${id}`);
    users.value = users.value.filter(item => item.id !== id);
    await fetchData('users');
  } catch (err) {
    console.error(err);
    alert('삭제 중 오류가 발생했습니다.');
  }
}



onMounted(() => {
  fetchData(activeTab.value);
});
</script>

<style scoped>
.admin-page {
  padding: 20px;
}
.tabs ul {
  display: flex;
  list-style: none;
  padding: 0;
}
.tabs li {
  margin-right: 20px;
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}
.tabs li.active {
  border-color: #1890ff;
  font-weight: bold;
}
.panel {
  margin-top: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
   table-layout: fixed; 
}
th, td {
  padding: 8px;
  border: 1px solid #ccc;
  text-align: left;
}
table th:nth-child(1),
table td:nth-child(1) {
  width: 100px;         /* 원하는 픽셀 값으로 조정 */
  white-space: nowrap; /* 내용이 넘칠 경우 줄바꿈 방지 */
  overflow: hidden;
  text-overflow: ellipsis;
}
button {
  padding: 6px 12px;
  background-color: #f5222d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.notice-add{
  display: flex;
  justify-content: flex-end;
  margin-right: 220px;
}
.btn-add{
  margin-top: 8px;
  padding: 6px 12px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.clickable { 
  cursor: pointer; color: #007bff;
 }
 .status-header {
  width: 200px;        /* 원하시는 픽셀/퍼센트로 조정 */
}

 .status-header-inner {
  display: flex;
  align-items: center;
    justify-content: space-between; /* 여백 없이 꽉 채우기 */
  gap: 8px;
}

.status-header-inner select {
  padding: 2px 6px;
  font-size: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 4px;
    min-width: 100px;     /* 드롭다운 폭 고정 */
  max-width: 100px;
}
</style>
