// 맵 생성 하기
const container = document.getElementById('map') //지도를 담을 영역의 DOM 레퍼런스
const options = {
  //지도를 생성할 때 필요한 기본 옵션
  center: new kakao.maps.LatLng(37.579668, 126.9772127), //지도의 중심좌표. 37.579668,126.9772127
  level: 3, //지도의 레벨(확대, 축소 정도)
}

const map = new kakao.maps.Map(container, options) //지도 생성 및 객체 리턴

// 지도에 표시된 마커 객체를 가지고 있을 배열입니다
const markers = []

// 조회한 어트랙션 리스트
const attractionList = []

// 마커 클러스터러를 생성합니다
const clusterer = new kakao.maps.MarkerClusterer({
  map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체
  averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정
  minLevel: 3, // 클러스터 할 최소 지도 레벨
})

/* *************************************************************************** */

// 관광지 디테일 설정
const searchDetailContent = async (contentid) => {
  let detail
  try {
    document.querySelector('#info-contatiner').innerHTML =
      `<div class="my-5 spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                                                                    <span class="visually-hidden">Loading...</span>
                                                                </div>`
    /*
		for (i = 0; i < attractionList.length; i++) {
			if (attractionList[i].contentId == contentid) {
				detail = attractionList[i];	// 디테일 항목 불러오기
				break;
			}
		}
		*/

    detail = binarySearch(attractionList, contentid)
    console.log('detail : ' + detail)

    // 홈페이지 설정
    const detailHomePage = detail.homepage || '홈페이지가 없어용'
    console.log(detail)

    // 세부항목 내부 요소 설정
    const innerDetail = `<div id="favorite" class="d-flex justify-content-center align-items-center position-absolute end-0 rounded bg-gradient" style="width: 15%; aspect-ratio: 1;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="80%" height="80%" fill="white" class="bi bi-star" viewBox="0 0 16 16">
                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" width="80%" height="80%" fill="yellow" class="bi bi-star-fill visually-hidden" viewBox="0 0 16 16">
                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                </svg>
                            </div>
                            <img id='landmarkImg' src="${detail.firstImage1 || '/img/noimage.jpeg'}" alt="관광지 이미지" class="mb-3 img-fluid rounded object-fit-cover">
                            <div id="landmarkInfo" class="col-md-12">
                                <ul class="list-group">
                                    <li id='landmarkURL' class="list-group-item overflow-hidden">${detailHomePage}</li>
                                    <li id='landmarkName' class="list-group-item"><strong>관광지 명: </strong>${detail.title}</li>
                                    <li id='landmarkAddress' class="list-group-item"><strong>주소: </strong>${detail.addr1}</li>
                                    <li class="list-group-item">${detail.overview || '상세 내용이 없어요...'}</li>
                                </ul>
                            </div>`

    // 즐겨찾기 내부에 같은게 있으면 별 칠하기
    document.querySelector('#info-contatiner').innerHTML = innerDetail

    // /favorites (GET) 요청
    const favoriteList = await apiFetch(`${root}/favorites`, {
      params: { userId: `${loginUserId}` },
    })
    if (favoriteList.value.some((item) => item.attrId === detail.no)) {
      document
        .querySelector('#favorite')
        .querySelector('svg.bi-star')
        .classList.add('visually-hidden')
      document
        .querySelector('#favorite')
        .querySelector('svg.bi-star-fill')
        .classList.remove('visually-hidden')
    }

    document.getElementById('tour-info').style.display = 'block'
    document.getElementById('toggle-info-btn').innerHTML = '<' // 버튼 모양 변경
  } catch (e) {
    console.log(e)
    alert('에러다~에러~~이요요요옷')
  }

  document.getElementById('favorite').addEventListener('click', function () {
    // 첫 번째 svg: outline 별 (보이는 상태)
    const starOutline = this.querySelector('svg.bi-star')
    // 두 번째 svg: 채워진 별 (처음엔 숨겨진 상태; "visually-hidden" 클래스가 있음)
    const starFill = this.querySelector('svg.bi-star-fill')

    starOutline.classList.toggle('visually-hidden')
    starFill.classList.toggle('visually-hidden')

    // 토스트
    if (starOutline.classList.contains('visually-hidden')) {
      const toastEl = document.getElementById('liveToast')
      const toast = new bootstrap.Toast(toastEl) // 옵션({ delay: 5000, autohide: true })를 설정해도 됨
      toast.show()

      // 즐겨찾기에 추가
      apiFetch(`${root}/favorites`, {
        method: 'POST',
        body: { userId: `${loginUserId}`, attrId: detail.no },
      })
    } else {
      apiFetch(`${root}/favorites`, {
        method: 'DELETE',
        params: { userId: `${loginUserId}`, attrId: detail.no },
      })
    }
  })
}

// 컨텐츠 타입 별 이미지 선택 (매개변수 : 컨텐츠 타입 id)
const contentTypeChecker = (contentTypeId) => {
  if (contentTypeId) {
    switch (contentTypeId) {
      case 12:
        return '/img/travel_marker.svg' // 관광지
      case 14:
        return '/img/culture_marker.svg' // 문화시설
      case 15:
        return '/img/festival_marker.svg' // 행사/공연/축제
      case 25:
        return '/img/course_marker.svg' // 여행코스
      case 28:
        return '/img/activity_marker.svg' // 레포츠
      case 32:
        return '/img/bed_marker.svg' // 숙박
      case 38:
        return '/img/shopping_marker.svg' // 쇼핑
      case 39:
        return '/img/food_marker.svg' // 음식점
    }
  }
  return '/img/travel_marker.svg' // 기본값은 관광지
}

// 마커 만들기 유틸
// 마커로 찍기 (경도, 위도, 컨텐츠 타입, 컨텐츠 아이디)
const makeMarker = (lat, lng, contentTypeId, contentID) => {
  const imageSrc = contentTypeChecker(contentTypeId), // 마커이미지의 주소입니다
    imageSize = new kakao.maps.Size(32, 35), // 마커이미지의 크기입니다
    imageOption = { offset: new kakao.maps.Point(27, 69) } // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.

  // 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
  const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption)

  // 마커 생성
  const marker = new kakao.maps.Marker({
    map: map,
    position: new kakao.maps.LatLng(lat, lng),
    image: markerImage,
    title: contentID,
  })

  // 마커에 click 이벤트를 등록합니다
  kakao.maps.event.addListener(marker, 'click', (e) => {
    // alert('마커를 클릭했습니다! ' + marker.getTitle());
    searchDetailContent(marker.getTitle()) // 클릭시 세부사항 설정
  })

  return marker
}

// 컨텐츠 이분탐색 메서드
const binarySearch = (arr, target) => {
  let left = 0
  let right = arr.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)

    if (arr[mid].contentId == target) return arr[mid]
    else if (arr[mid].contentId < target) left = mid + 1
    else right = mid - 1
  }

  return -1 // 못 찾았을 때
}

/* *************************************************************************** */

// 맵에 마커 생성
document.querySelector('#btn_trip_search').addEventListener('click', async (e) => {
  const sidoCode = document.querySelector('#areaCode').value
  const gugunCode = document.querySelector('#sigunguCode').value
  const contentType = document.querySelector('#contentType').value

  let attractionJson
  // 유효성 검사
  if (sidoCode === '' || gugunCode === '') {
    alert('지역 값을 모두 입력해주세요!')
  } else if (contentType === '') {
    attractionJson = await apiFetch(`${root}/attractions`, {
      params: { sidoCode: sidoCode, gugunCode: gugunCode, contentType: 0 },
    })
  } else {
    attractionJson = await apiFetch(`${root}/attractions`, {
      params: { sidoCode: sidoCode, gugunCode: gugunCode, contentType: contentType },
    })
  }

  clusterer.clear() // 클러스터 초기화

  attractionList.length = 0 // 어트랙션 리스트 초기화

  attractionJson.value.forEach((obj) => {
    attractionList.push(obj)
  })

  attractionList.sort((a, b) => a.contentId - b.contentId) // 이분탐색을 위한 정렬

  console.log('관광지조회(attractionList) :')
  console.log(attractionList)

  markers.forEach((marker) => {
    marker.setMap(null) // 마커 비활성화
  })

  if (attractionList.length === 0) {
    alert('해당 하는 정보가 없습니다...ㅠㅠ')
    return
  }

  markers.length = 0 // 마커 초기화

  attractionList.forEach((obj) => {
    // 마커 추가
    markers.push(makeMarker(obj.latitude, obj.longitude, obj.contentTypeId, obj.contentId))
  })

  console.log('마커 조회(markers) :')
  console.log(markers)

  const bounds = new kakao.maps.LatLngBounds() // 경계 지정

  markers.forEach((marker) => {
    marker.setMap(map) // 마커 활성화
    bounds.extend(marker.getPosition())
  })

  map.setBounds(bounds) // 경계 활성화

  clusterer.addMarkers(markers) // 클러스터 활성화
})

// 시도 선택시 발생하는 이벤트 -> ajax로 Server에게 요청 보내서 구군 얻어오기
document.querySelector('#areaCode').addEventListener('change', async (e) => {
  const gugunList = await apiFetch(`${root}/guguns`, { params: { sidoCode: e.target.value } })
  const gugunSelect = document.querySelector('#sigunguCode')

  gugunSelect.length = 1 // 기존 옵션 초기화 (시군구 선택만 남김)

  gugunList.value.forEach((item) => {
    // select에 option 넣기
    const option = document.createElement('option')
    option.value = item.gugunCode
    option.textContent = item.gugunName
    gugunSelect.appendChild(option)
  })
})

document.addEventListener('DOMContentLoaded', async () => {
  // 여기에 초기 실행 코드 작성
  const sidoList = await apiFetch(`${root}/sidos`)
  const sidoSelect = document.querySelector('#areaCode')

  sidoSelect.length = 1 // 기존 옵션 초기화

  sidoList.value.forEach((item) => {
    // select에 option 넣기
    const option = document.createElement('option')
    option.value = item.sidoCode
    option.textContent = item.sidoName
    sidoSelect.appendChild(option)
  })
})
