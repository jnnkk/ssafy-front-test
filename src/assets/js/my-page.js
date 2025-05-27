

document.getElementById("card-container").addEventListener("click", (e) => {
  if (e.target.classList.contains("star")) {
    handleStarClick(e); // 위 함수 재사용
  }
});

// 페이지 로드 시 실행되는 함수
document.addEventListener('DOMContentLoaded', async () => {
	console.log("로그인 유저 id : ", loginUserId);
  // 사용자가 로그인되어 있지 않으면 처리 중단
  if (loginUserId === null || loginUserId === "") {
    console.log('로그인된 사용자가 없습니다...');
    document.getElementById('card-container').innerHTML = '<div class="col-12 text-center"><h3>로그인 후 이용해주세요...</h3></div>';
    return;
  }
  
  // AJAX로 favorites 가져오기
  const favorites = await apiFetch(`${root}/favorites/${loginUserId}`, {
		method:"GET"
	});
  console.log("favorites : ", favorites.value);
  // 즐겨찾기 데이터가 없으면 처리 중단
  if (!favorites.value || favorites.value.length === 0) {
    console.log('즐겨찾기 데이터가 없습니다.');
    document.getElementById('card-container').innerHTML = '<div class="col-12 text-center fade-in"><h3>즐겨찾기한 관광지가 없습니다...</h3></div>';
    return;
  }
 
  // 카드 컨테이너 요소 가져오기
  const cardContainer = document.getElementById('card-container');
  
  // 기존 카드 제거
  cardContainer.innerHTML = '';
  
  // 즐겨찾기 데이터를 기반으로 카드 생성
  favorites.value.forEach(async (item) => {
	console.log("잘 가져왔습니다!: "+item.attraction.no)
    const favoriteDetailSum = await apiFetch(`${root}/attractions/${item.attraction.no}`);
	const favoriteDetail = favoriteDetailSum.value;
	console.log("잘 가져옴 : "+favoriteDetail.no)
    const cardHTML = `
      <div class="col">
        <div class="card h-100 shadow-sm">
          <img class="card-img" src="${favoriteDetail.firstImage2 || './static/img/noimage.jpeg'}" alt="${item.title || '관광지 이미지'}">
          <ul class="list-group list-group-flush">
            <li class="list-group-item">${favoriteDetail.title || '관광지 이름'}</li>
            <li class="list-group-item">${favoriteDetail.addr1 || '관광지 주소'}</li>
			<li class="list-group-item">${favoriteDetail.homepage || '관광지 사이트가 없습니다...'}</li>
          </ul>
          <div class="card-body d-flex flex-column justify-content-between">
            <p class="card-text">${favoriteDetail.overview || '관광지 설명이 없습니다...'}</p>
            <div class="d-flex justify-content-between">
              <div class="btn-group">
                <button type="button" id="${favoriteDetail.no}" class="star starclick btn btn-sm btn-outline-secondary" data-id="${favoriteDetail.no}">★ | 즐겨찾기 해제</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // DOM에 삽입 후 리스너 바로 추가
    cardContainer.insertAdjacentHTML("beforeend", cardHTML);

    const lastStar = cardContainer.querySelector(`.star[data-id="${favoriteDetail.no}"]`);
    lastStar.addEventListener("click", handleStarClick);
  });
});

function handleStarClick(e) {
  console.log("⭐ 클릭!");
  e.target.classList.toggle("starclick");
  e.target.classList.toggle("starunclick");

  const itemId = e.target.getAttribute('id');
  const cardElement = e.target.closest('.col');

  if (e.target.classList.contains("starclick")) {
    e.target.innerHTML = "★ | 즐겨찾기 해제";
  } else {
    if (cardElement) {
      cardElement.style.transition = 'opacity 0.5s ease';
      cardElement.style.opacity = '0';
      setTimeout(() => {
        cardElement.remove();
        removeFavorite(itemId, false);
        checkEmptyContainer();
      }, 500);
    } else {
      removeFavorite(itemId, false);
    }
  }
}

// 카드 컨테이너가 비어있는지 확인하고 메시지 표시
function checkEmptyContainer() {
  const cardContainer = document.getElementById('card-container');
  if (cardContainer.children.length === 0) {
    cardContainer.innerHTML = '<div class="col-12 text-center fade-in"><h3>즐겨찾기한 관광지가 없습니다.</h3></div>';
  }
}

// 즐겨찾기 항목 제거 함수
async function removeFavorite(itemId, shouldReload = true) {

	// 해당 ID를 가진 항목 찾기 및 제거
	await apiFetch(`${root}/favorites/${itemId}`, {method:"DELETE"});
	
	
	// shouldReload가 true인 경우에만 페이지 새로고침
	if (shouldReload) {
	  location.reload();
	}
}