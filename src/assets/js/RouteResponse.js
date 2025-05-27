/**
 * @typedef RouteResponse
 * @type {object}
 * @property {string} trans_id - 경로 요청 ID
 * @property {Route[]} routes - 경로 정보 배열
 * @property {number} result_code - 경로 탐색 결과 코드
 * @property {string} result_msg - 경로 탐색 결과 메시지
 * @property {Summary} summary - 경로 요약 정보
 * @property {LocationInfo} origin - 출발지 정보
 * @property {LocationInfo} destination - 목적지 정보
 * @property {Waypoint[]} waypoints - 경유지 정보 배열
 * @property {string} priority - 경로 탐색 우선순위 옵션
 * @property {Bound} [bound] - 전체 경로 바운딩 박스 (선택)
 * @property {Fare} fare - 요금 정보
 * @property {number} distance - 전체 검색 결과 거리(미터)
 * @property {number} duration - 목적지까지 소요 시간(초)
 * @property {Section[]} sections - 구간별 경로 정보 배열
 */

/**
 * @typedef Summary
 * @property {number} distance - 총 이동 거리(미터)
 * @property {number} duration - 총 이동 시간(초)
 */

/**
 * @typedef LocationInfo
 * @property {string} name - 장소 이름
 * @property {number} x - X 좌표(경도)
 * @property {number} y - Y 좌표(위도)
 */

/**
 * @typedef Waypoint
 * @property {string} name - 경유지 이름
 * @property {number} x - X 좌표(경도)
 * @property {number} y - Y 좌표(위도)
 */

/**
 * @typedef Bound
 * @property {number} min_x - 바운딩 박스 왼쪽 하단 X
 * @property {number} min_y - 바운딩 박스 왼쪽 하단 Y
 * @property {number} max_x - 바운딩 박스 오른쪽 상단 X
 * @property {number} max_y - 바운딩 박스 오른쪽 상단 Y
 */

/**
 * @typedef Fare
 * @property {number} taxi - 택시 요금(원)
 * @property {number} toll - 통행 요금(원)
 */

/**
 * @typedef Section
 * @property {number} distance - 섹션 거리(미터)
 * @property {number} duration - 섹션 소요 시간(초)
 * @property {Bound} [bound] - 섹션 바운딩 박스 (옵션)
 * @property {Road[]} [roads] - 도로 정보 배열 (옵션)
 */

/**
 * @typedef Road
 * @property {string} name - 도로명
 * @property {number} distance - 도로 길이(미터)
 * @property {number} duration - 예상 이동 시간(초)
 * @property {number} traffic_speed - 현재 교통 속도(km/h)
 * @property {number} traffic_state - 현재 교통 상태 (정수 코드)
 * @property {number[]} vertexes - X, Y 좌표 쌍이 반복되는 1차원 배열
 * @property {Guide[]} [guides] - 안내 정보 배열 (옵션)
 */

/**
 * @typedef Guide
 * @property {string} name - 명칭
 * @property {number} x - X 좌표(경도)
 * @property {number} y - Y 좌표(위도)
 * @property {number} distance - 이전 가이드 지점부터 거리(미터)
 * @property {number} duration - 이전 가이드 지점부터 시간(초)
 * @property {number} type - 안내 타입 (정수 코드)
 * @property {string} guidance - 안내 문구
 * @property {number} road_index - 링크된 도로 인덱스
 */
