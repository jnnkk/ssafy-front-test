// URL 쿼리스트링에서 id 값을 가져오는 함수
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  
  // localStorage에서 게시글 목록 가져오기
  function getPosts() {
    return JSON.parse(localStorage.getItem('posts')) || [];
  }
  
  function renderPostDetail() {
    const postId = getQueryParam('id');
    const posts = getPosts();
    const post = posts.find(p => p.id == postId);
    const postDetailDiv = document.getElementById('postDetail');
    
    if (!post) {
      postDetailDiv.innerHTML = '<p>게시글을 찾을 수 없습니다.</p>';
      return;
    }
    
    postDetailDiv.innerHTML = `
      <div class="post-title">${post.title}</div>
      <div class="post-meta">
        작성자: ${post.writer} | 작성시간: ${new Date(post.timestamp).toLocaleString()} | 좋아요: ${post.likes}
      </div>
      <div class="post-content">
        ${post.content}
      </div>
    `;
  }
  
  renderPostDetail();