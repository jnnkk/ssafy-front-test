<template>
  <div class="schedule-register-container">
    <!-- 제목 입력 -->
    <div class="form-group">
      <input v-model="title" type="text" class="title-input" placeholder="제목을 입력하세요" />
    </div>
    
     <!-- Plan 선택 -->
    <div class="form-group">
      <label>등록할 일정 선택</label>
      <select v-model="selectedPlan" class="select-input">
        <option disabled selected value="">일정을 선택해주세요!</option>
        <option
          v-for="plan in planOptions"
          :key="plan.planId"
          :value="plan"
        >
          {{ plan.planName }} |
          {{ plan.routeList.length ? plan.routeList[0].attractionTitle : '' }} →
          {{ plan.routeList.length ? plan.routeList[plan.routeList.length - 1].attractionTitle : '' }} |
          {{ plan.planDetail }}        </option>
      </select>
    </div>

    <!-- 태그 입력 -->
    <!-- <div class="form-group">
      <input
        v-model="tags"
        type="text"
        class="tags-input"
        placeholder="태그를 입력하세요 (쉼표로 구분)"
      />
    </div> -->
    <v-combobox
            v-model="tags"
            :items="[]"
            label="태그"
            multiple
            chips
            clearable
            placeholder="태그를 입력하고 Enter"
            class="mb-4"
          />

    <!-- 이미지 업로드 -->
    <div class="form-group">
      <label class="file-label">
        대표 이미지 업로드
        <input type="file" accept="image/*" @change="handleFileChange" class="file-input" />
      </label>
      <div v-if="imagePreview" class="preview">
        <img :src="imagePreview" alt="이미지 미리보기" />
      </div>
    </div>

    <!-- 내용 입력 -->
    <div class="form-group">
      <textarea
        v-model="content"
        class="content-input"
        placeholder="당신의 이야기를 적어보세요..."
      ></textarea>
    </div>

    <!-- 제출 버튼 -->
    <div class="form-group btn-group">
      <button class="btn-submit" @click="submitPost">등록하기</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const title = ref('')
const tags = ref([])
const content = ref('')
const imageFiles = ref([])       // 파일 객체 배열
const imagePreview = ref(null)
const uploadedImageUrls = ref([])

// Plan 옵션
const planOptions = ref([])
const selectedPlan = ref(null)
const loginUser = ref({})

// 파일 선택 시 미리보기만
function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    imageFiles.value = [file]
    const reader = new FileReader()
    reader.onload = (e) => (imagePreview.value = e.target.result)
    reader.readAsDataURL(file)
  } else {
    imageFiles.value = []
    imagePreview.value = null
  }
}

// 사용자 Plan 조회 및 Route, Attraction title 추가
async function fetchPlans() {
  const saved = sessionStorage.getItem('loginUser')
  if (saved) loginUser.value = JSON.parse(saved)
  if (!loginUser.value.userId) return
  try {
    const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/plans?userId=${loginUser.value.userId}`)
    const plans = res.data.value ?? []

    // 각 Plan별로 Route 및 Attraction title 병렬 조회
    await Promise.all(plans.map(async plan => {
      // Route 조회
      const routeRes = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/plans/${plan.planId}/routes`)
      plan.routeList = routeRes.data.value ?? []

      // 각 Route별 attrId로 Attraction title 조회
      await Promise.all(plan.routeList.map(async route => {
        try {
          const attrRes = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/attractions/${route.attrId}`)
          const attraction = attrRes.data.value ?? attrRes.data
          route.attractionTitle = attraction.title
        } catch {
          route.attractionTitle = ''
        }
      }))
    }))

    planOptions.value = plans
    console.log(planOptions.value)
  } catch (err) {
    console.error('Plan 조회 실패:', err)
  }
}

onMounted(fetchPlans)

// 등록 처리
async function submitPost() {
  try {
    // 1) 이미지 파일 업로드
    uploadedImageUrls.value = []
    for (const file of imageFiles.value) {
      const imgForm = new FormData()
      imgForm.append('image', file)
      const res = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/s3/upload`, imgForm)
      const url = typeof res.data === 'string' ? res.data : res.data.value
      uploadedImageUrls.value.push(url)
    }

    // 2) 게시글 정보 전송 (FormData 사용)
    const formData = new FormData()
    const saved = sessionStorage.getItem('loginUser')
    if (saved) loginUser.value = JSON.parse(saved)
    formData.append('userId', loginUser.value.userId)
  formData.append('userName', loginUser.value.userName)
    formData.append('planId', selectedPlan.value.planId)
    formData.append('title', title.value)
    tags.value.forEach(tag => formData.append('tags', tag))
    formData.append('category', '일정공유게시판')
    formData.append('content', content.value)
    uploadedImageUrls.value.forEach(url => formData.append('imageUrl', url))

    // 3) 최종 API 호출
    await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/boards`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    alert('일정게시판 등록에 성공했습니다!')
    router.push('/boards')
  } catch (error) {
    console.error('등록 실패:', error)
  }
}
</script>

<style scoped>

.schedule-register-container {
  max-width: 800px;
  min-height: 80vh;
  margin: 2rem auto;
  padding: 1rem;
}
.form-group {
  margin-bottom: 1.5rem;
}

/* 제목 입력 스타일 */
.title-input {
  width: 100%;
  font-size: 2rem;
  font-weight: 600;
  border: none;
  border-bottom: 2px solid #444;
  padding: 0.5rem 0;
  outline: none;
}
.select-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid black; /* 검은색 테두리 추가 */
  border-radius: 4px;
  outline: none;}
/* 태그 입력 스타일 */
.tags-input {
  width: 100%;
  font-size: 1rem;
  border: none;
  border-bottom: 1px solid #ccc;
  padding: 0.25rem 0;
  color: #888;
  outline: none;
}

/* 파일 업로드 스타일 */
.file-label {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border: 1px dashed #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #555;
}
.file-input {
  display: none;
}
.preview img {
  margin-top: 0.5rem;
  max-width: 100%;
  border-radius: 8px;
}

/* 내용 입력 스타일 */
.content-input {
  width: 100%;
  min-height: 60vh;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  font-style: italic;
  color: #666;
  resize: vertical;
  outline: none;
}

/* 버튼 그룹 우측 정렬 */
.btn-group {
  text-align: right;
}

/* 등록 버튼 스타일 */
.btn-submit {
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-submit:hover {
  background-color: #66b1ff;
}
</style>
