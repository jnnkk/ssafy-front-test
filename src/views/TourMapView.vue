<template>
  <div class="tour-map-container">
    <!-- 지도 영역 (전체 화면) -->
    <div class="map-container">
      <KakaoMap 
        :lat="center.lat" 
        :lng="center.lng" 
        :draggable="true" 
        :level="mapLevel"
        @zoom_changed="handleZoomChange"
        @dragend="handleDragEnd"
        style="width: 100%; height: 100%;"
        @onLoadKakaoMap="onLoadKakaoMap"
      >
        <!-- 현재 페이지의 마커만 표시 -->
        <MapMarker 
          v-for="marker in currentMarkers" 
          :key="marker.attrId"
          :marker="marker"
          :selectedMarker="selectedMarker"
          @marker-click="showPlaceInfo"
        />
      </KakaoMap>
      
      <!-- 검색 사이드바 컴포넌트 -->
      <SearchSidebar 
        :isSidebarCollapsed="isSidebarCollapsed"
        :selectedMarker="selectedMarker"
        :activeTab="sidebarActiveTab"
        :setSido="sidoCodeId"
        @search="handleSearch"
        @select-place="selectPlace"
        @filtered-attractions="handleFilteredAttractions"
        @tab-changed="handleTabChanged"
      />

      <!-- 사이드바 토글 버튼 -->
      <div class="sidebar-toggle" :class="{ 'toggle-collapsed': isSidebarCollapsed }">
        <v-btn 
          icon 
          variant="text" 
          color="primary"
          size="small"
          @click="toggleSidebar"
        >
          <v-icon>{{ isSidebarCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
        </v-btn>
      </div>

      <!-- 지도 컨트롤 버튼 -->
      <div class="map-controls">
        <v-btn icon="mdi-plus" variant="outlined" class="control-btn" @click="zoomIn"></v-btn>
        <v-btn icon="mdi-minus" variant="outlined" class="control-btn" @click="zoomOut"></v-btn>
        <v-btn icon="mdi-crosshairs-gps" variant="outlined" class="control-btn" @click="getCurrentLocation"></v-btn>
      </div>

      <!-- 페이지네이션 -->
      <div class="pagination-container" v-if="totalPages > 1">
        <div class="pagination-info">
          <span class="page-info">
            {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, allMarkers.length) }} / {{ allMarkers.length }}개
          </span>
        </div>
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="5"
          color="primary"
          @update:model-value="onPageChange"
        ></v-pagination>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { KakaoMap } from 'vue3-kakao-maps'
import MapMarker from '@/components/map/MapMarker.vue'
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import SearchSidebar from '@/components/map/SearchSidebar.vue'
import { useAttractionStore } from '@/stores/attractions'
import { useFavoriteStore } from '@/stores/favorites'
import axios from 'axios'

const fetchAttractions = async (keyword, sidoCode, gugunCode, addMode = false) => {
  try {
    const data = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/attractions?sidoCode=${sidoCode}&gugunCode=${gugunCode}&contentType=0`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    })
    
    const attractionStore = useAttractionStore()
    const validData = data.data.value.filter(attraction => attraction.latitude && attraction.longitude)

    if (keyword && keyword.length > 0) {
      if (addMode) {
        attractionStore.addAttractions(validData.filter(attraction => attraction.title.includes(keyword)))
      } else {
        attractionStore.setAttractions(validData.filter(attraction => attraction.title.includes(keyword)))
      }
    } else {
      if (addMode) {
        attractionStore.addAttractions(validData)
      } else {
        attractionStore.setAttractions(validData)
      }
    }

    console.log(validData)
  } catch (error) {
    console.error('관광지 목록 조회 실패', error)
  }
}

const fetchFavoritesUser = async () => {
  try {
    const user = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/users/me`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    })
    
    useFavoriteStore().fetchFavorites(user.data.value.userId)
  } catch (error) {
    console.error('유저 정보 조회 실패', error)
  }
}

// 중심 좌표
const center = ref({ lat: 37.5, lng: 127 })
let bounds;

// 사이드바 상태
const isSidebarCollapsed = ref(false)
const sidebarActiveTab = ref('search')
const selectedMarker = ref(null)

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const selectedPlace = ref(null)
const allMarkers = ref([])
const markersLatLng = ref([])

// 페이지네이션 관련
const currentPage = ref(1)
const itemsPerPage = ref(10)

// 현재 페이지의 마커들만 반환
const currentMarkers = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value
  const endIndex = startIndex + itemsPerPage.value
  return allMarkers.value.slice(startIndex, endIndex)
})

// 전체 페이지 수
const totalPages = computed(() => {
  return Math.ceil(allMarkers.value.length / itemsPerPage.value)
})

// 지도 줌 레벨
const mapLevel = ref(3)
const map = ref(null)

const onLoadKakaoMap = (mapInstance) => {
  map.value = mapInstance
}

// 페이지 변경 시 지도 중심 조정
const updateMapBounds = () => {
  if (currentMarkers.value.length > 0 && map.value) {
    bounds = new kakao.maps.LatLngBounds();
    
    currentMarkers.value.forEach((marker) => {
      const point = new kakao.maps.LatLng(marker.latitude, marker.longitude);
      bounds.extend(point);
    });
    
    map.value.setBounds(bounds);
  }
}

// 페이지 변경 핸들러
const onPageChange = (page) => {
  currentPage.value = page
  setTimeout(() => {
    updateMapBounds()
  }, 100)
}

// 현재 마커가 변경될 때마다 지도 중심 조정
watch(currentMarkers, () => {
  setTimeout(() => {
    updateMapBounds()
  }, 100)
}, { deep: true })

// 검색 처리 함수
const handleSearch = async (keyword, sidoCode, gugunCodeList) => {
  try {
    useAttractionStore().clearAttractions()

    for (const gugunCode of gugunCodeList) {
      await fetchAttractions(keyword, sidoCode, gugunCode.code, true)
    }

    allMarkers.value = useAttractionStore().getAttractions
    markersLatLng.value = allMarkers.value.map(marker => ({ lat: marker.latitude, lng: marker.longitude }))

    // 검색 후 첫 번째 페이지로 이동
    currentPage.value = 1
    
    // 지도 중심 조정
    setTimeout(() => {
      updateMapBounds()
    }, 100)
  } catch (error) {
    console.error('검색 처리 중 오류:', error)
  }
}

const handleFilteredAttractions = (filteredAttractions) => {
  try {
    allMarkers.value = filteredAttractions
    markersLatLng.value = allMarkers.value.map(marker => ({ lat: marker.latitude, lng: marker.longitude }))
    
    // 필터링 후 첫 번째 페이지로 이동
    currentPage.value = 1
    
    // 지도 중심 조정
    setTimeout(() => {
      updateMapBounds()
    }, 100)
  } catch (error) {
    console.error('필터링 처리 중 오류:', error)
  }
}

// 장소 선택 함수 (사이드바에서 선택)
const selectPlace = (place) => {
  selectedPlace.value = place
  selectedMarker.value = place
  
  // 선택된 장소가 현재 페이지에 있는지 확인하고, 없으면 해당 페이지로 이동
  const index = allMarkers.value.findIndex(marker => marker.attrId === place.attrId)
  if (index !== -1) {
    const targetPage = Math.ceil((index + 1) / itemsPerPage.value)
    if (targetPage !== currentPage.value) {
      currentPage.value = targetPage
    }
    
    // 선택된 장소로 지도 중심 이동
    center.value = {
      lat: place.latitude,
      lng: place.longitude
    }
    
    // 상세정보 탭으로 전환
    sidebarActiveTab.value = 'detail'
  }
}

// 마커 클릭 시 장소 정보 표시 함수 (지도에서 마커 클릭)
const showPlaceInfo = (clickedMarkerData) => {
  console.log('마커 클릭 데이터:', clickedMarkerData)
  
  // 클릭된 마커와 일치하는 전체 마커 데이터를 찾기
  const fullMarkerData = allMarkers.value.find(marker => 
    marker.latitude === clickedMarkerData.lat && 
    marker.longitude === clickedMarkerData.lng
  )
  
  if (fullMarkerData) {
    selectedPlace.value = fullMarkerData
    selectedMarker.value = fullMarkerData
    
    console.log('선택된 마커:', fullMarkerData.title)
    console.log('탭 변경 전:', sidebarActiveTab.value)
    
    // 상세정보 탭으로 전환
    sidebarActiveTab.value = 'detail'
    
    console.log('탭 변경 후:', sidebarActiveTab.value)
    
    // 사이드바가 접혀있다면 펼치기
    if (isSidebarCollapsed.value) {
      isSidebarCollapsed.value = false
    }
    
    // 다음 틱에서 탭 상태 확인
    setTimeout(() => {
      console.log('최종 탭 상태:', sidebarActiveTab.value)
    }, 100)
  } else {
    console.error('마커 데이터를 찾을 수 없습니다:', clickedMarkerData)
  }
}

// 사이드바 탭 변경 핸들러
const handleTabChanged = (tab) => {
  console.log('부모에서 탭 변경 수신:', tab)
  sidebarActiveTab.value = tab
}

// 지도 컨트롤 함수
const zoomIn = () => {
  mapLevel.value = Math.max(1, mapLevel.value - 1)
}

const zoomOut = () => {
  mapLevel.value = Math.min(14, mapLevel.value + 1)
}

const getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        center.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      },
      (error) => {
        console.error('위치 정보를 가져오는데 실패했습니다:', error)
      }
    )
  }
}

// 지도 이벤트 핸들러
const handleZoomChange = (level) => {
  mapLevel.value = level
}

const handleDragEnd = (map) => {
  const position = map.getCenter()
  center.value = {
    lat: position.getLat(),
    lng: position.getLng()
  }
}

const route = useRoute()
const sidoCodeId = ref('')

onMounted(() => {
  // 초기 위치 설정 (서울 시청)
  center.value = { lat: 37.566826, lng: 126.9786567 }
  fetchFavoritesUser()

  const sidoCode = route.query.sidoCode

  if (sidoCode) {
    sidoCodeId.value = sidoCode
  }
})
</script>

<style scoped>
.tour-map-container {
  position: relative;
  width: 100%;
  height: 90vh;
  overflow: hidden;
}

/* 지도 영역 스타일 - 전체 화면 차지 */
.map-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.kakao-map {
  width: 100%;
  height: 100%;
}

/* 페이지네이션 컨테이너 */
.pagination-container {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  padding: 6px 12px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 250px;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-info {
  font-size: 0.75rem;
  color: #666;
  font-weight: 500;
}

/* 사이드바가 접힌 상태에서도 페이지네이션 위치 유지 */

/* 검색 사이드바 스타일 - 지도 위에 올라옴 */
.search-sidebar {
  position: absolute;
  top: 0;
  left: 0;
  width: 450px;
  height: 100%;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sidebar-collapsed {
  width: 0;
  overflow: hidden;
}

.search-input-container {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.search-results-container {
  flex: 1;
  overflow-y: auto;
}

.results-list {
  padding: 8px;
}

.result-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
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

/* 사이드바 토글 버튼 - 사이드바 외부에 부착 */
.sidebar-toggle {
  position: absolute;
  top: 50%;
  left: 450px;
  transform: translateY(-50%);
  z-index: 11;
  transition: all 0.3s ease;
  background-color: white;
  border-radius: 0 8px 8px 0;
  box-shadow: 3px 0 5px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
}

/* 사이드바가 접힌 상태일 때 토글 버튼 위치 */
.toggle-collapsed {
  left: 0;
}

/* 장소 상세 정보 카드 스타일 */
.place-detail-card {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 350px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 5;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.card-content {
  padding: 16px;
}

.place-details {
  margin: 12px 0;
}

.place-description {
  margin-top: 8px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

/* 지도 컨트롤 버튼 스타일 */
.map-controls {
  position: absolute;
  right: 20px;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.control-btn {
  background-color: white !important;
}

/* 카테고리 필터 스타일 */
.category-filters {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: white;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .pagination-container {
    min-width: 200px;
    padding: 4px 10px;
  }
  
  .page-info {
    font-size: 0.7rem;
  }
}
</style>