<!-- src/components/AuthModal.vue -->
<template>
  <v-dialog v-model="modal.show" max-width="900px" persistent transition="dialog-bottom-transition">
    <!-- 기존 모달 콘텐츠 모두 여기에 -->
    <v-card class="auth-card">
      <v-btn
        icon
        @click="modal.close()"
        class="close-btn"
        size="small"
        variant="text"
        position="absolute"
        top="10"
        right="10"
        color="grey-darken-1"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>

      <v-row no-gutters>
        <!-- 로그인/회원가입 폼 영역 -->
        <v-col cols="12" md="6">
          <v-window v-model="activeTab">
            <!-- 로그인 폼 -->
            <v-window-item value="login">
              <v-card-text class="auth-form pa-8">
                <h2 class="text-center text-h4 font-weight-bold primary--text mb-6">로그인</h2>

                <v-form @submit.prevent="onLogin" ref="loginForm">
                  <v-text-field
                    v-model="loginData.email"
                    label="이메일"
                    prepend-inner-icon="mdi-email-outline"
                    type="email"
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    placeholder="이메일을 입력하세요"
                    class="mb-4"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-model="loginData.password"
                    label="비밀번호"
                    prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="showLoginPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="showLoginPassword = !showLoginPassword"
                    :type="showLoginPassword ? 'text' : 'password'"
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    placeholder="비밀번호를 입력하세요"
                    class="mb-4"
                    required
                  ></v-text-field>

                  <v-checkbox
                    v-model="loginData.rememberId"
                    label="아이디 기억하기"
                    color="primary"
                    hide-details
                    class="mt-2 mb-6"
                  ></v-checkbox>

                  <v-btn
                    type="submit"
                    color="primary"
                    block
                    size="large"
                    elevation="2"
                    class="mb-4"
                  >
                    로그인
                  </v-btn>

                  <div class="text-center">
                    <p class="mb-2">
                      계정이 없으신가요?
                      <v-btn
                        variant="text"
                        color="primary"
                        class="pa-0 ml-1"
                        @click="activeTab = 'signup'"
                      >
                        회원가입
                      </v-btn>
                    </p>
                    <v-btn
                      variant="text"
                      color="grey-darken-1"
                      size="small"
                      to="/find-password"
                      @click="modal.close()"
                    >
                      비밀번호 찾기
                    </v-btn>
                  </div>

                  <!-- 하단 닫기 버튼 추가 -->
                  <v-divider class="my-4"></v-divider>
                  <div class="text-center">
                    <v-btn
                      variant="outlined"
                      color="grey-darken-1"
                      @click="modal.close()"
                      class="px-8"
                    >
                      닫기
                    </v-btn>
                  </div>
                </v-form>
              </v-card-text>
            </v-window-item>

            <!-- 회원가입 폼 -->
            <v-window-item value="signup">
              <v-card-text class="auth-form pa-8">
                <h2 class="text-center text-h4 font-weight-bold primary--text mb-6">회원가입</h2>

                <v-form @submit.prevent="onSignup" ref="signupForm">
                  <v-text-field
                    v-model="signupData.userName"
                    label="이름"
                    prepend-inner-icon="mdi-account-outline"
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    placeholder="이름을 입력하세요"
                    class="mb-4"
                    :rules="[
                      (v) => !!v || '이름을 입력해주세요',
                      (v) =>
                        (v && v.length >= 3 && v.length <= 16) ||
                        '이름은 최소 3자 최대 16자로 구성해 주십시오',
                    ]"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-model="signupData.email"
                    label="이메일"
                    prepend-inner-icon="mdi-email-outline"
                    type="email"
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    placeholder="이메일을 입력하세요"
                    class="mb-4"
                    :rules="[
                      (v) => !!v || '이메일을 입력해주세요',
                      (v) =>
                        validation.emailValid ||
                        '이미 사용중인 email이거나 올바르지 않은 형식입니다',
                    ]"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-model="signupData.password"
                    label="비밀번호"
                    prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="showSignupPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="showSignupPassword = !showSignupPassword"
                    :type="showSignupPassword ? 'text' : 'password'"
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    placeholder="비밀번호를 입력하세요"
                    class="mb-4"
                    :rules="[
                      (v) => !!v || '비밀번호를 입력해주세요',
                      (v) =>
                        (v && v.length >= 8 && v.length <= 32) ||
                        '비밀번호는 최소 8자 최대 32자로 구성해 주십시오',
                    ]"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-model="signupData.passwordCheck"
                    label="비밀번호 확인"
                    prepend-inner-icon="mdi-lock-check-outline"
                    :append-inner-icon="showSignupPasswordCheck ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="showSignupPasswordCheck = !showSignupPasswordCheck"
                    :type="showSignupPasswordCheck ? 'text' : 'password'"
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    placeholder="비밀번호를 다시 입력하세요"
                    class="mb-4"
                    :rules="[
                      (v) => !!v || '비밀번호 확인을 입력해주세요',
                      (v) => v === signupData.password || '비밀번호가 일치하지 않습니다',
                    ]"
                    required
                  ></v-text-field>

                  <v-btn
                    type="submit"
                    color="primary"
                    block
                    size="large"
                    elevation="2"
                    class="mt-6 mb-4"
                    :disabled="!formValid"
                  >
                    회원가입
                  </v-btn>

                  <div class="text-center">
                    <p>
                      이미 계정이 있으신가요?
                      <v-btn
                        variant="text"
                        color="primary"
                        class="pa-0 ml-1"
                        @click="activeTab = 'login'"
                      >
                        로그인
                      </v-btn>
                    </p>
                  </div>

                  <!-- 하단 닫기 버튼 추가 -->
                  <v-divider class="my-4"></v-divider>
                  <div class="text-center">
                    <v-btn
                      variant="outlined"
                      color="grey-darken-1"
                      @click="modal.close()"
                      class="px-8"
                    >
                      닫기
                    </v-btn>
                  </div>
                </v-form>
              </v-card-text>
            </v-window-item>
          </v-window>
        </v-col>

        <!-- 환영 이미지/메시지 영역 -->
        <v-col cols="12" md="6" class="d-none d-md-flex">
          <v-img
            :src="activeTab === 'login' ? '/img/login-welcome.jpg' : '/img/signup-welcome.jpg'"
            cover
            height="100%"
            class="auth-image"
          >
            <div
              class="welcome-overlay d-flex flex-column justify-center align-center text-center pa-8"
            >
              <v-card color="transparent" flat class="text-white">
                <v-card-title class="text-h3 font-weight-bold mb-4">
                  {{ activeTab === 'login' ? '환영합니다!' : '처음이신가요?' }}
                </v-card-title>
                <v-card-text class="text-body-1 mb-6">
                  {{
                    activeTab === 'login'
                      ? '로그인하고 다양한 서비스를 이용해 보세요.'
                      : '지금 바로 회원가입하고 새로운 경험을 시작하세요.'
                  }}
                </v-card-text>
                <v-btn
                  color="white"
                  variant="outlined"
                  size="large"
                  class="px-8"
                  @click="activeTab = activeTab === 'login' ? 'signup' : 'login'"
                >
                  {{ activeTab === 'login' ? '회원가입' : '로그인' }}
                </v-btn>
              </v-card>
            </div>
          </v-img>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
// login(email, password) 은 앞서 만든 서비스 함수
import { login } from '@/assets/js/login'
import { useAuthModalStore } from '@/stores/authmodal'

const modal = useAuthModalStore()
const router = useRouter()

// 활성 탭 (로그인/회원가입)
const activeTab = ref('login')
const loginForm = ref(null)
const signupForm = ref(null)

// 비밀번호 표시 토글
const showLoginPassword = ref(false)
const showSignupPassword = ref(false)
const showSignupPasswordCheck = ref(false)

// 폼 데이터
const signupData = reactive({
  userName: '',
  email: '',
  password: '',
  passwordCheck: '',
})

const loginData = reactive({
  email: '',
  password: '',
  rememberId: false,
})

// 유효성 검사 상태
const validation = reactive({
  nameValid: true, // 초기값을 true로 변경하여 기본 검증 오류 메시지 안 보이게 함
  emailValid: true,
  passwordValid: true,
  passwordCheckValid: true,
})

// 유효성 검사 로직
watch(
  () => signupData.userName,
  (val) => (validation.nameValid = (val.length >= 3 && val.length <= 16) || val.length === 0),
)

watch(
  () => signupData.email,
  async (val) => {
    // 1) 값이 없으면 유효 처리 후 종료
    if (!val) {
      validation.emailValid = true
      return
    }

    // 2) 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    validation.emailValid = emailRegex.test(val)

    // 3) 중복 체크 API
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/auth/check-email`,
        { params: { email: val } }
      )
      validation.emailValid = data.value.canUse
      console.log(validation.emailValid)
    } catch {
      validation.emailValid = false
    }
  }
)

watch(
  () => signupData.password,
  (val) => {
    validation.passwordValid = (val.length >= 8 && val.length <= 32) || val.length === 0
    validation.passwordCheckValid =
      validation.passwordValid &&
      (val === signupData.passwordCheck || signupData.passwordCheck.length === 0)
  },
)

watch(
  () => signupData.passwordCheck,
  (val) => {
    validation.passwordCheckValid =
      (validation.passwordValid && val === signupData.password) || val.length === 0
  },
)

// 전체 폼 유효성
const formValid = computed(
  () =>
    validation.nameValid &&
    validation.emailValid &&
    validation.passwordValid &&
    validation.passwordCheckValid &&
    signupData.userName &&
    signupData.email &&
    signupData.password &&
    signupData.passwordCheck,
)

// 제출 핸들러
async function onSignup() {
  const valid = await signupForm.value?.validate()
  const user = {
      userName : signupData.userName,
      email : signupData.email,
      password : signupData.password,
      role : 'ADMIN'
  }
  console.log(user);
  if (!valid?.valid) return

  try {
    // 여기에 회원가입 API 호출 로직 추가
    const {data} = axios.post(`${import.meta.env.VITE_APP_BASE_URL}/auth/signup`,
      {
      userName : signupData.userName,
      email : signupData.email,
      password : signupData.password,
      profile : 'https://enjoytrip123-bucket.s3.ap-southeast-2.amazonaws.com/noImage.avif'
      })
    console.log(data)
    console.log('회원가입 데이터:', signupData)

    // 성공 시 로그인 탭으로 이동
    activeTab.value = 'login'

    // 성공 메시지 표시 로직 추가
    // 예: 토스트 알림 또는 스낵바
  } catch (error) {
    console.error('회원가입 오류:', error)
    // 오류 메시지 표시 로직 추가
  }
}

async function onLogin() {
  // 1) 폼 유효성 검사
  const valid = await loginForm.value?.validate()
  if (!valid?.valid) return

  try {
    // 2) 로그인 요청 (withCredentials 옵션은 쿠키방식일 때만 필요)
    const { accessToken } = await login(loginData.email, loginData.password)

    // 3) 토큰 저장
    sessionStorage.setItem('accessToken', accessToken)
    // axios 기본 헤더에 자동으로 붙도록
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

    // (선택) 아이디 기억하기
    if (loginData.rememberId) {
      sessionStorage.setItem('savedEmail', loginData.email)
    } else {
      sessionStorage.removeItem('savedEmail')
    }

    // 4) 모달 닫고 메인 페이지로 이동
    modal.close()
    console.log('로그인 성공!!')
    router.push({ name: 'home' }).then(() => {
      window.location.reload()
    })
  } catch (err) {
    // 5) 실패 처리
    alert('로그인에 실패했습니다.\n' + (err.message || '알 수 없는 오류'))
    // 재입력 편의를 위해 비밀번호만 초기화
    loginData.password = ''
  }
}

// 모달이 닫힐 때 폼 초기화 (선택적)
watch(modal.show, (val) => {
  if (!val) {
    // 모달이 닫힐 때 실행할 로직
    // 폼 초기화 등
  }
})
</script>

<style scoped>
.auth-card {
  overflow: hidden;
  border-radius: 16px;
}

.auth-form {
  max-width: 450px;
  margin: 0 auto;
}

.welcome-overlay {
  background: rgba(0, 0, 0, 0.5);
  height: 100%;
  width: 100%;
}

.close-btn {
  z-index: 10;
}

/* 모바일 화면에서 카드 패딩 조정 */
@media (max-width: 600px) {
  .auth-form {
    padding: 16px !important;
  }
}

/* 모달 백드롭 효과 강화 */
:deep(.v-overlay__scrim) {
  background: rgba(0, 0, 0, 0.7) !important;
  backdrop-filter: blur(2px);
}

/* deep 셀렉터로 Vuetify 내부 엘리먼트 선택 */
:deep(.v-selection-control__input input) {
  border-radius: 50% !important;
  border: 2px solid black !important;
  width: 20px !important;
  height: 20px !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  opacity: 0.5 !important;
}
</style>
