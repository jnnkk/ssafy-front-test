<template>
  <v-container class="local-info-container">
    <v-row>
      <v-col cols="12">
        <v-window
          v-model="window"
          class="elevation-1"
          show-arrows="hover"
          continuous="true"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        >
          <v-window-item
            v-for="(city, i) in cities"
            :key="i"
            :value="i"
          >
            <v-row>
              <v-col
                v-for="(item, j) in getThreeItems(i)"
                :key="j"
                cols="12"
                md="4"
                class="mb-4"
              >
                <MainLocalInformationCard
                  :item="item"
                  @handle-click="handleClick(item.sidoCode)"
                />
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLocalInformationCard from '@/components/MainLocalInformationCard.vue'


const cities = [
  { name: '서울', image: '/img/local/서울.jpeg', sidoCode: '1' },
  { name: '부산', image: '/img/local/부산.jpeg', sidoCode: '6' },
  { name: '인천', image: '/img/local/인천.jpeg', sidoCode: '2' },
  { name: '대전', image: '/img/local/대전.jpg', sidoCode: '3' },
  { name: '대구', image: '/img/local/대구.jpg', sidoCode: '4' },
  { name: '광주', image: '/img/local/광주.jpg', sidoCode: '5' },
  { name: '울산', image: '/img/local/울산.jpeg', sidoCode: '7' },
  { name: '세종특별자치시', image: '/img/local/세종.jpg', sidoCode: '8' },
  { name: '경기도', image: '/img/local/경기.jpeg', sidoCode: '31' },
  { name: '강원특별자치도', image: '/img/local/강원.jpeg', sidoCode: '32' },
  { name: '충청북도', image: '/img/local/충북.jpeg', sidoCode: '33' },
  { name: '충청남도', image: '/img/local/충남.jpeg', sidoCode: '34' },
  { name: '경상북도', image: '/img/local/경북.jpeg', sidoCode: '35' },
  { name: '경상남도', image: '/img/local/경남.jpeg', sidoCode: '36' },
  { name: '전북특별자치도', image: '/img/local/전북.jpeg', sidoCode: '37' },
  { name: '전라남도', image: '/img/local/전남.jpeg', sidoCode: '38' },
  { name: '제주특별자치도', image: '/img/local/제주.jpeg', sidoCode: '39' },
]

const router = useRouter()
const window = ref(0)

// 슬라이드 총 개수 계산 (3개씩 묶었으므로)
const totalSlides = Math.ceil(cities.length / 3)

// 인덱스를 0부터 totalSlides-1 사이로 유지
const normalizeIndex = (index) => {
  return (index + totalSlides) % totalSlides
}

const getThreeItems = (index) => {
  const normalizedIndex = normalizeIndex(index)
  const start = normalizedIndex * 3
  const end = start + 3
  return cities.slice(start, end)
}

const handleClick = (sidoCode) => {
  console.log('handleClick')
  // router.push('/map')
  // 파라미터가 필요한 경우
  router.push({ path: '/map', query: { sidoCode: sidoCode } }) 
}
</script>

<style scoped>
.local-info-container {
  width: 100%;
}

.local-card {
  transition: transform 0.3s ease;
  cursor: pointer;
}

.shadow-card {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.shadow-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.local-card:hover {
  transform: translateY(-5px);
}

.v-carousel {
  border-radius: 8px;
  overflow: hidden;
}

.v-carousel-item {
  padding: 20px;
}

.v-card-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.v-img {
  border-radius: 8px;
}
</style>

