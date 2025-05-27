// 예: 현재 로그인된 사용자 정보를 localStorage에 저장했다고 가정
// 예시: localStorage.setItem("user", JSON.stringify({ userid: "홍길동" }));

const POSTS_PER_PAGE = 5;
let currentPage = 1;

// 글쓰기 폼 토글
const openFormBtn = document.getElementById('openFormBtn');
const postForm = document.getElementById('postForm');
let formVisible = false;
openFormBtn.addEventListener('click', () => {
  formVisible = !formVisible;
  postForm.style.display = formVisible ? 'block' : 'none';
});

// 페이지 로드 시 현재 사용자 userid를 글쓴이 입력란에 설정 (읽기 전용으로 설정하면 HTML에서도 처리)
document.addEventListener('DOMContentLoaded', () => {
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const currentUserId = userData.userid || "";
  document.getElementById('writer').value = currentUserId;
});

// 로컬 스토리지에서 게시글 가져오기
function getPosts() {
  return JSON.parse(localStorage.getItem('posts')) || [];
}

// 로컬 스토리지에 게시글 저장
function savePosts(posts) {
  localStorage.setItem('posts', JSON.stringify(posts));
}

// 게시글 테이블 렌더링
function renderPosts() {
  const postList = document.getElementById('postList');
  const posts = getPosts();  // 로컬 스토리지에서 posts 배열 불러오는 함수
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE) || 1;
  
  // 현재 페이지가 총 페이지 수보다 크면 보정
  if (currentPage > totalPages) currentPage = totalPages;
  
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const postsToDisplay = posts.slice(startIndex, endIndex);
  
  // localStorage의 "user"에서 현재 userid 가져오기
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const currentUserId = userData.userid || "";
  
  postList.innerHTML = '';
  
  postsToDisplay.forEach((post, i) => {
    const realIndex = startIndex + i + 1;
    let deleteBtnHTML = '';
  
    // 게시글의 writer와 현재 userid가 같으면 삭제 버튼 표시
    if (post.writer === currentUserId && currentUserId !== "") {
      deleteBtnHTML = `<button class="delete-btn" data-delete-id="${post.id}">삭제</button>`;
    }
  
    // 제목 클릭 시 상세 페이지로 이동 (쿼리스트링에 id를 포함)
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${realIndex}</td>
      <td><a href="notice-board-view.html?id=${post.id}">${post.title}</a></td>
      <td>${post.writer}</td>
      <td>${new Date(post.timestamp).toLocaleString()}</td>
      <td>
        <span style="cursor:pointer; color:#007BFF;" data-like-id="${post.id}">
          ${post.likes}
        </span>
      </td>
      <td>
        ${deleteBtnHTML}
      </td>
    `;
    postList.appendChild(tr);
  });
  
  renderPagination(posts.length);
}

// 페이지네이션 렌더링
function renderPagination(totalPosts) {
  const pagination = document.getElementById('pagination');
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE) || 1;
  pagination.innerHTML = '';

  if (totalPages <= 1) return;
  
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '이전';
  prevBtn.disabled = (currentPage === 1);
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderPosts();
    }
  });
  pagination.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    if (i === currentPage) {
      pageBtn.classList.add('active');
    }
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      renderPosts();
    });
    pagination.appendChild(pageBtn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '다음';
  nextBtn.disabled = (currentPage === totalPages);
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderPosts();
    }
  });
  pagination.appendChild(nextBtn);
}

// 글쓰기 폼 제출 처리
postForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  // 글쓴이 입력란 대신 localStorage에서 현재 userid 사용
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const currentUserId = userData.userid || "";
  const content = document.getElementById('content').value.trim();
  
  if (!title || !currentUserId || !content) return;

  const posts = getPosts();
  const newPost = {
    id: Date.now() + Math.random(),
    title,
    writer: currentUserId, // localStorage의 userid 사용
    content,
    timestamp: Date.now(),
    likes: 0
  };
  posts.push(newPost);
  savePosts(posts);

  postForm.reset();
  // 글쓰기 폼 재노출 시, 글쓴이 칸에 다시 userid를 채워넣음
  document.getElementById('writer').value = currentUserId;
  postForm.style.display = 'none';
  formVisible = false;
  currentPage = 1;
  renderPosts();
});

// 좋아요 및 삭제 이벤트 (이벤트 위임)
document.getElementById('postList').addEventListener('click', (e) => {
  const likeId = e.target.dataset.likeId;
  const deleteId = e.target.dataset.deleteId;
  let posts = getPosts();

  if (likeId) {
    const idx = posts.findIndex(p => p.id == likeId);
    if (idx !== -1) {
      posts[idx].likes += 1;
      savePosts(posts);
      renderPosts();
    }
  }

  if (deleteId) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    posts = posts.filter(p => p.id != deleteId);
    savePosts(posts);
    renderPosts();
  }
});

renderPosts();
