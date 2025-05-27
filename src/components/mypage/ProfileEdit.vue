<template>
  <div class="profile-edit-container">
    <div class="profile-edit">
      <h3>회원 정보 수정</h3>
      <form @submit.prevent="onSubmit">
        <div class="form-group">
          <label for="userName">이름</label>
          <input id="userName" readonly v-model="formData.userName" type="text" required />
        </div>
        <div class="form-group">
          <label for="email">이메일</label>
          <input id="email" readonly v-model="formData.email" type="email" required />
        </div>
         <!-- 비밀번호 -->
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="변경할 비밀번호"
          />
        </div>

        <!-- 비밀번호 확인 -->
        <div class="form-group">
          <label for="confirmPassword">비밀번호 확인</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="비밀번호 확인"
          />
        </div>

        <!-- validation 메시지 -->
        <div v-if="passwordErrors.length" class="error-messages">
          <p
            v-for="msg in passwordErrors"
            :key="msg"
            class="error-text"
          >{{ msg }}</p>
        </div>

        <button
          type="submit"
          :disabled="passwordErrors.length > 0"
        >
        저장</button>
      </form>
    </div>

    <div class="profile-image-section">
      <div class="image-wrapper"  @click="triggerFile">
        <img :src="previewUrl || defaultAvatar" alt="프로필 이미지" />
        <span class="plus-icon">+</span>
      </div>
      <div class="profile-btn-wrapper">
        <button class="change-profile-btn" @click="triggerFileInput">프로필 변경하기</button>
      </div>
        <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" style="display: none" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import {useRouter} from 'vue-router';
import axios from 'axios';
const router = useRouter();
const props = defineProps({
  user: {
    type: Object,
    default: () => ({})
  }
});
const emit = defineEmits(['updated']);
const userId = props.user.userId
const formData = reactive({
  userId : props.user.userId,
  userName: props.user.userName || '',
  email: props.user.email || '',
  password: ''
});


// 확인용 필드
const confirmPassword = ref('');

// 비밀번호 유효성 검사
const passwordErrors = computed(() => {
  const errs = [];
  if (formData.password && formData.password.length < 8) {
    errs.push('비밀번호는 8글자 이상이어야 합니다.');
  }
  if (formData.password && confirmPassword.value && formData.password !== confirmPassword.value) {
    errs.push('비밀번호가 일치하지 않습니다.');
  }
  return errs;
});

// (생략) props.user 변경 시 동기화, 이미지 업로드 처리 등...


const defaultAvatar = '/src/assets/noImage.avif'; // 기본 이미지 경로
const fileInput = ref(null);
const selectedFile = ref(null);
const previewUrl = ref('');

watch(() => props.user, (u) => {
  formData.userName = u.userName;
  formData.email = u.email;
});

function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
     selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
}
async function triggerFile(){
   fileInput.value.click();
}
async function triggerFileInput() {
  try{
  if (!selectedFile.value || !userId) return;
  const form = new FormData();
    form.append('userId', userId);                  
    form.append('profile', selectedFile.value);
  await axios.put(`${import.meta.env.VITE_APP_BASE_URL}/users/profile`, form, {
      headers: {
        'Content-Type' : 'multipart/form-data'
      }
    });
     alert('프로필이 성공적으로 변경되었습니다!');
     window.location.replace('/mypage');
  } catch (err) {
    console.error(err);
    alert('프로필 변경 실패');
  }
}
async function onSubmit() {
  try {
    
    await axios.put(`${import.meta.env.VITE_APP_BASE_URL}/users`, formData);
    sessionStorage.removeItem('accessToken');
    window.location.replace('/');

  } catch (err) {
    console.error('업데이트 실패:', err);
  }
}


</script>

<style scoped>
.profile-edit-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 40px;
  max-width: 100vw;
}
.profile-edit {
  display:flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 400px;
  flex: 1;
}
.form-group {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 4px;
  font-weight: 500;
}
.form-group input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 8px 16px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.profile-image-section {
  flex-shrink: 0;
  margin-right: 100px;
}
.image-wrapper {
  position: relative;
  width: 300px; /* 기존 120px -> 더 큼 */
  height: 300px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #ccc;
}
.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.plus-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #3498db;
  color: white;
   width: px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 2px solid white;
}
.profile-btn-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top:30px;
}
.change-profile-btn {
  display: inline-block;
  padding: 6px 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
</style>