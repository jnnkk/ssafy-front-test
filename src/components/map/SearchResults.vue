<template>
  <div class="search-results-container">
    <!-- 정렬 버튼 섹션 추가 -->
    <div class="sort-buttons-container d-flex align-center justify-space-between">
      <div class="sort-buttons">
        <button 
          v-for="option in sortOptions" 
          :key="option.value"
          :class="['sort-button', { active: currentSort === option.value }]"
          @click="sortAttractions(option.value)"
        >
          <span class="sort-icon">{{ option.icon }}</span>
          {{ option.label }}
        </button>
      </div>
      <v-btn
        color="white"
        :ripple="false"
        class="sort-direction-btn"
        elevation="3"
        rounded="pill"
        :class="{ 'sort-asc': sortDirection === 'ascending' }"
        @click="toggleSortDirection"
        min-width="48"
        height="48"
      >
        <div class="btn-content">
          <v-icon 
            :icon="sortDirection === 'descending' ? 'mdi-sort-descending' : 'mdi-sort-ascending'"
            size="20"
            class="sort-icon"
          ></v-icon>
        </div>
        
        <v-slide-y-transition>
          <div class="pulse-effect" v-if="pulseEffect"></div>
        </v-slide-y-transition>
      </v-btn>
    </div>

    <div class="results-list">
      <div 
        v-for="(place, index) in sortedAttractions" 
        :key="index" 
        class="result-item" 
        @click="selectPlace(place)"
      >
        <div class="place-info">
          <h3>{{ place.title }}</h3>
          <p class="place-category">{{ place.category }}</p>
          <p class="place-address">{{ place.addr1 }}</p>
        </div>
        <div class="recommend-info">
          <span class="recommend-count">👍 {{ place.recommend || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAttractionStore } from '@/stores/attractions'
import { ref, watch, computed } from 'vue'

const emit = defineEmits(['select-place', 'filtered-attractions'])

const props = defineProps({
  categoryFilter: {
    type: Array,
    default: () => []
  }
})

const attractions = ref([])
const currentSort = ref('default') // 기본 정렬 상태
const sortDirection = ref('ascending') // 정렬 방향
const pulseEffect = ref(false)

// 정렬 옵션 (아이콘은 이모지 사용)
const sortOptions = [
  { label: '이름순', value: 'name', icon: '🔤' },
  { label: '좋아요순', value: 'recommend', icon: '⭐' },
]

// 필터링된 목록에 정렬 적용 (computed 속성으로 변경)
const sortedAttractions = computed(() => {
  if (!attractions.value || attractions.value.length === 0) return []
  
  const sorted = [...attractions.value] // 원본 배열 복사
  
  switch (currentSort.value) {
    case 'name':
      return sorted.sort((a, b) => {
        return a.title.localeCompare(b.title, 'ko') * (sortDirection.value === 'ascending' ? 1 : -1)
      })
    case 'recommend':
      return sorted.sort((a, b) => {
        // 좋아요순 정렬 로직 수정 (괄호 위치 오류 수정)
        const aCount = a.recommend || 0
        const bCount = b.recommend || 0
        return (bCount - aCount) * (sortDirection.value === 'ascending' ? 1 : -1)
      })
    default:
      return sorted
  }
})

// 관광지 목록 변경 감지
watch(() => useAttractionStore().getAttractions, (newAttractions) => {
  attractions.value = newAttractions
}, { immediate: true })

// 카테고리 필터링 -> 선택된 카테고리만 출력
watch(() => props.categoryFilter, (newCategoryFilter) => {
  if (newCategoryFilter.length > 0) {
    attractions.value = useAttractionStore().getAttractions.filter(place => 
      newCategoryFilter.includes(place.contentTypeId)
    )
  } else {
    attractions.value = useAttractionStore().getAttractions
  }
  // sortedAttractions는 computed 속성으로 자동 업데이트됨
  emit('filtered-attractions', sortedAttractions.value)
}, { immediate: true })

// 정렬 기능 구현
const sortAttractions = (sortType) => {
  currentSort.value = sortType
  // sortedAttractions는 computed 속성으로 자동 업데이트됨
  emit('filtered-attractions', sortedAttractions.value)
}

const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === 'ascending' ? 'descending' : 'ascending'
  
  // 펄스 효과 적용
  pulseEffect.value = true
  setTimeout(() => {
    pulseEffect.value = false
  }, 300)
  
  // sortedAttractions는 computed 속성으로 자동 업데이트됨
  emit('filtered-attractions', sortedAttractions.value)
}

// 정렬 상태 변경 감지하여 펄스 효과 적용
watch(sortDirection, () => {
  pulseEffect.value = true
  setTimeout(() => {
    pulseEffect.value = false
  }, 300)
})

const selectPlace = (place) => {
  emit('select-place', place)
}
</script>

<style scoped>
.search-results-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 정렬 버튼 스타일링 */
.sort-buttons-container {
  display: flex;
  padding: 12px 8px;
  gap: 8px;
  overflow-x: auto;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eaeaea;
}

.sort-buttons {
  display: flex;
  gap: 8px;
}

.sort-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: none;
  border-radius: 20px;
  background-color: white;
  color: #555;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
}

.sort-button:hover {
  background-color: #f0f0f0;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
}

.sort-button.active {
  background-color: #4a6bff;
  color: white;
  box-shadow: 0 3px 8px rgba(74, 107, 255, 0.3);
}

.sort-icon {
  font-size: 1rem;
}

.results-list {
  padding: 8px;
  flex: 1;
  overflow-y: auto;
}

.result-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: space-between;
}

.result-item:hover {
  background-color: #f5f5f5;
}

.place-category {
  font-size: 0.8rem;
  color: #666;
  margin: 4px 0;
}

.place-address {
  font-size: 0.9rem;
  color: #333;
}

.place-info {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sort-direction-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  position: relative;
  z-index: 2;
}

.sort-icon {
  transition: transform 0.3s ease;
}

.sort-asc .sort-icon {
  transform: scale(1.1);
}

.sort-text {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.recommend-info {
  flex-shrink: 0;
  margin-left: 15px;
}

.recommend-count {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: bold;
}

/* 펄스 효과 */
.pulse-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
  transform: translate(-50%, -50%) scale(0);
  animation: pulse 0.4s ease-out forwards;
  z-index: 1;
  pointer-events: none;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.7;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}
</style>