<template>
  <div class="search-sidebar" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <v-divider></v-divider>
    <!-- 탭 영역 추가 -->
    <v-tabs
      v-model="internalActiveTab"
      color="primary"
      align-tabs="center"
      @update:model-value="onTabChange"
    >
      <v-tab value="search">
        <v-icon>mdi-magnify</v-icon> 검색
      </v-tab>
      <v-tab value="detail">
        <v-icon>mdi-information-outline</v-icon> 상세정보
      </v-tab>
    </v-tabs>
    <v-tabs-window v-model="internalActiveTab" class="tabs-window">
      <v-tabs-window-item value="search" class="tab-content">
        <!-- 검색 입력 영역 -->
        <div class="input-container">
          <v-text-field
            v-model="searchKeyword"
            placeholder="관광지, 문화시설, 축제, 숙박 검색"
            variant="outlined"
            density="compact"
            hide-details
            prepend-inner-icon="mdi-magnify"
            class="search-input"
            @keyup.enter="searchPlaces"
          ></v-text-field>
        </div>

        <div class="d-flex ga-5 input-container">
          <!-- 장소 필터링 시/도, 구/군 드롭다운으로 구성-->
          <v-select
            v-model="selectedSido"
            :items="sidos"
            item-title="name"
            item-value="code"
            label="시/도"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-map-marker-radius"
            hide-details
            style="width: 200px; flex: 0 0 auto;"
          >
          </v-select>

          <v-select
            v-model="selectedGuguns"
            :items="guguns"
            item-title="name"
            item-value="code"
            label="구/군"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-map-marker-radius"
            multiple
            hide-details
            return-object
            :disabled="selectedSido.length === 0 || selectedSido.includes('0')"
            style="width: 200px; flex: 0 0 auto;"
            class="selection-ellipsis"
          >
            <template v-slot:selection="{  }">
              {{ getGugunName(selectedGuguns) }}
            </template>
          </v-select>
        </div>

        <div class="d-flex justify-center">
          <!-- 검색 버튼 -->
          <v-btn
            color="primary"
            :ripple="false"
            class="search-btn"
            elevation="2"
            rounded="lg"
            @click="searchPlaces"
          >
            <v-icon left class="me-1">mdi-magnify</v-icon>
            검색
          </v-btn>
        </div>
        <!-- 카테고리 필터, 마우스로 드래그 가능 -->
        <div class="category-filters">
          <v-chip-group 
            v-model="selectedCategories" 
            multiple
            show-arrows
            class="custom-arrows"
          >
            <v-chip :filter="true" :value="12" class="fixed-width-chip">관광지</v-chip>
            <v-chip :filter="true" :value="14" class="fixed-width-chip">문화시설</v-chip>
            <v-chip :filter="true" :value="15" class="fixed-width-chip">축제</v-chip>
            <v-chip :filter="true" :value="28" class="fixed-width-chip">레포츠</v-chip>
            <v-chip :filter="true" :value="32" class="fixed-width-chip">숙박</v-chip>
            <v-chip :filter="true" :value="38" class="fixed-width-chip">쇼핑</v-chip>
            <v-chip :filter="true" :value="39" class="fixed-width-chip">음식점</v-chip>
          </v-chip-group>
        </div>

        <!-- 검색 결과 목록 -->
        <SearchResults 
          @select-place="selectPlace"
          :category-filter="selectedCategories"
          class="search_results flex-1"
          @filtered-attractions="handleFilteredAttractions"
        />
      </v-tabs-window-item>

      <!-- 상세정보 탭 콘텐츠 -->
      <v-tabs-window-item value="detail" class="tab-content">
        <div v-if="props.selectedMarker" class="detail-container">
          <div class="detail-header d-flex flex-column">
            <v-img
              v-if="props.selectedMarker.firstImage1"
              :src="props.selectedMarker.firstImage1"
              height="200"
              cover
              class="rounded-t"
            ></v-img>
            <v-img
              v-else
              :src="dummyImage(props.selectedMarker.attrId)"
              height="200"
              cover
              class="rounded-t"
            ></v-img>
            <div class="detail-title-section">
              <h2 class="detail-title">{{ props.selectedMarker.title }}</h2>
              <div class="d-flex align-center justify-space-between">
                <v-chip 
                  :color="getCategoryColor(props.selectedMarker.contentTypeId)"
                  size="small"
                  class="mt-2"
                >
                  {{ getCategoryName(props.selectedMarker.contentTypeId) }}
                </v-chip>
                <!-- 추천수 표시 및 추천 토글 -->
                <v-btn
                  :color="isRecommendMarker ? 'primary' : 'grey'"
                  :variant="isRecommendMarker ? 'flat' : 'outlined'"
                  size="small"
                  @click="toggleRecommend"
                  class="recommend-btn mt-2"
                >
                  <v-icon small>{{ isRecommendMarker ? 'mdi-thumb-up' : 'mdi-thumb-up-outline' }}</v-icon>
                  {{ props.selectedMarker.recommend || 0 }}
                </v-btn>
              </div>
            </div>
          </div>
          
          <div class="detail-info">
            <v-list>
              <v-list-item v-if="props.selectedMarker.addr1">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-map-marker</v-icon>
                </template>
                <v-list-item-title>주소</v-list-item-title>
                <v-list-item-subtitle>{{ props.selectedMarker.addr1 }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item v-if="props.selectedMarker.tel">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-phone</v-icon>
                </template>
                <v-list-item-title>전화번호</v-list-item-title>
                <v-list-item-subtitle>{{ props.selectedMarker.tel }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item v-if="props.selectedMarker.zipcode">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-mailbox</v-icon>
                </template>
                <v-list-item-title>우편번호</v-list-item-title>
                <v-list-item-subtitle>{{ props.selectedMarker.zipcode }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-map</v-icon>
                </template>
                <v-list-item-title>위치</v-list-item-title>
                <v-list-item-subtitle>
                  위도: {{ props.selectedMarker.latitude?.toFixed(6) }}, 
                  경도: {{ props.selectedMarker.longitude?.toFixed(6) }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item v-if="props.selectedMarker.homepage"> 
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-web</v-icon>
                </template>
                <v-list-item-title>사이트</v-list-item-title>
                <v-list-item-subtitle>
                  <div v-html="props.selectedMarker.homepage"></div>
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item v-if="props.selectedMarker.overview">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-text-box-outline</v-icon>
                </template>
                <v-list-item-title>설명</v-list-item-title>
                <v-list-item-subtitle
                  style="height: 100px; overflow-y: auto;"  
                >
                  {{ props.selectedMarker.overview }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            
            <div class="detail-actions">
              <v-btn 
                color="primary" 
                prepend-icon="mdi-directions" 
                block 
                class="mb-2"
                @click="openDirections"
              >
                길찾기
              </v-btn>
              <v-btn 
                color="secondary" 
                prepend-icon="mdi-heart" 
                variant="outlined" 
                block
                class="mb-2"
                @click="toggleFavorite"
                :class="{ 'favorite': isFavorite }"
              >
                즐겨찾기
              </v-btn>
              <v-btn 
                color="primary" 
                prepend-icon="mdi-lightbulb-alert-outline" 
                variant="outlined" 
                block
                class="mb-2"
                @click="askAi"
                :loading="isLoading"
              >
                AI 추천 장소
              </v-btn>
            </div>
            
            <!-- 추천 관광지 캐러셀 영역 -->
            <div v-if="recommendedPlaces.length > 0" class="recommended-places mt-4">
              <div class="recommended-header d-flex align-center mb-2">
                <v-icon color="primary" class="me-2">mdi-lightbulb-on</v-icon>
                <h3 class="text-h6 mb-0">AI 추천 장소</h3>
              </div>
              
              <v-carousel
                show-arrows="hover"
                height="280"
                hide-delimiter-background
                delimiter-icon="mdi-circle-small"
                class="rounded-lg"
              >
                <v-carousel-item
                  v-for="(place, i) in recommendedPlaces"
                  :key="i"
                  @click="selectRecommendedPlace(place)"
                >
                  <v-card class="mx-2 h-100 recommendation-card" variant="outlined">
                    <v-img
                      :src="place.firstImage1 || '/public/img/noimage.jpeg'"
                      height="150"
                      cover
                      class="align-end"
                    >
                      <v-chip
                        :color="getCategoryColor(place.contentTypeId)"
                        size="small"
                        class="ma-2"
                      >
                        {{ getCategoryName(place.contentTypeId) }}
                      </v-chip>
                    </v-img>
                    
                    <v-card-title class="text-subtitle-1 pb-1">
                      {{ place.title }}
                    </v-card-title>
                    
                    <v-card-subtitle class="pb-0 d-flex align-center">
                      <v-icon size="small" class="me-1">mdi-map-marker</v-icon>
                      <span class="text-truncate">{{ place.addr1 }}</span>
                    </v-card-subtitle>
                    
                    <v-card-text class="pt-2">
                      <p class="text-caption text-grey recommend-reason">
                        <v-icon size="small" color="amber-darken-2" class="me-1">mdi-star</v-icon>
                        {{ place.recommendReason || '이 장소와 유사한 관광지입니다.' }}
                      </p>
                    </v-card-text>
                  </v-card>
                </v-carousel-item>
              </v-carousel>
            </div>
          </div>
        </div>
        <div v-else class="detail-placeholder">
          <v-icon size="64" color="grey lighten-1">mdi-map-marker-question</v-icon>
          <p class="text-center text-grey mt-4">지도에서 장소를 선택하면<br>상세정보가 표시됩니다.</p>
        </div>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, computed, onMounted } from 'vue'
import SearchResults from '@/components/map/SearchResults.vue'
import axios from 'axios'
import { useFavoriteStore } from '@/stores/favorites'
import { dummyImage } from '@/assets/js/dummyImage'

const props = defineProps({
  isSidebarCollapsed: {
    type: Boolean,
    default: false
  },
  selectedMarker: {
    type: Object,
    default: null
  },
  activeTab: {
    type: String,
    default: 'search'
  },
  setSido: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['search', 'select-place', 'category-filter', 'filtered-attractions', 'tab-changed'])

const sidos = [
  { name: '서울', code: '1' },
  { name: '인천', code: '2' },
  { name: '대전', code: '3' },
  { name: '대구', code: '4' },
  { name: '광주', code: '5' },
  { name: '부산', code: '6' },
  { name: '울산', code: '7' },
  { name: '세종특별자치시', code: '8' },
  { name: '경기도', code: '31' },
  { name: '강원특별자치도', code: '32' },
  { name: '충청북도', code: '33' },
  { name: '충청남도', code: '34' },
  { name: '경상북도', code: '35' },
  { name: '경상남도', code: '36' },
  { name: '전북특별자치도', code: '37' },
  { name: '전라남도', code: '38' },
  { name: '제주도', code: '39' }
]

const searchKeyword = ref('')
const searchKeywordForSearch = ref('')
const selectedCategories = ref([])
const selectedSido = ref([])
const guguns = ref([])
const selectedGuguns = ref([])
const userRecommendList = ref([])

// AI 추천 관련 상태 변수 추가
const recommendedPlaces = ref([])
const isLoading = ref(false)
const user = ref(null)

// 내부 탭 상태 관리
const internalActiveTab = ref('search')

// props의 activeTab 변경을 watch로 감지하여 내부 상태 업데이트
watch(() => props.activeTab, (newTab, oldTab) => {
  console.log('SearchSidebar 탭 변경:', oldTab, '->', newTab)
  console.log('selectedMarker 존재 여부:', !!props.selectedMarker)
  console.log('탭 disabled 상태:', !props.selectedMarker)
  internalActiveTab.value = newTab
}, { immediate: true })

watch(() => props.selectedMarker, (newMarker) => {
  console.log('SearchSidebar selectedMarker 변경:', newMarker?.title || 'null')
  console.log('selectedMarker 전체 데이터:', newMarker)
  
  // 새로운 장소가 선택되면 추천 목록 초기화
  recommendedPlaces.value = []
})

watch(() => props.setSido, (newSido) => {
  console.log('SearchSidebar sidoCode 변경:', newSido)
  selectedSido.value = [newSido]
})

// isIRecommend 대신 isRecommendMarker로 통일
const isRecommendMarker = computed(() => {
  if (!props.selectedMarker || !userRecommendList.value) return false;
  return userRecommendList.value.some(recommend => recommend.attrId === props.selectedMarker.attrId);
})

// 토글 함수 수정
const toggleRecommend = async () => {
  if (!user.value || !props.selectedMarker) {
    console.warn('사용자 정보 또는 선택된 장소 정보가 없습니다.');
    return;
  }

  try {
    console.log('토글 전 추천 상태:', isRecommendMarker.value);
    
    if (!isRecommendMarker.value) {
      // 추천하지 않은 상태 -> 추천 추가
      const addResponse = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/recommends`, {
        userId: user.value.userId,
        attrId: props.selectedMarker.attrId,
      });
      console.log('추천 추가 응답:', addResponse.data);
    } else {
      // 이미 추천한 상태 -> 추천 삭제
      const deleteResponse = await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/recommends`, {
        data: {
          userId: user.value.userId,
          attrId: props.selectedMarker.attrId,
        }
      });
      console.log('추천 삭제 응답:', deleteResponse.data);
    }
    
    // 추천 목록 새로고침
    await fetchRecommendList();
    
    // 현재 선택된 장소의 추천 수 업데이트
    const countResponse = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/recommends/${props.selectedMarker.attrId}`);
    console.log('추천 수 조회 응답:', countResponse.data);
    
    // 상태 업데이트 - 응답 구조에 따라 적절히 수정
    if (countResponse.data && typeof countResponse.data.value !== 'undefined') {
      props.selectedMarker.recommend = countResponse.data.value;
    } else if (typeof countResponse.data === 'number') {
      props.selectedMarker.recommend = countResponse.data;
    }
    
    console.log('토글 후 추천 상태:', isRecommendMarker.value);
    console.log('업데이트된 추천 수:', props.selectedMarker.recommend);
    
  } catch (error) {
    console.error('추천 토글 실패:', error);
    alert('추천 기능 처리 중 오류가 발생했습니다.');
  }
}

// 추천 목록 조회 함수 개선
const fetchRecommendList = async () => {
  if (!user.value) {
    console.warn('사용자 정보가 없어 추천 목록을 조회할 수 없습니다.');
    return;
  }
  
  try {
    const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/recommends`, {
      params: {
        userId: user.value.userId
      }
    });
    
    console.log('추천 목록 응답:', response.data);
    
    // 응답 구조에 따라 적절히 처리
    if (response.data && response.data.value) {
      userRecommendList.value = response.data.value;
    } else if (Array.isArray(response.data)) {
      userRecommendList.value = response.data;
    } else {
      console.warn('예상치 못한 응답 형식:', response.data);
      userRecommendList.value = [];
    }
    
  } catch (error) {
    console.error('추천 목록 조회 오류:', error);
    userRecommendList.value = [];
  }
}

// 탭 변경 핸들러
const onTabChange = (tab) => {
  console.log('탭 변경 요청:', tab)
  console.log('현재 selectedMarker:', props.selectedMarker?.title || 'null')
  
  if (tab === 'detail' && !props.selectedMarker) {
    console.warn('상세정보 탭으로 변경하려 했지만 selectedMarker가 없습니다!')
    return
  }
  
  internalActiveTab.value = tab  // 내부 상태 즉시 업데이트
  emit('tab-changed', tab)
  
  console.log('최종 internalActiveTab:', internalActiveTab.value)
}

// 카테고리별 색상 반환
const getCategoryColor = (contentTypeId) => {
  const colors = {
    12: 'green',      // 관광지
    14: 'blue',       // 문화시설
    15: 'purple',     // 축제
    25: 'orange',     // 여행코스
    28: 'red',        // 레포츠
    32: 'teal',       // 숙박
    38: 'pink',       // 쇼핑
    39: 'amber'       // 음식점
  }
  return colors[contentTypeId] || 'grey'
}

// 카테고리명 반환
const getCategoryName = (contentTypeId) => {
  const categories = {
    12: '관광지',
    14: '문화시설',
    15: '축제/공연/행사',
    25: '여행코스',
    28: '레포츠',
    32: '숙박',
    38: '쇼핑',
    39: '음식점'
  }
  return categories[contentTypeId] || '기타'
}

// 길찾기 기능
const openDirections = () => {
  if (props.selectedMarker) {
    const { latitude, longitude } = props.selectedMarker
    const url = `https://map.kakao.com/link/to/${props.selectedMarker.title},${latitude},${longitude}`
    window.open(url, '_blank')
  }
}

// 즐겨찾기 기능 (추후 구현)
const toggleFavorite = async () => {
  const user = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/users/me`)

  // TODO: 즐겨찾기 기능 구현
  console.log('즐겨찾기 토글:', props.selectedMarker?.title)
  console.log('즐겨찾기 상태:', isFavorite.value)
  console.log('즐겨찾기 전체 데이터:', useFavoriteStore().getFavorites)
  if (isFavorite.value) {
    await deleteFavorites(user.data.value.userId, props.selectedMarker.attrId)
  } else {
    await addFavorites(user.data.value.userId, props.selectedMarker.attrId, props.selectedMarker)
  }
}

const isFavorite = computed(() => {
  return useFavoriteStore().getFavorites.some(fav => fav.attrId === props.selectedMarker?.attrId)
})

// 즐겨찾기 추가 AJAX 요청
const addFavorites = async (userId, attrId, attraction) => {
  const res = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/favorites`, {
    userId: userId,
    attrId: attrId,
    attraction: attraction
  })
  console.log(res)
  useFavoriteStore().fetchFavorites(userId)
}

// 즐겨찾기 삭제 AJAX 요청
const deleteFavorites = async (userId, attrId) => {
  const res = await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/favorites?userId=${userId}&attrId=${attrId}`)
  console.log(res)
  useFavoriteStore().fetchFavorites(userId)
}

// 시/도 선택 시 해당 지역의 구/군 목록을 가져오는 함수
const fetchGuguns = async (sidoCode) => {
  if (sidoCode === '0') {
    guguns.value = []
    return
  }

  try {
    const { data } = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/guguns?sidoCode=${selectedSido.value}`)
    
    guguns.value = data.value.map(g => ({
      name: g.gugunName,
      code: g.gugunCode
    }))
  } catch (error) {
    console.error('구/군 목록 조회 실패', error)
  }
}

// AI 추천 장소 요청 함수 - 수정된 부분
const askAi = async () => {
  if (!props.selectedMarker || !props.selectedMarker.attrId) {
    console.error('선택된 관광지 정보가 없습니다.')
    return
  }
  
  isLoading.value = true
  try {
    console.log('AI 추천 장소 요청:', props.selectedMarker.title)
    const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/ai/recommend?attrId=${props.selectedMarker.attrId}`)
    
    console.log(response.data.value)
    // 서버에서 받아온 추천 장소 데이터 저장
    if (response.data && response.data.value) {
      for (let i = 0; i < response.data.value.length; i++) {

        const attraction = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/attractions/${response.data.value[i].id}`)
        attraction.data.value.overview = response.data.value[i].overview
        recommendedPlaces.value.push(attraction.data.value)
      }
      console.log('추천 장소 데이터:', recommendedPlaces.value)
    } else {
      console.warn('추천 장소 데이터가 없습니다.')
      recommendedPlaces.value = []
    }
  } catch (error) {
    console.error('AI 추천 장소 조회 실패', error)
    alert('AI 추천 장소 조회에 실패했습니다...')
    recommendedPlaces.value = []
  } finally {
    isLoading.value = false
  }
}

// 추천 장소 선택 시 해당 장소로 이동
const selectRecommendedPlace = (place) => {
  emit('select-place', place)
}

// 시/도 선택 변경 감지
watch(selectedSido, (newVal) => {
  selectedGuguns.value = []
  if (newVal.length > 0) {
    fetchGuguns(newVal)
  } else {
    guguns.value = []
  }
})

watch(selectedCategories, (newVal) => {
  emit('category-filter', newVal)
})

const handleFilteredAttractions = (filteredAttractions) => {
  emit('filtered-attractions', filteredAttractions)
}

const getGugunName = (selectedGuguns) => {
  if (selectedGuguns.length === 1) return `${selectedGuguns[0].name}`
  return `${selectedGuguns[0].name} 외 ${selectedGuguns.length - 1}개`
}

const searchPlaces = () => {
  searchKeywordForSearch.value = searchKeyword.value.trim()
  emit('search', searchKeywordForSearch.value, selectedSido.value, selectedGuguns.value)
}

// 장소 선택
const selectPlace = (place) => {
  emit('select-place', place)
}

onMounted(async () => {
  user.value = JSON.parse(sessionStorage.getItem('loginUser'))
  await fetchRecommendList()
})
</script>

<style scoped>
.search-sidebar {
  position: absolute;
  top: 0;
  left: 0;
  width: 500px;
  height: 100%;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

/* 탭 윈도우와 탭 콘텐츠 스타일 */
.tabs-window {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

.tab-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.sidebar-collapsed {
  width: 0;
  overflow: hidden;
}

.input-container {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.detail-container {
  height: 100%;
  overflow-y: auto;
}

.detail-header {
  position: relative;
}

.detail-title-section {
  padding: 16px;
  background: white;
}

.detail-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.4;
}

.detail-info {
  padding: 0 16px 16px;
}

.detail-actions {
  margin-top: 24px;
  padding: 16px;
  border-top: 1px solid #eee;
}

.detail-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.no-image-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 8px 8px 0 0;
}

.selection-ellipsis :deep(.v-field__input) {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 40px;
}

.fixed-width-chip {
  width: 110px !important;
  justify-content: center;
  text-align: center;
}

.fixed-width-chip :deep(.v-chip__filter) {
  position: absolute !important;
  right: 8px;
}

.custom-arrows :deep(.v-slide-group__prev),
.custom-arrows :deep(.v-slide-group__next) {
  min-width: 28px !important;
  padding: 0 !important;
}

.custom-arrows :deep(.v-slide-group__prev .v-icon),
.custom-arrows :deep(.v-slide-group__next .v-icon) {
  font-size: 18px !important;
}

.custom-arrows :deep(.v-slide-group__content) {
  margin-left: 4px;
  margin-right: 4px;
}

.search-btn {
  width: 90%;
  height: 44px;
  margin: 12px 0;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s ease;
  border: none !important;
  background: linear-gradient(135deg, #4f7bf8, #3b68e8) !important;
  color: white !important;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
  background: linear-gradient(135deg, #5d87ff, #4772f8) !important;
}

.search-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1) !important;
}

.search-btn .v-icon {
  font-size: 18px;
}

.search_results {
  flex: 1;
  height: 100%;
  overflow-y: auto;
}

.favorite {
  /** 즐겨찾기 버튼, 즐겨찾기 되어 있으면 빨간색으로 */
  color: red !important;
}

:deep(.v-field__field) {
  display: flex;
  align-items: center;
}

/* 추천 관광지 스타일 */
.recommended-places {
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.recommended-header {
  margin-bottom: 12px;
}

.recommend-reason {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.recommendation-card {
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  transition: border 0.3s ease, box-shadow 0.3s ease;
}

.recommendation-card:hover {
  border: 2px solid #4f7bf8;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}
</style>