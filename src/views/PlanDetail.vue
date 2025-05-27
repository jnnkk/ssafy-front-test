<template>
  <div class="plan-detail-container">
    <!-- 1) 좌측: 지도 + 제목 오버레이 -->
    <div class="map-container">
      <div class = "map-title">
        <button class = "btn-edit" @click = "goBack()">뒤로가기</button>
        <h1 class="plan-title">제목 : {{ planDetail.title }}</h1>
        <h1></h1>
      </div>
      <KakaoMap
        :lat="center.lat"
        :lng="center.lng"
        :draggable="true"
        :level="mapLevel"
        :width="'100%'"
        :height="'100%'"
        @ready="onMapReady"
        @zoom_changed="handleZoomChange"
        @dragend="handleDragEnd"
        
      >
        <KakaoMapPolyline
          v-for="(chunk, idx) in latLngList"
          :key="idx"
          :lat-lng-list="chunk"
          :end-arrow="true"
          :stroke-color="colors[idx]"
          :stroke-opacity="0.8"
          :stroke-weight="8"
         
        />
        <KakaoMapMarker
          v-for="(m, i) in allMarkers"
          :key="i"
          :lat="m.lat"
          :lng="m.lng"
          :title="m.title"
          :order="i+1"
          :info-window="infoWindow[i]"
          :image="{
            imageSrc:
              i === 0
                ? 'https://enjoytrip123-bucket.s3.ap-southeast-2.amazonaws.com/startMarker.png'
                : i === allMarkers.length - 1
                ? 'https://enjoytrip123-bucket.s3.ap-southeast-2.amazonaws.com/endMarker.png'
                : 'https://enjoytrip123-bucket.s3.ap-southeast-2.amazonaws.com/locationMarker.png',
            imageWidth: 64,
            imageHeight: 64,
          }"
           @mouseOverKakaoMapMarker="mouseOverKakaoMapMarker(i)"
           @mouseOutKakaoMapMarker="mouseOutKakaoMapMarker(i)"
        />
      </KakaoMap>
    </div>
    <!-- 2) 우측: 경로 테이블 + 설명 + 기간 -->
    <div class="info-panel">
      <div class = "info-start">
        <h1 class="info-title">일정 순서</h1>
      </div>
      <div class = "info-btn">
            <button v-show="canEdit" @click="goEdit" class="btn-edit">수정</button>
      </div>
    <div class="timeline-wrapper">
      <!-- table 대신 카드 리스트 -->
       
    <ul ref="routeList" class="route-list timeline"  @wheel.prevent="onWheel">
        <li
          v-for="p in routeDetails"
          :key="p.order"
          class="route-card timeline-card"
        >
          <!-- 순위: p.order -->
          <div class="route-rank">{{ p.order }}</div>

          <!-- 썸네일: p.attrImage or 기본 이미지 -->
          <img
            class="route-thumb"
            :src="p.attrImage || defaultImage"
            :alt="p.attrTitle"
          />

          <!-- 제목 -->
          <div class="route-text">{{ p.attrTitle }}</div>
        </li>
      </ul>
      </div>
    <!-- 일정 설명 & 기간은 그대로 -->
      <div class="plan-description">
        <h4>일정 내용</h4>
        <p>{{ planDetail.content }}</p>
      </div>
      <div class="plan-period">
        <h4>일정 기간</h4>
        <p>{{ formatDate(planDetail.startDate) }}
          ~ {{ formatDate(planDetail.endDate) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRoute , useRouter } from 'vue-router'
import { KakaoMap, KakaoMapPolyline,  KakaoMapMarker  } from 'vue3-kakao-maps'
import defaultImg from '@/assets/noImage.avif'
const route    = useRoute()
const planId   = route.params.id

const router = useRouter();

// --- 기존 refs ---
const latLngList  = ref([])
const center = ref({ lat: 37.5665, lng: 126.9780 })
const mapLevel    = ref(5)
const mapInstance = ref(null)
const routes      = ref([])
const coordinates = ref([])
const selectedPlace = ref(null)
const routeList = ref(null)
const loginUser = ref({});
const canEdit = computed(() => planDetail.value.userId === loginUser.value.userId);

const routeDetails = ref([])
const visibleRef = ref([]);
const infoWindow = ref([])
const sectionLength = ref([])

// ② 휠 이벤트 핸들러
function goEdit() {
  router.push({
    name: 'PlanCreate',
    query: { mode: 'edit', planId }
  });
}

function onWheel(e) {
  const container = routeList.value
  if (!container) return

  // 첫 카드의 너비 + 오른쪽 margin 만큼 한 칸씩 이동
  const card = container.querySelector('.route-card')
  if (!card) return
  const style     = getComputedStyle(card)
  const gap       = parseInt(style.marginRight)  || 0
  const moveBy    = card.offsetWidth + gap

  // deltaY > 0 이면 아래로 스크롤 → 다음 카드(오른쪽), 아니면 이전 카드(왼쪽)
  const direction = e.deltaY > 0 ? 1 : -1
  container.scrollBy({ left: moveBy * direction, behavior: 'smooth' })
}
const colors = [
  '#FF5733', // 선명한 주황
  '#33FF57', // 연두빛
  '#3357FF', // 푸른색
  '#FF33A8', // 핫핑크
  '#A833FF', // 보라색
  '#33FFF0', // 민트빛
  '#33FF57', // 노란빛
  '#FF3333', // 빨강
  '#33FF8A', // 연두-민트
  '#8A33FF'  // 진보라
];



// --- 새로 추가한 일정 메타 정보 ---
const planDetail = ref({
  title:     '',
  content:   '',
  startDate: '',
  endDate:   '',
  userId: '',
})

// 마커 데이터
const allMarkers = computed(() => {
  if (!routes.value.length || !coordinates.value.length) return []
  return routes.value.map((item, i) => ({
    lat: coordinates.value[i].lat,
    lng: coordinates.value[i].lng,
    title: item.planName || item.planDetail || '장소',
    description: item.planDetail || ''
  }))
})

// API 인스턴스

const kakaoApi = axios.create({
  baseURL: 'https://apis-navi.kakaomobility.com',
  headers: {
    'Authorization': `KakaoAK ${import.meta.env.VITE_APP_KAKAO_REST_KEY}`,
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  }
})


const mouseOverKakaoMapMarker = (i) => {
  infoWindow.value[i].visible = true
};

const mouseOutKakaoMapMarker = (i) => {
  infoWindow.value[i].visible = false
};
function goBack(){
  router.back();
}
// 1) 플랜 메타 + 경로/좌표 동시 조회
async function fetchPlanAndCoords() {
  try {
    // 0) 초기화
    routeDetails.value = []
    coordinates.value = []
    loginUser.value = JSON.parse(sessionStorage.getItem('loginUser'));
    // 1) 플랜 메타
    const { data: { value: plan } } = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/plans/${planId}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    })
    planDetail.value = {
      userId: plan.userId,
      title:     plan.planName,
      content:   plan.planDetail,
      startDate: plan.startDate,
      endDate:   plan.endDate
    }

    // 2) 경로 목록
    const { data: { value: rts } } = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/plans/${planId}/routes`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    })
     routes.value = rts
    // 3) 각 route마다 어트랙션 정보 가져오고, routeDetails & coordinates 채우기
    for (const rt of rts) {
      const { data: { value: attr } } = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/attractions/${rt.attrId}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        }
      })

      // a) routeDetails 에 순서·ID·타이틀·이미지 담기
      routeDetails.value.push({
        order:     rt.order,
        attrId:    rt.attrId,
        attrTitle: attr.title,
        attrImage: attr.firstImage1 || defaultImg
      })
      infoWindow.value.push({
        content: attr.title,
        visible: false
      })
      visibleRef.value.push({
        visible : false
      })
      // b) coordinates 에 좌표 담기 (폴리라인용)
      coordinates.value.push({
        order : rt.order,
        lat: attr.latitude,
        lng: attr.longitude
      })
    }

    // 4) order 순으로 정렬
    routeDetails.value.sort((a, b) => a.order - b.order)
    coordinates.value.sort((a,b) => a.order - b.order )
    console.log(routeDetails.value);
    // 5) 맵 센터 및 레벨 설정
    if (coordinates.value.length) {
      const mid = Math.floor(coordinates.value.length / 2)
      center.value  = coordinates.value[mid]
      mapLevel.value = 8
    }
    
    console.log('✅ routeDetails:', routeDetails.value)
    console.log('✅ coordinates:',   coordinates.value)
  } catch (err) {
    console.error(err)
  }
}

const defaultImage = defaultImg



// 2) Polyline 그리기 (기존 drawRoutePolyline 로직)
async function drawRoutePolyline() {
  const map = mapInstance.value
  console.log(mapInstance.value);
  try {
   const first = coordinates.value[0];
  const last  = coordinates.value[coordinates.value.length - 1];

  const origin = {
    x: first.lng.toString(),
    y: first.lat.toString(),    // 필요에 따라 동적으로 계산하거나 하드코딩
  };

  const destination = {
    x: last.lng.toString(),
    y: last.lat.toString()
  };

  // 2) 최대 5개까지 경유지 배열 만들기
  const waypoints = coordinates.value
    .slice(1, -1)           // 첫/마지막 제외
    .slice(0, coordinates.value.length-1)            // 최대 5개
    .map((c) => ({
      x: c.lng,
      y: c.lat
    }));

  console.log(origin, destination, waypoints);
    console.log(origin, destination, waypoints)
    const { data } = await kakaoApi.post(
      '/v1/waypoints/directions',
      { origin, destination, waypoints, priority: "DISTANCE" }
    );

    const { sections } = data.routes[0];

    // 1) 각 구간 거리 배열
    const distances = sections.map(section => section.distance);
    const totalDistance = distances.reduce((sum, d) => sum + d, 0);

    // 2) 전체 좌표 path 추출
    const path = sections.flatMap(section =>
      section.roads.flatMap(road => {
        const coords = [];
        for (let i = 0; i < road.vertexes.length; i += 2) {
          coords.push({ lat: road.vertexes[i + 1], lng: road.vertexes[i] });
        }
        return coords;
      })
    );

    // 3) 비율에 따른 포인트 개수 계산
    const totalPoints = path.length;
    let cursor = 0;
    const grouped = distances.map((dist, idx) => {
      // round 해서 각 구간에 할당할 개수
      const count = Math.round(totalPoints * dist / totalDistance);
      const slice = path.slice(cursor, cursor + count);
      cursor += count;
      return slice;
    });

    // 남은 포인트가 있으면 마지막 그룹에 합치기
    if (cursor < totalPoints) {
      grouped[grouped.length - 1] = grouped[grouped.length - 1]
        .concat(path.slice(cursor));
    }

    // 4) 값 업데이트
    latLngList.value = grouped;
    console.log(latLngList.value);

  } catch (e) {
    console.error('폴리라인 그리기 중 오류', e);
  }
}

// 3) 맵 이벤트 핸들러들
function onMapReady(map) { mapInstance.value = map }
function handleZoomChange({ level }) { mapLevel.value = level }
function handleDragEnd({ center: c }) { center.value = { lat: c.getLat(), lng: c.getLng() } }
function showPlaceInfo(m) { selectedPlace.value = m }

// 날짜 포맷 헬퍼
function formatDate(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
}

onMounted(async () => {
  await fetchPlanAndCoords()
  await drawRoutePolyline()
})
</script>

<style scoped>
.plan-detail-container {
  display: flex;
  align-items: center;    /* map-container, info-panel 을 수직 중앙 정렬 */
  width: 100%;
  height: 80vh;
}

.map-container {
  display: flex;
    width: 50%;
    height: 100%;
    justify-content: center;
    flex-direction: column;
}

.map-title{
  display:flex;
  justify-content: space-between;
}

.plan-title {
  display:flex;  
  padding: 4px 8px;
  background: rgba(255,255,255,0.8);
  border-radius: 4px;
  z-index: 5;
  text-align: center;
}

.info-panel {
  width: 100%;
  height: 100%;
  min-width:50vw;
  max-width: 400px;
  
  margin-top: 2rem;
  padding: 1rem;
  box-sizing: border-box;
  
  border-radius: 8px;
}

/* 리스트 → 카드 형태 */
.timeline-wrapper {
  width: 100%;              /* 부모 넓이에 딱 맞추고 */
  overflow-x: auto;         /* 가로 스크롤 ON */
  position: relative;       /* 절대 위치 자식 없더라도 안전하게 */
  /* scroll-snap 을 wrapper 에도 걸어도 됩니다: */
  scroll-snap-type: x mandatory;
   padding: 3rem 1rem; 
}
.route-list {
    display: flex;
  /* 1) 컨테이너 폭을 최소 부모 폭만큼 확보하고, */
  width: max-content;
  flex-direction: row;  /* 세로 방향으로 쌓기 */
  gap: 1rem;
  max-height: 60vh;       /* 필요에 따라 높이 조정 */
  overflow-x: auto;        /* 세로 스크롤 */
  overflow-y: hidden;      /* 가로 스크롤 차단 */
  padding: 0;
  margin: 0 0 1rem 0;
   scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch; 
}
.timeline {
  display: flex;
  position: relative;
  align-items: center;
  gap: 2rem;
  overflow-x: auto;
  padding: 3rem 1rem;          /* 위아래 여유 */
  scroll-snap-type: x mandatory;
}
.timeline::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background-color: #3498db;
  transform: translateY(-50%);
  z-index: 0;
}

/* 2) 카드 공통 */
.timeline-card {
  position: relative;
  flex: 0 0 auto;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  padding: 1rem;
  width: 280px;
  height: 300px;
  z-index: 1;
}

/* 3) 홀짝마다 위/아래로 배치 */
.timeline-card:nth-child(odd) {
  align-self: flex-start;       /* 축 위로 */
  margin-bottom: 6rem;          /* 축과 약간 간격 */
}
.timeline-card:nth-child(even) {
  align-self: flex-end;         /* 축 아래로 */
  margin-top:  6rem;
}

/* 4) 카드 내부 스타일 (기존에서 조금 조정) */
.route-rank {
  font-weight: bold;
  margin-bottom: 2rem;
}
.route-thumb {
  width: 100%;
  height: 220px; 
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}
.route-text {
  text-align: center;
 font-size: 1.2rem; 
}

/* 설명/기간 스타일은 기존과 동일 */
.plan-description,
.plan-period {
  margin-top: 1rem;
}
.plan-description h4,
.plan-period h4 {
  font-size: 1.5rem; /* 제목 크기 */
  margin-bottom: 0.5rem;
}
.plan-description p,
.plan-period p {
  font-size: 1.125rem; /* 본문 텍스트 크기 */
  line-height: 1.6;
}
.btn-edit {
  margin-top: 8px;
  padding: 6px 12px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.info-start{
  display : flex;
  flex-direction: row;
  justify-content: center;

}
.info-btn{
  display: flex;
  justify-content: flex-end;
}
</style>