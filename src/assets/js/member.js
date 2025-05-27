document.addEventListener('DOMContentLoaded', function() {
    // localStorage에서 사용자 정보를 불러옵니다.
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert("로그인이 필요합니다.");
      window.location.href = "login.html";
      return;
    }
    // 폼 필드에 기존 회원정보를 채웁니다.
    document.getElementById('userid').value = user.userid;
    document.getElementById('email').value = user.email;
    document.getElementById('password').value = user.password;
    
    // 회원정보 수정 기능
    document.getElementById('memberForm').addEventListener('submit', function(e) {
      e.preventDefault();
      user.email = document.getElementById('email').value;
      user.password = document.getElementById('password').value;
      localStorage.setItem('user', JSON.stringify(user));
      alert("회원정보가 수정되었습니다.");
      window.location.href = "index.html";
    });
    
    // 회원 탈퇴 기능
    document.getElementById('deleteAccount').addEventListener('click', function() {
      if(confirm("정말로 회원 탈퇴하시겠습니까?")) {
        localStorage.removeItem('user');
        localStorage.removeItem('loggedIn');
        alert("회원 탈퇴가 완료되었습니다.");
        window.location.href = "signup.html"; // 탈퇴 후 회원가입 페이지로 이동
      }
    });
  });