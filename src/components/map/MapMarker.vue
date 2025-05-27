<template>
  <KakaoMapMarker
    :lat="marker.latitude"
    :lng="marker.longitude"
    :image="markerImage"
    :clickable="true"
    @onClickKakaoMapMarker="onMarkerClick"
  />
  <KakaoMapCustomOverlay
    :key="marker.attrId + '-overlay'"
    :lat="marker.latitude" 
    :lng="marker.longitude" 
    :content="content" 
    :visible="isSelected"
    :yAnchor="2.2" 
  />
</template>

<script setup>
import { computed } from 'vue';
import { KakaoMapMarker, KakaoMapCustomOverlay } from 'vue3-kakao-maps';

// Props
const props = defineProps({
  marker: {
    type: Object,
    required: true
  },
  selectedMarker: {
    type: Object,
    default: null
  }
});

// 현재 마커가 선택된 마커인지 확인
const isSelected = computed(() => {
  // selectedMarker가 null이 아니고, 현재 마커의 attrId와 일치하는지 확인
  return props.selectedMarker && props.marker.attrId === props.selectedMarker.attrId;
});

// 선택된 마커 이미지 설정 (크기 증가 및 효과 추가)
const markerImage = computed(() => {
  // 기본 마커 이미지 설정 - 선택된 마커는 더 크게
  const imageSize = isSelected.value
    ? { imageWidth: 80, imageHeight: 80 }
    : { imageWidth: 60, imageHeight: 60 };
  
  // contentTypeId에 따라 다른 이미지 사용
  let imageSrc;
  switch (props.marker.contentTypeId) {
    case 12: // 관광지
      imageSrc = '/src/assets/img/travel_marker.png';
      break;
    case 14: // 문화시설
      imageSrc = '/src/assets/img/culture_marker.png';
      break;
    case 15: // 축제/공연/행사
      imageSrc = '/src/assets/img/festival_marker.png';
      break;
    case 25: // 여행코스
      imageSrc = '/src/assets/img/food_marker.png';
      break;
    case 28: // 레포츠
      imageSrc = '/src/assets/img/activity_marker.png';
      break;
    case 32: // 숙박
      imageSrc = '/src/assets/img/bed_marker.png';
      break;
    case 38: // 쇼핑
      imageSrc = '/src/assets/img/shopping_marker.png';
      break;
    case 39: // 음식점
      imageSrc = '/src/assets/img/food_marker.png';
      break;
    default:
      // 기본 마커 이미지
      return null; // null을 반환하면 기본 마커 사용
  }
  
  // 마커 이미지 객체 생성
  return {
    imageSrc: imageSrc,
    imageWidth: imageSize.imageWidth,
    imageHeight: imageSize.imageHeight,
    imageOption: {}
  };
});

// 마커 클릭 시 부모로 이벤트 emit
const emit = defineEmits(['marker-click']);
function onMarkerClick() {
  console.log('마커 클릭:', props.marker.title);
  emit('marker-click', {
    lat: props.marker.latitude,
    lng: props.marker.longitude,
    contentTypeId: props.marker.contentTypeId,
    contentID: props.marker.contentID,
    title: props.marker.title,
    attrId: props.marker.attrId
  });
}

// 오버레이 내용 생성
const content = computed(() => {
  const categoryColors = {
    12: '#4CAF50', // 관광지 - 녹색
    14: '#2196F3', // 문화시설 - 파란색
    15: '#9C27B0', // 축제 - 보라색
    25: '#FF9800', // 여행코스 - 주황색
    28: '#F44336', // 레포츠 - 빨간색
    32: '#009688', // 숙박 - 청록색
    38: '#E91E63', // 쇼핑 - 분홍색
    39: '#FF9800'  // 음식점 - 주황색
  };
  
  const categoryColor = categoryColors[props.marker.contentTypeId] || '#757575';
  
  return `
    <div class="custom-overlay">
      <div class="overlay-title" style="background-color: ${categoryColor};">
        <span>${props.marker.title}</span>
      </div>
      <div class="overlay-content">
        <p class="overlay-address">${props.marker.addr1 || '주소 정보 없음'}</p>
        <div class="overlay-arrow"></div>
      </div>
    </div>
  `;
});
</script>

<style>
/* 글로벌 스타일로 설정해야 오버레이에 적용됩니다 */
.custom-overlay {
  position: relative;
  width: auto;
  min-width: 150px;
  max-width: 250px;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  background: white;
  font-family: 'Noto Sans KR', sans-serif;
  animation: fadeIn 0.3s ease-out;
}

.overlay-title {
  color: white;
  padding: 8px 12px;
  font-weight: 500;
  font-size: 14px;
  border-radius: 6px 6px 0 0;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
}

.overlay-content {
  padding: 8px 12px;
  position: relative;
}

.overlay-address {
  color: #333;
  font-size: 12px;
  margin: 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.overlay-arrow {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid white;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>