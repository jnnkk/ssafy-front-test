<template>
  <div class="schedule-list">
    <!-- 헤더: 제목과 추가 버튼 -->
    <div class="header">
      <h3>내 일정</h3>
      <button class="btn-add" @click="onAdd">추가</button>
    </div>

    <!-- 두 개의 테이블을 flex로 옆배치 -->
    <div class="tables">
      <!-- ① 일정 데이터만 보여주는 테이블 -->
      <table class="schedule-table">
        <thead>
          <tr>
            <th class="col-title">제목</th>
            <th class="col-detail">요약</th>
            <th class="col-start">시작일</th>
            <th class="col-end">마지막일</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="schedule in schedules"
            :key="schedule.planId"
            @click="goDetail(schedule.planId)"
          >
            <td>{{ schedule.planName }}</td>
            <td>{{ schedule.planDetail }}</td>
            <td>{{ schedule.startDate }}</td>
            <td>{{ schedule.endDate }}</td>
          </tr>
        </tbody>
      </table>

      <!-- ② 삭제 버튼만 보여주는 테이블 -->
      <table class="delete-table">
        <thead>
          <tr><th>삭제</th></tr>
        </thead>
        <tbody>
          <tr v-for="schedule in schedules" :key="schedule.planId">
            <!-- @click.stop 으로 부모 클릭(goDetail) 방지 -->
            <td>
              <button
                class="btn-delete"
                @click.stop="deletePlan(schedule.planId)"
                title="일정 삭제"
              >&times;</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const props = defineProps({
  schedules: {
    type: Array,
    default: () => []
  }
});
const { schedules } = toRefs(props);
const router = useRouter();

// 일정 상세로 이동
function goDetail(id) {
  router.push({ name: 'PlanDetail', params: { id } });
}

// 일정 삭제
async function deletePlan(planId) {
  if (!confirm('정말 이 일정을 삭제하시겠습니까?')) return;
  await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/plans/${planId}`);
  schedules.value = schedules.value.filter(p => p.planId !== planId);
  window.location.replace('/mypage');
}

// 추가 버튼
function onAdd() {
  router.push({ name: 'PlanCreate' });
}
</script>

<style scoped>
.schedule-list {
  width: 100%;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.btn-add {
  padding: 6px 12px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 두 테이블을 나란히 배치 */
.tables {
  display: flex;
}

/* 왼쪽 일정 테이블 */
.schedule-table {
  border-collapse: collapse;
  flex: 1;            /* 남는 공간 차지 */
}
.schedule-table th,
.schedule-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  text-align: left;
}
.schedule-table thead th {
  border-bottom: 2px solid #3498db;
  font-size: 18px;
}

/* 오른쪽 삭제 전용 테이블 */
.delete-table {
  border-collapse: collapse;
  width: 60px;        /* 넉넉히 버튼만 담을 폭 */
  margin-left: 8px;   /* 왼쪽 테이블과 간격 */
  margin-top: 3px;
}
.delete-table th,
.delete-table td {
  padding: 8px;
  border-bottom: 1px solid #eee;
  text-align: center;
}
.delete-table thead th {
  border-bottom: 2px solid #3498db;
}

/* X 버튼 스타일 */
.btn-delete {
  background: transparent;
  border: none;
  color: #e74c3c;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s;
}
.btn-delete:hover {
  color: #c0392b;
}
</style>
