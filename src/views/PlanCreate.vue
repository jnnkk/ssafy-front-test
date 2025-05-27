<template>
  <div class="schedule-form-container">
    <h2>{{ isEdit ? '일정 수정' : '일정 등록' }}</h2>
    <form @submit.prevent="onSubmit">
      <!-- 제목/내용/기간 -->
      <div class="form-group">
        <label for="title">제목</label>
        <input id="title" v-model="form.planName" type="text" required />
      </div>
      <div class="form-group">
        <label for="content">내용</label>
        <textarea id="content" v-model="form.planDetail" rows="5" required></textarea>
      </div>
      <div class="form-group date-group">
         <div class="d-flex justify-center">
          <v-date-input
            v-model="form.startDate"
            label="출발 날짜"
            style="width: 250px; max-width: 100%;"
          ></v-date-input>
        </div>
        <div class="d-flex justify-center">
          <v-date-input
            v-model="form.endDate"
            label="도착 날짜"
            style="width: 250px; max-width: 100%;"
          ></v-date-input>
        </div>
      </div>

      <!-- 즐겨찾기 선택 -->
      <div class="favorite-group">
        <div class="favorite-nav">
          <label>즐겨찾기 장소 선택</label>
          <button type="button" @click="openMapModal" class="btn-add fav-add">
            지도에서 선택
          </button>
        </div>
        <div class="favorite-input">
          <select v-model="selectedFavorite">
            <option disabled value="null">장소를 선택하세요</option>
            <option v-for="fav in favoritesOptions" :key="fav.attrId" :value="fav" :disabled="favoritesList.some(item => item.attrId === fav.attrId)">
              {{ fav.attrTitle }}
            </option>
          </select>
          <button type="button" @click="addFavorite" class="btn-add">추가</button>
        </div>
      </div>

      <!-- 선택된 즐겨찾기 리스트 -->
      <div class="favorite-list" v-if="favoritesList.length">
        <h4>즐겨찾기 일정</h4>
        <table>
          <thead>
            <tr>
              <th>순서</th>
              <th>장소</th>
              <th>삭제</th>
              <th>순서</th>
            </tr>
          </thead>
          <draggable
            v-model="favoritesList"
            tag="tbody"
            handle=".drag-handle"
            @end="onDragEnd"
          >
            <template #item="{element, index}">
            <tr :key="element.attrId">
              <td>{{ index + 1 }}</td>
              <td>{{ element.attrTitle }}</td>
              <td>
                <button
                  type="button"
                  @click="removeFavorite(idx)"
                  class="btn-remove"
                >
                  ×
                </button>
              </td>
              <td class="drag-handle">☰</td  >
            </tr>
            </template>
          </draggable>
        </table>
      </div>

      <!-- 작업 버튼 -->
      <div class="button-group">
        <button type="button" @click="onBack" class="btn-back">뒤로 가기</button>
        <button type="submit" class="btn-submit">저장</button>
      </div>
    </form>

    <!-- 모달 -->
    <teleport to="body">
      <div v-if="showMapModal" class="modal-overlay">
        <div class="modal-content">
          <button class="modal-close" @click="closeMapModal">×</button>
          <keep-alive>
            <TourMapView @selectFavorite="onSelectFavorite" />
          </keep-alive>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import draggable from 'vuedraggable';
import TourMapView from '@/views/TourMapView.vue';
import { VDateInput } from 'vuetify/labs/VDateInput'
const route = useRoute();
const router = useRouter();
const mode = route.query.mode;
const planId = route.query.planId;
const isEdit = mode === 'edit';

// 로그인 사용자
const loginUser = ref(JSON.parse(sessionStorage.getItem('loginUser') || '{}'));

// 폼 초기값
const form = reactive({
  planId : '',
  planName: '',
  planDetail: '',
  startDate: '',
  endDate: '',
  userId: loginUser.value.userId
});

// 즐겨찾기 옵션 & 리스트
const favoritesOptions = ref([]);
const selectedFavorite = ref(null);
const favoritesList = ref([]);

// 모달 토글
const showMapModal = ref(false);
const openMapModal = () => showMapModal.value = true;
const closeMapModal = () => {
  showMapModal.value = false;
  fetchFavorites();
}
// API 호출: 즐겨찾기 옵션 불러오기
async function fetchFavorites() {
  const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/favorites/${loginUser.value.userId}`, {
    headers: {
      'ngrok-skip-browser-warning': 'true',
    }
  });
  favoritesOptions.value = res.data.value || res.data;
  // 옵션에 title 세팅 등 필요 시 추가
  await Promise.all(
    favoritesOptions.value.map(async fav => {
      try {
        const atRes = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/attractions/${fav.attrId}`
        );
        fav.attrTitle = atRes.data.value.title;
      } catch {
        fav.attrTitle = '';
      }
    })
  );
  console.log(favoritesOptions.value)
}

// 수정 모드일 때 기존 데이터 채우기
async function fetchPlanData() {
  const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/plans/${planId}`, {
    headers: {
      'ngrok-skip-browser-warning': 'true',
    }
  });
  const data = res.data.value;
  form.planId = data.planId;
  form.planName = data.planName;
  form.planDetail = data.planDetail;
  form.startDate = data.startDate;
  form.endDate = data.endDate;
  

  // 기존 경로
  const rtRes = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/plans/${planId}/routes`, {
    headers: {
      'ngrok-skip-browser-warning': 'true',
    }
  });
  favoritesList.value = await Promise.all(
    rtRes.data.value.map(async r => {
      const atRes = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/attractions/${r.attrId}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        }
      });
      return { attrId: r.attrId, attrTitle: atRes.data.value.title };
    })
  );
  console.log(favoritesList.value);
}

// 즐겨찾기 추가/삭제
const addFavorite = () => {
  if (!selectedFavorite.value) return;
  favoritesList.value.push({
    attrId: selectedFavorite.value.attrId,
    attrTitle: selectedFavorite.value.attrTitle
  });
  selectedFavorite.value = null;
};
const removeFavorite = idx => {
  favoritesList.value.splice(idx, 1);
};
function toMySQLDatetime(dateStr) {
  const d = new Date(dateStr);                // 로컬 자정(09:00 기준)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  // 이제 UTC 자정이니까 toISOString() 해도 "YYYY-MM-DDT00:00:00.000Z"
  return d.toISOString().slice(0, 19).replace('T',' ');
}
// 제출 처리
const onSubmit = async () => {
  form.startDate = toMySQLDatetime(form.startDate);
form.endDate   = toMySQLDatetime(form.endDate);
  if (isEdit) {
    // 플랜 수정
    
    await axios.put(`${import.meta.env.VITE_APP_BASE_URL}/plans`, form, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    });
    // 기존 경로 삭제 후 재등록
    
    for (let i = 0; i < favoritesList.value.length; i++) {
      const itm = favoritesList.value[i];
      console.log(itm);

       await axios.delete(
      `${import.meta.env.VITE_APP_BASE_URL}/plans/${planId}/routes/${itm.attrId}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        }
      });

      await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/plans/${planId}/routes`,
        { planId: planId, order: (i + 1), attrId: itm.attrId }, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          }
        }
      );
    }
    alert('일정 수정에 성공했습니다!');
    router.back();
  } else {
    // 새 플랜 등록
    const res = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/plans`, form, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    });
    const newId = res.data.value;
    for (let i = 0; i < favoritesList.value.length; i++) {
      const itm = favoritesList.value[i];
      await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/plans/${newId}/routes`,
        { planId: newId, order: i + 1, attrId: itm.attrId }, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          }
        }
      );
    }
    alert('일정 생성에 성공했습니다!');
     router.push({ name: 'mypage' });
  }
 
};

const onBack = () => router.back();

onMounted(async () => {
  await fetchFavorites();
  if (isEdit) await fetchPlanData();
});
</script>

<style scoped>
.schedule-form-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}
.schedule-form-container h2 {
  text-align: center;
  margin-bottom: 1rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.date-group {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
.favorite-input select {
  border: 1px solid #ccc;
}
.favorite-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.btn-add.fav-add {
  background-color: #007bff;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}
.btn-add.fav-add:hover {
  background-color: #0056b3;
}
.favorite-group {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.favorite-input {
  display: flex;
  gap: 0.5rem;
}
.favorite-input select {
  flex: 1;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.favorite-input .btn-add {
  background-color: #28a745;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}
.favorite-input .btn-add:hover {
  background-color: #218838;
}

/* 리스트 제목 간격 및 스타일 */
.favorite-list h4 {
  margin: 1.5rem 0 0.75rem;
  font-size: 1.2rem;
  color: #007bff;
  border-bottom: 2px solid #007bff;
  display: inline-block;
  padding-bottom: 0.25rem;
}
.favorite-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.favorite-nav label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}
.favorite-list table {
  width: 100%;
  border-collapse: separate;       /* 분리된 테두리로 둥근 모서리 적용 */
  border-spacing: 0;               /* 셀 간격 제거 */
  border-radius: 8px;              /* 테이블 전체 둥근 모서리 */
  overflow: hidden;                /* 둥근 모서리 안쪽으로 자르기 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 0.95rem;
}

.favorite-list thead {
  background-color: #007bff;       /* 헤더 배경색 */
}

.favorite-list th,
.favorite-list td {
  padding: 0.75rem 1rem;
  text-align: left;
  vertical-align: middle;
}

.favorite-list th {
  color: #fff;                     /* 헤더 글자색 */
  font-weight: 600;
}

.favorite-list tbody tr:nth-child(odd) {
  background-color: #f9f9f9;       /* 홀수 줄 배경색 */
}

.favorite-list tbody tr:hover {
  background-color: #eef5ff;       /* 마우스 오버 효과 */
}

.favorite-list td .btn-remove {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  line-height: 1.5rem;
  text-align: center;
  border-radius: 50%;
  background-color: #dc3545;
  color: #fff;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.favorite-list td .btn-remove:hover {
  background-color: #c82333;
}

/* 첫/끝 열만 모서리 둥글게 */
.favorite-list th:first-child {
  border-top-left-radius: 8px;
}
.favorite-list th:last-child {
  border-top-right-radius: 8px;
}
.favorite-list td:first-child {
  border-bottom-left-radius: 8px;
}
.favorite-list td:last-child {
  border-bottom-right-radius: 8px;
}
.btn-remove {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #dc3545;
}
.btn-remove:hover {
  color: #c82333;
}
.button-group {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}
.btn-back,
.btn-submit {
  flex: 1;
  padding: 0.75rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-back {
  background-color: #6c757d;
  color: #fff;
}
.btn-back:hover {
  background-color: #5a6268;
}
.btn-submit {
  background-color: #007bff;
  color: #fff;
}
.btn-submit:hover {
  background-color: #0056b3;
}
.drag-handle { cursor: move; margin-right: 0.5rem; }
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  position: relative;
  width: 60vw;
  height: 60vh;
  background: #fff;
  border-radius: 8px;
  overflow: auto;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  padding: 1rem;
}
.modal-close {
  position: absolute;
  top: 0.5rem; right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 2rem;    /* 기존 1.5rem → 2rem */
  line-height: 1;     /* 정렬이 깨지면 조정 */
  width: 2.5rem;      /* 원하는 만큼 버튼 크기 조정 */
  height: 2.5rem;
   z-index: 10;
}
</style>
