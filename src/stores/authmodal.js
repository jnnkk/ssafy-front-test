// src/stores/authModal.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthModalStore = defineStore('authModal', () => {
  const show = ref(false)
  const open  = () => {
    show.value = true
    console.log(show.value)
  }
  const close = () => {
    show.value = false
    console.log(show.value)
  }
  return { show, open, close }
})
