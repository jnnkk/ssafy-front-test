<template>
  <div class="banner-wrapper">
    <transition-group 
      name="fade" 
      tag="div" 
      class="banner-image-container"
    >
      <v-img
        v-for="(img, index) in bannerImages" 
        :key="img"
        :src="img"
        v-show="index === currentIndex"
        gradient="to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.1)"
        class="banner-image"
        cover
      />
    </transition-group>
    <div class="banner-overlay d-flex flex-column align-center justify-center pa-5">
      <h1 class="display-2 white--text">여행을 즐겨라</h1>
      <p class="subtitle-1 white--text">당신의 완벽한 여행을 위한 최고의 가이드, 거기어때와 함께하세요</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 배너 이미지 배열
const bannerImages = [
  '/img/메인사진1.jpg',
  '/img/메인사진2.jpg',
  '/img/메인사진3.jpg',
  '/img/메인사진4.jpg',
]

// 현재 보여줄 인덱스
const currentIndex = ref(0)
let timerId = null

onMounted(() => {
  // 5초마다 이미지 전환
  timerId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % bannerImages.length
  }, 5000)
})

onUnmounted(() => {
  clearInterval(timerId)
})
</script>

<style scoped>

.banner-wrapper {
  position: relative;
  width: 100%;          /* 컨테이너 가로 고정 */
  height: 900px;        /* 컨테이너 높이 고정 */
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.banner-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.banner-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;         /* 컨테이너 전체를 덮도록 */
  object-fit: cover;    /* 사진 비율 유지하며 꽉 채움 */
}

/* 페이드 트랜지션 효과 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.banner-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  text-shadow: 4px 4px 8px black;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 25px;
}

.text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

/* 중앙 콘텐츠 정렬 */
.d-flex.align-center.justify-center {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
</style>