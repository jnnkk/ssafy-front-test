<template>
  <div class="edit-page">
    <v-card class="mx-auto edit-inner">
      <v-card-title>게시글 수정</v-card-title>
      <v-card-text>
        <v-form ref="editForm" @submit.prevent="onSave">
          <v-text-field
            v-model="form.title"
            label="제목"
            required
          />

          <!-- 일정 선택 드롭다운 -->
          <v-select
            v-model="form.planId"
            :items="planOptions"
            item-title="label"
            item-value="planId"
            label="등록할 일정 선택"
            required
            class="mb-4"
          />

           <v-combobox
            v-model="form.tags"
            :items="[]"
            label="태그"
            multiple
            chips
            clearable
            placeholder="태그를 입력하고 Enter"
            class="mb-4"
          />

          <v-textarea
            class="edit-content"
            v-model="form.content"
            label="본문 내용"
            rows="6"
            required
          />

          <div class="actions">
            <v-btn color="primary" type="submit">저장</v-btn>
            <v-btn text @click="onCancel">취소</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const editForm = ref(null)

// 로그인 사용자
const loginUser = ref({ userId: null })

// 폼 데이터
const form = reactive({
  title: '',
  planId: null,
  content: '',
})

// 일정 옵션
const planOptions = ref([])

// 기존 게시글 불러오기
async function fetchBoard() {
  try {
    const { data: raw } = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/boards/${route.params.id}`)
    const data = raw.value ?? raw
    form.title = data.title
    form.planId = data.planId
    form.tags = Array.isArray(data.tags) ? data.tags : []
    form.content = data.content
  } catch (e) {
    console.error('게시글 불러오기 실패', e)
  }
}

// 일정 목록 및 세부 정보 불러오기
async function fetchPlans() {
  const saved = sessionStorage.getItem('loginUser')
  if (saved) loginUser.value = JSON.parse(saved)
  if (!loginUser.value.userId) return
  try {
    const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/plans?userId=${loginUser.value.userId}`)
    const plans = res.data.value ?? []

    await Promise.all(plans.map(async plan => {
      const routeRes = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/plans/${plan.planId}/routes`)
      plan.routeList = routeRes.data.value ?? []

      await Promise.all(plan.routeList.map(async r => {
        try {
          const attrRes = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/attractions/${r.attrId}`)
          r.attractionTitle = (attrRes.data.value ?? attrRes.data).title
        } catch {
          r.attractionTitle = ''
        }
      }))

      plan.label = `${plan.planName} | ${plan.routeList.map(r => r.attractionTitle).join(' → ')} | ${plan.planDetail || ''}`
    }))

    // 간단 객체 배열로 매핑해 선택지에 사용
    planOptions.value = plans.map(plan => ({
      planId: plan.planId,
      label: plan.label
    }))
  } catch (err) {
    console.error('Plan 조회 실패:', err)
  }
}

// 저장 핸들러
async function onSave() {
  if (!(await editForm.value.validate())) return
  try {
    const boardId = route.params.id
    // 수정: RESTful하게 URL에 ID 포함
await axios.put(
  `${import.meta.env.VITE_APP_BASE_URL}/boards/${boardId}`,
  {
    title: form.title,
    planId: form.planId,
    tags: form.tags,
    content: form.content,
  },
  { headers: { 'Content-Type': 'application/json' } }
)
    router.push({ name: 'BoardDetail', params: { id: boardId } })
  } catch (e) {
    console.error('수정 실패', e)
  }
}
// 취소 핸들러
function onCancel() {
  router.back()
}

onMounted(() => {
  fetchBoard()
  fetchPlans()
})
</script>

<style scoped>
.edit-page {
  min-height: 50vh;
  display: flex;
  justify-content: center;
  padding: 2rem;
}
.edit-inner {
  min-width: 50vw;
}
.edit-content {
  min-height: 50vh;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
</style>
