document.getElementById('signupForm').addEventListener('submit', function(e){
    e.preventDefault();
    // 입력 값 가져오기
    const userid = document.getElementById('userid').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordCheck = document.getElementById('passwordCheck').value;
    
    if(password !== passwordCheck) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    
    // 사용자 객체 생성 및 localStorage에 저장 (JSON 문자열로 변환)
    const user = {
      userid: userid,
      email: email,
      password: password
    };
    localStorage.setItem('user', JSON.stringify(user));
    
    alert("회원가입이 완료되었습니다. 로그인 해주세요.");
    window.location.href = "login.html";
  });