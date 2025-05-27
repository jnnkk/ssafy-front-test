<template>
  <div class="my-page-container">
    <!-- 프로필 섹션 -->
    <div class="profile-section">
      <div class="profile-image">
        <img :src="profileImage" alt="Profile Image" />
      </div>
      <div class="profile-info">
        <h2 class="username">{{ userName }}</h2>
        <button class="btn-edit" @click="currentTab = '회원 정보 수정'">회원정보 수정</button>
      </div>
    </div>

    <!-- 탭 네비게이션 -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="{ active: currentTab === tab }"
        @click="currentTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- 탭 콘텐츠 -->
    <div class="tab-content">
      <ScheduleList v-if="currentTab === '일정 리스트'" :schedules="schedules" />
      <FavoritesList v-else-if="currentTab === '즐겨찾기'" :favorites="favorites" />
      <ProfileEdit v-else :user="user" @updated="fetchUserData" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ScheduleList from '@/components/mypage/ScheduleList.vue';
import FavoritesList from '@/components/mypage/FavoriteList.vue';
import ProfileEdit from '@/components/mypage/ProfileEdit.vue';
import axios from 'axios'
const profileImage = ref('');
const userName = ref('');
const tabs = ['일정 리스트', '즐겨찾기', '회원 정보 수정'];
const currentTab = ref(tabs[0]);
const schedules = ref([]);
const favorites = ref([]);
const user = ref({});


async function fetchUserData() {
  const {data} = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/users/me`)
  user.value = data.value;
  const userId = parseInt(user.value.userId);
  profileImage.value = user.value.profile;
  const {data : {value :plans}} = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/plans?userId=${userId}`)
  schedules.value = plans;
  console.log(schedules.value);
}

onMounted(fetchUserData);
</script>

<style scoped>
.my-page-container {
  max-width: 1100px;
  min-height: 85vh;
  margin: 0 auto;
  padding: 20px;
}
.profile-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.profile-image {
  position: relative;
  width: 120px;
  height: 120px;
  margin-right: 20px;
}
.profile-image img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
.profile-image input[type="file"] {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
.profile-info {
  display: flex;
  flex-direction: column;
}
.username { margin: 0; }
.btn-edit {
  margin-top: 8px;
  padding: 6px 12px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}
.tabs button {
  flex: 1;
  padding: 10px;
  background: none;
  border: none;
  cursor: pointer;
}
.tabs button.active {
  border-bottom: 2px solid #3498db;
  font-weight: bold;
}
.tab-content {
  /* 내부 콘텐츠 여백 등 추가 스타일링 가능 */
}
</style>
