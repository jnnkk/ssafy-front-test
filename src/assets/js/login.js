// src/assets/js/login.js
// 외부 스크립트를 함수로 래핑하여 export
// 예: src/services/auth.js
import axios from 'axios'

export async function login(email, password) {
  try {
    const { data } = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/auth/login`, {
      username: email,
      password,
    })
    const token = data.accessToken
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    // 토큰 저장
    localStorage.setItem('accessToken', data.accessToken)
    return data
  } catch (err) {
    // 서버가 에러 응답을 내려왔을 때
    if (err.response) {
      // HTTP 상태 코드와 메시지로 구분
      const status = err.response.status
      const msg = err.response.data.error || err.response.data.message
      if (status === 401) {
        throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.')
      }
      throw new Error(msg || '로그인에 실패했습니다.')
    }
    // 요청은 갔는데 응답이 없는 경우
    if (err.request) {
      throw new Error('서버 응답이 없습니다. 네트워크를 확인하세요.')
    }
    // 그 외 설정 오류 등
    throw new Error('로그인 중 오류가 발생했습니다: ' + err.message)
  }
}

export function initAuthScripts() {
  // 최상위 컨테이너 selector 변경 (.auth-container)
  const container = document.querySelector('.auth-container')
  const signInBtn = document.getElementById('signIn')
  const signUpBtn = document.getElementById('signUp')
  const toSignupLink = document.getElementById('toSignupLink')
  const toLoginLink = document.getElementById('toLoginLink')

  if (!container) return

  // 패널 토글
  signInBtn?.addEventListener('click', () => {
    container.classList.remove('right-panel-active')
  })
  signUpBtn?.addEventListener('click', () => {
    container.classList.add('right-panel-active')
  })

  // 링크 클릭으로도 패널 전환
  toSignupLink?.addEventListener('click', (e) => {
    e.preventDefault()
    container.classList.add('right-panel-active')
  })
  toLoginLink?.addEventListener('click', (e) => {
    e.preventDefault()
    container.classList.remove('right-panel-active')
  })

  // 회원가입 입력 유효성 검증
  const nameInput = document.getElementById('signupName')
  nameInput?.addEventListener('input', (e) => {
    const valid = e.target.value.length >= 3 && e.target.value.length <= 16
    e.target.classList.toggle('is-valid', valid)
    e.target.classList.toggle('is-invalid', !valid)
  })

  const emailInput = document.getElementById('signupEmail')
  emailInput?.addEventListener('input', async (e) => {
    // 예시: apiFetch 전역 함수 사용
    const value = e.target.value
    if (!value) return
    try {
      const res = await apiFetch('/auth/check-email', { method: 'GET', params: { email: value } })
      const valid = res.value?.canUse
      e.target.classList.toggle('is-valid', valid)
      e.target.classList.toggle('is-invalid', !valid)
    } catch {
      e.target.classList.add('is-invalid')
    }
  })

  const pwdInput = document.getElementById('signupPassword')
  const pwdCheck = document.getElementById('signupPasswordCheck')
  pwdInput?.addEventListener('input', (e) => {
    const valid = e.target.value.length >= 8 && e.target.value.length <= 32
    e.target.classList.toggle('is-valid', valid)
    e.target.classList.toggle('is-invalid', !valid)
    // 비밀번호 확인도 동시에 검증
    if (pwdCheck) {
      const match = pwdCheck.value === e.target.value && valid
      pwdCheck.classList.toggle('is-valid', match)
      pwdCheck.classList.toggle('is-invalid', !match)
    }
  })

  pwdCheck?.addEventListener('input', (e) => {
    const match = e.target.value === pwdInput.value && pwdInput.value.length >= 8
    e.target.classList.toggle('is-valid', match)
    e.target.classList.toggle('is-invalid', !match)
  })
}
