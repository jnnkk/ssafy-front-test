# EnjoyTrip_Front 1팀

## 팀 소개 및 역할
- **송준영**(팀장): 메인페이지 컴포넌트화 및 디자인 수정, 로그인 페이지 모달창으로 변경 및 디자인 수정, Vuetify를 이용한 전반적인 디자인 수정 및 SFC로의 구조화 적용 
- **윤경일**(팀원): 기존 프로젝트에서 view단 옮기기 진행, 공지사항,QnA,일정 공유 게시판 디자인, Axios를 이용한 backend와 front단 연결

## 프로젝트 개요
- **배경**: 기존 JSP/Servlet 기반 EnjoyTrip 웹 애플리케이션을 SPA(Vue.js)로 전환  
- **목표**: 사용자 경험 향상, 개발 생산성 증대, 모듈화된 프론트엔드 구조 도입  

## 기술 스택
- **Frontend**: Vue 3 (Composition API), Vite, Vue Router, Axios, Vuetify
- **Backend**: Spring Boot, MyBatis, MySQL (변경 전: JSP/Servlet)  
- **빌드 도구**: Vite, npm  

## 진행 상황
1. **Main Page**  
   - Vue 컴포넌트: `MainPage.vue`  
   - 주요 기능: 헤더, 푸터, 주요 배너, 추천 여행지 카드
   ![메인 페이지](/readmeImg/mainpage.png)

2. **로그인 페이지 → 메인페이지 모달 전환**  
   - Vue 컴포넌트: `LoginPage.vue`
   - 기능:  
     - `/login` 접근 시 `LoginPage.vue`  
   ![로그인 페이지-1](/readmeImg/login1.png)
   ![로그인 페이지-2](/readmeImg/login2.png)

3. **공지사항 페이지**  
   - Vue 컴포넌트: `NoticeList.vue`, `NoticeDetail.vue`  
   - 기능: 공지사항 목록 조회, 상세 보기, 페이징
    ![공지사항 페이지](/readmeImg/notice.png)

4. **Q&A 페이지**  
   - Vue 컴포넌트: `QnAList.vue`, `QnADetail.vue`, `QnAForm.vue`  
   - 기능: 질문 등록·수정·삭제, 답변 등록, 검색 및 필터
    ![QnA 페이지](/readmeImg/qna.png)

5. **일정 공유 게시판**  
   - Vue 컴포넌트: `ScheduleBoard.vue`, `ScheduleCard.vue`, `ScheduleForm.vue`  
   - 기능: 일정 목록 그리드(3열)
    ![일정 공유 페이지](/readmeImg/board.png)
