<template>
    <div class="banner-wrapper d-flex flex-column align-center">
        <!-- 로딩 애니메이션 -->
        <v-container v-if="isLoading" class="loading-container d-flex flex-column align-center justify-center">
            <div class="section-header mb-6">
                <h2 class="text-h4 font-weight-bold text-primary mb-2">
                    🌟 오늘의 추천 관광지
                </h2>
                <p class="text-subtitle-1 text-grey-darken-1">
                    특별한 여행을 위한 엄선된 관광지를 소개합니다
                </p>
            </div>
            <div class="loading-animation">
                <div class="plane-container">
                    <v-icon class="plane" size="48" color="primary">mdi-airplane</v-icon>
                    <div class="cloud cloud-1">☁️</div>
                    <div class="cloud cloud-2">☁️</div>
                    <div class="cloud cloud-3">☁️</div>
                </div>
                <div class="loading-text">
                    <h3 class="text-primary mb-2">AI가 오늘의 추천 관광지를 찾고 있어요</h3>
                    <div class="dots">
                        <span class="dot dot-1">●</span>
                        <span class="dot dot-2">●</span>
                        <span class="dot dot-3">●</span>
                    </div>
                </div>
            </div>
        </v-container>

        <!-- 관광지 캐러셀 -->
        <v-container v-else class="carousel-container">
            <div class="section-header mb-6">
                <h2 class="text-h4 font-weight-bold text-primary mb-2">
                    🌟 오늘의 추천 관광지
                </h2>
                <p class="text-subtitle-1 text-grey-darken-1">
                    특별한 여행을 위한 엄선된 관광지를 소개합니다
                </p>
            </div>

            <v-carousel
                v-model="currentSlide"
                hide-delimiter-background
                show-arrows="hover"
                cycle
                interval="5000"
                height="auto"
                class="attraction-carousel"
            >
                <v-carousel-item
                    v-for="(slideAttractions, slideIndex) in groupedAttractions"
                    :key="slideIndex"
                >
                    <v-row class="px-4">
                        <v-col
                            v-for="attraction in slideAttractions"
                            :key="attraction.attrId"
                            cols="12"
                            sm="6"
                            md="4"
                            class="d-flex my-5"
                        >
                            <v-card
                                class="attraction-card flex-grow-1"
                                elevation="8"
                                hover
                            >
                                <!-- 이미지 섹션 -->
                                <div class="image-container">
                                    <v-img
                                        v-if="attraction.firstImage1"
                                        :src="attraction.firstImage1"
                                        height="220"
                                        cover
                                        class="attraction-image"
                                    >
                                        <template v-slot:placeholder>
                                            <div class="d-flex align-center justify-center fill-height">
                                                <v-progress-circular
                                                    color="primary"
                                                    indeterminate
                                                ></v-progress-circular>
                                            </div>
                                        </template>
                                    </v-img>
                                    <v-img
                                        v-else
                                        :src="dummyImage(attraction.attrId)"
                                        height="220"
                                        cover
                                        class="attraction-image"
                                    >
                                        <template v-slot:placeholder>
                                            <div class="d-flex align-center justify-center fill-height">
                                                <v-progress-circular
                                                    color="primary"
                                                    indeterminate
                                                ></v-progress-circular>
                                            </div>
                                        </template>
                                    </v-img>
                                    
                                    <!-- 카드 오버레이 -->
                                    <div class="card-overlay">
                                        <v-chip
                                            color="primary"
                                            size="small"
                                            prepend-icon="mdi-star"
                                            class="recommendation-badge"
                                        >
                                            추천
                                        </v-chip>
                                    </div>
                                </div>

                                <!-- 카드 내용 -->
                                <v-card-title class="card-title">
                                    <h3 class="text-h6 font-weight-bold line-clamp-2 single-line-ellipsis">
                                        {{ attraction.title }}
                                    </h3>
                                </v-card-title>
                                
                                <v-card-actions class="card-actions">
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        color="red"
                                        variant="elevated"
                                        size="small"
                                        prepend-icon="mdi-heart"
                                        @click="goToAttraction(attraction.attrId)"
                                    >
                                        즐겨찾기에 추가
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-carousel-item>
            </v-carousel>

            <!-- 캐러셀 인디케이터 -->
            <div class="carousel-indicators mt-4" v-if="groupedAttractions.length > 1">
                <v-btn
                    v-for="(slide, index) in groupedAttractions"
                    :key="index"
                    :color="currentSlide === index ? 'primary' : 'grey-lighten-2'"
                    size="x-small"
                    icon
                    class="mx-1"
                    @click="currentSlide = index"
                >
                    <v-icon size="8">mdi-circle</v-icon>
                </v-btn>
            </div>
        </v-container>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useFavoriteStore } from '@/stores/favorites'
import { dummyImage } from '@/assets/js/dummyImage'

const currentSlide = ref(0)
const recommendAttractions = ref([])
const isLoading = ref(false)
const loginUser = ref({ userId: -1, userName: '', email: '', role: '' })

const fetchRecommendAttractions = async () => {
    isLoading.value = true
    if (recommendAttractions.value.length > 0) return
    
    // 여기서 API 호출이나 다른 데이터 소스에서 데이터를 가져올 수 있습니다.
    // http://localhost:8080/attractions/main
    try {
        const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/ai/main`, {
            params: {
                userId: loginUser.value.userId
            },
            withCredentials: true  // 쿠키 전송을 위해 필수!
        })
        if (res.data && res.data.value) {
            for (let i = 0; i < res.data.value.length; i++) {
                const attraction = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/attractions/${res.data.value[i].id}`)
                attraction.data.value.overview = res.data.value[i].overview
                recommendAttractions.value.push(attraction.data.value)
            }
        }
        console.log('API에서 로드된 추천 관광지:', recommendAttractions.value)
    } catch (error) {
        console.error('API 호출 중 오류 발생:', error)
    } finally {
        isLoading.value = false
    }
}

const fetchMe = async () => {
    try {
        const token = sessionStorage.getItem('accessToken')
        const { data } = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/users/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        // data 에서 바로 꺼내 쓰시면 됩니다.
        loginUser.value.userId = data.value.userId
        loginUser.value.userName = data.value.userName
        loginUser.value.email = data.value.email
        loginUser.value.role = data.value.role
        sessionStorage.setItem('loginUser', JSON.stringify(loginUser.value))
    } catch (e) {
        console.error('사용자 정보 불러오기 실패', e)
    }
}

// 한 슬라이드에 3개씩 그룹화
const groupedAttractions = computed(() => {
    const groups = []
    const itemsPerSlide = 3
    
    for (let i = 0; i < recommendAttractions.value.length; i += itemsPerSlide) {
        groups.push(recommendAttractions.value.slice(i, i + itemsPerSlide))
    }
    
    return groups
})

const goToAttraction = (attractionId) => {
    console.log('attractionId:', attractionId)
    const favoriteStore = useFavoriteStore()
    favoriteStore.fetchFavorites(loginUser.value.userId)
    const isFavorite = favoriteStore.getFavorites.some(fav => fav.attrId === attractionId)
    if (!isFavorite) {
        axios.post(`${import.meta.env.VITE_APP_BASE_URL}/favorites`, {
            attrId: attractionId,
            userId: loginUser.value.userId
        })
    }
}

onMounted(async () => {
    await fetchMe()
    await fetchRecommendAttractions()
})
</script>

<style scoped>
p {
  font-family: 'GongGothicMedium'
}

h2 {
  font-family: 'GongGothicMedium'
}

h3 {
  font-family: 'GongGothicMedium'
}

.banner-wrapper {
  padding: 20px 0;
  width: 100%;
}

/* 로딩 애니메이션 스타일 */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-animation {
  text-align: center;
}

.plane-container {
  position: relative;
  height: 150px;
  margin-bottom: 30px;
}

.plane {
  animation: fly 3s ease-in-out infinite;
  z-index: 2;
}

.cloud {
  position: absolute;
  font-size: 24px;
  animation: float 4s ease-in-out infinite;
}

.cloud-1 {
  top: 20px;
  left: 10%;
  animation-delay: 0s;
}

.cloud-2 {
  top: 60px;
  right: 15%;
  animation-delay: 1s;
}

.cloud-3 {
  top: 100px;
  left: 20%;
  animation-delay: 2s;
}

.dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dot {
  color: #1976d2;
  animation: bounce 1.4s ease-in-out infinite both;
}

.dot-1 { animation-delay: -0.32s; }
.dot-2 { animation-delay: -0.16s; }
.dot-3 { animation-delay: 0s; }

/* 캐러셀 스타일 */
.carousel-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
}

.attraction-carousel {
  border-radius: 12px;
  overflow: hidden;
}

.attraction-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border-radius: 16px !important;
  overflow: hidden;
  min-width: 250px;
  max-width: 350px;
  width: 100%;
}

.attraction-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.image-container {
  position: relative;
  overflow: hidden;
}

.attraction-image {
  transition: transform 0.3s ease;
}

.attraction-card:hover .attraction-image {
  transform: scale(1.05);
}

.no-image-placeholder {
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
}

.card-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.recommendation-badge {
  background: rgba(25, 118, 210, 0.9) !important;
  color: white !important;
  backdrop-filter: blur(8px);
}

.card-title {
  padding: 16px 16px 8px 16px;
}

.card-content {
  padding: 0 16px 8px 16px;
}

.card-actions {
  padding: 8px 16px 16px 16px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.single-line-ellipsis {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%; /* 또는 max-width 설정 */
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.v-carousel__controls) {
  display: none;
}

/* 애니메이션 키프레임 */
@keyframes fly {
  0%, 100% { transform: translateX(-20px) translateY(0px); }
  25% { transform: translateX(20px) translateY(-10px); }
  50% { transform: translateX(40px) translateY(0px); }
  75% { transform: translateX(20px) translateY(-5px); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 반응형 디자인 */
@media (max-width: 960px) {
  .attraction-card {
    margin-bottom: 16px;
  }
}

@media (max-width: 600px) {
  .section-header h2 {
    font-size: 1.8rem !important;
  }
  
  .loading-animation .plane {
    font-size: 2rem !important;
  }
  
  .cloud {
    font-size: 18px !important;
  }
}
</style>