document.addEventListener('DOMContentLoaded', function () {
// home으로 이동 --------------------------
    document.querySelector('.logo-name').addEventListener('click', function (e) {
        e.preventDefault(); // 기본 이벤트 차단

        // 면접 채팅 페이지일 경우에만 조건 확인
        const isInterviewChat = document.querySelector('.main').querySelector('.modal-background') !== null;

        // 면접 채팅 페이지일 경우에만 조건 확인
        if (isInterviewChat) {
            if (!confirm('면접을 종료하고 홈 페이지로 이동하시겠습니까?')) {
                return; // 사용자가 취소를 선택한 경우, 이벤트 처리 중지
            }
        }

        // AJAX 요청 설정
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/', true); // 여기서 'home.html'은 서버상의 경로에 맞게 조정해야 합니다.
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // 응답으로 받은 HTML에서 main 내용 추출
                var parser = new DOMParser();
                var doc = parser.parseFromString(xhr.responseText, "text/html");
                var newMainContent = doc.querySelector('.main').innerHTML;

                // 현재 문서의 main 섹션 내용 교체
                document.querySelector('.main').innerHTML = newMainContent;

                // 필요한 경우 여기서 추가적인 스크립트 초기화를 수행
                // 애니메이션 클래스 추가
                document.querySelector('.main').classList.add('animate-fade-in');

                // 애니메이션 종료 후 클래스 제거 (옵션)
                document.querySelector('.main').addEventListener('animationend', function() {
                    this.classList.remove('animate-fade-in');
                });
            }
        };
        xhr.send();
    });
// home으로 이동 끝 --------------------------

// 회원가입 폼으로 이동 끝 시작 -----------------------
    document.getElementById('go-sign-up').addEventListener('click', function (e) {
        e.preventDefault(); // 기본 이벤트(링크 이동) 차단

        // AJAX 요청 생성 및 설정
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'api/common/sign_up', true);
        xhr.onreadystatechange = function () {
            // 요청이 성공적으로 완료되었는지 확인
            if (xhr.readyState === 4 && xhr.status === 200) {
                // main 섹션의 내용을 응답으로 받은 HTML로 교체
                document.querySelector('.main').innerHTML = xhr.responseText;
                // 애니메이션 클래스 추가
                document.querySelector('.main').classList.add('animate-fade-in');

                // 애니메이션 종료 후 클래스 제거 (옵션)
                document.querySelector('.main').addEventListener('animationend', function() {
                    this.classList.remove('animate-fade-in');
                });
                initializeSignUpForm();
            }
        };
        xhr.send(); // 요청 전송
    });
// 회원가입 폼으로 이동 끝 --------------------------

// 로그인 모달에서 회원가입 이동 ----------------------
    document.getElementById('move-sign-up').addEventListener('click', function (e) {
        e.preventDefault(); // 기본 이벤트 차단

        // AJAX 요청 설정
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'api/common/sign_up', true); // 'sign-up.html'의 실제 경로로 변경해야 함
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // 응답으로 받은 HTML에서 main 내용 추출
                var parser = new DOMParser();
                var doc = parser.parseFromString(xhr.responseText, "text/html");
                var newMainContent = doc.querySelector('.main').innerHTML;

                // 현재 문서의 main 섹션 내용 교체
                document.querySelector('.main').innerHTML = newMainContent;
                // 애니메이션 클래스 추가
                document.querySelector('.main').classList.add('animate-fade-in');

                // 애니메이션 종료 후 클래스 제거 (옵션)
                document.querySelector('.main').addEventListener('animationend', function() {
                    this.classList.remove('animate-fade-in');
                });
                // 로그인 모달 창 숨김
                document.getElementById('login-modal').style.display = 'none';
                // 필요한 경우 여기서 추가적인 스크립트 초기화를 수행
                initializeSignUpForm();
            }
        };
        xhr.send();
    });
// 로그인 모달에서 회원가입 이동 끝 ----------------------


// 서비스페이지로 이동 시작 --------------------------
    // 'go-service' 링크 클릭 이벤트 처리
    document.getElementById('go-service').addEventListener('click', function(event) {
        event.preventDefault(); // 기본 이벤트 방지

        // 면접 채팅 페이지일 경우에만 조건 확인
        const isInterviewChat = document.querySelector('.main').querySelector('.modal-background') !== null;

        // 면접 채팅 페이지일 경우에만 조건 확인
        if (isInterviewChat) {
            if (!confirm('면접을 종료하고 서비스 페이지로 이동하시겠습니까?')) {
                return; // 사용자가 취소를 선택한 경우, 이벤트 처리 중지
            }
        }

        // 'service.html' 내용을 AJAX로 가져와 메인 섹션에 삽입
        fetch('api/common/service') // 경로 확인 필요
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                document.querySelector('.main').innerHTML = html;
                // 애니메이션 클래스 추가
                document.querySelector('.main').classList.add('animate-fade-in');

                // 애니메이션 종료 후 클래스 제거 (옵션)
                document.querySelector('.main').addEventListener('animationend', function() {
                    this.classList.remove('animate-fade-in');
                });
                // 추가적인 스크립트 초기화나 처리가 필요하면 여기에 추가
            })
            .catch(error => {
                console.error('Error loading the page: ', error);
            });
    });

    // 서비스페이지로 이동 끝 --------------------------

    document.getElementById('go-my-page').addEventListener('click', function(event) {
        event.preventDefault(); // 기본 이벤트 방지

        // 면접 채팅 페이지일 경우에만 조건 확인
        const isInterviewChat = document.querySelector('.main').querySelector('.modal-background') !== null;

        // 면접 채팅 페이지일 경우에만 조건 확인
        if (isInterviewChat) {
            if (!confirm('면접을 종료하고 마이 페이지로 이동하시겠습니까?')) {
                return; // 사용자가 취소를 선택한 경우, 이벤트 처리 중지
            }
        }
    
        // 'api/common/mypage'로부터 마이페이지 내용을 AJAX로 가져옴
        fetch('api/common/mypage')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            // 마이페이지 HTML 내용을 .main에 삽입
            document.querySelector('.main').innerHTML = html;
            // 애니메이션 클래스 추가
            document.querySelector('.main').classList.add('animate-fade-in');

            // 애니메이션 종료 후 클래스 제거 (옵션)
            document.querySelector('.main').addEventListener('animationend', function() {
                this.classList.remove('animate-fade-in');
            });
            
            // localStorage에서 user_profile 정보를 가져옴
            const userProfileString = localStorage.getItem('user_profile');
            // 문자열을 객체로 변환
            const userProfile = JSON.parse(userProfileString);
            if (userProfile) {
                // 여기서 페이지가 이미 로드되었으므로, 직접 DOM 요소에 접근하여 값을 업데이트할 수 있음
                // 'input[name="userId"]' 등의 선택자는 실제 요소의 name 속성과 일치해야 함
                document.querySelector('input[name="userId"]').value = userProfile.userid || '';
                document.querySelector('input[name="name"]').value = userProfile.username || '';
                document.querySelector('input[name="interest"]').value = userProfile.field || '';
    
                const skillsContainer = document.getElementById('skillList');
                // 기술 목록을 콤마와 공백으로 구분된 문자열로 조합합니다.
                const skillsText = userProfile.skills.join(', ');
                skillsContainer.textContent = skillsText; // 또는 innerHTML, 이 경우 HTML 태그도 사용 가능합니다.

            
                
            } else {
                console.error('User profile data is not available in localStorage.');
            }
        })
        .catch(error => {
            console.error('Error loading the page: ', error);
        });
    });
    

    // 마이페이지로 이동 끝 --------------------------

    // 모의면접 사전입력, 모의면접 기록 페이지 이동 시작 --------------------------
    document.querySelector('.main').addEventListener('click', function(event) {
        // 'move-interview-btn' 버튼이 클릭된 경우에만 핸들러 실행
        if (event.target.id === 'move-interview-btn') {
            event.preventDefault(); // 기본 이벤트 방지
            loadPage('interview_prepare'); // 모의 면접 준비 페이지 로드
        } else if (event.target.id === 'find-log-btn') {
            event.preventDefault(); // 기본 이벤트 방지
            loadPage('interview_all_repo'); // 면접 기록 페이지 로드
        }
        else if (event.target.id === 'start-interview-btn') {
            event.preventDefault(); // 기본 이벤트 방지
            moveFirstQuestionPage();
            document.getElementById("loadingModal").style.display = "block";
        }
    });
    // 모의면접 사전입력, 모의 면접 기록 페이지 이동 시작 --------------------------
    function moveFirstQuestionPage() {
        // 회사 정보 수집
        const companyName = document.getElementById('company-name').value;
        const work = document.getElementById('work').value;
        const preferredQualifications = document.getElementById('preferred-qualifications').value;
        const candidateIdeal = document.getElementById('candidate_ideal').value;
    
        // 로컬 스토리지에서 user_profile 정보를 가져옴
        const userProfileString = localStorage.getItem('user_profile');
        const userProfile = JSON.parse(userProfileString);
    
        // 자기소개서 내용
        const coverLetterContent = document.querySelector('.cover-letter').value;
        var q_num = document.getElementById('question-count').value;
        // 모든 데이터를 하나의 객체로 구성
        const formData = {
            company_info: {
                name: companyName,
                work: work,
                preferred_qualifications: preferredQualifications,
                desired_candidate: candidateIdeal
            },
            cover_letter: {
                content: [coverLetterContent]
            },
            user: {
                id: userProfile.id,  
                userid: userProfile.userid,  
                username: userProfile.username,  
                field: userProfile.field,  
                skills: userProfile.skills  
            },
            q_num: q_num
        };
    
        // 액세스 토큰 가져오기
        const accessToken = localStorage.getItem('access_token');
    
        // FastAPI 엔드포인트로 데이터 전송
        fetch('/api/handler/interview_start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}` // 인증 토큰 헤더에 추가
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            //첫 질문 생성(텍스트)
            return fetch(`/api/question/question_create/${data}?before_answer_id=0`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}` // 인증 토큰 헤더에 추가
                },
               // 필요한 경우 수정
            });
        })
        .then(questionResponse => {
            if (!questionResponse.ok) {
                throw new Error('Failed to create question');
            }
            return questionResponse.json();
        })
        .then(questionData => {
            loadPage('interview_chat', questionData);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    document.getElementById('go-help').addEventListener('click', function(event) {
        event.preventDefault(); // 기본 이벤트 방지

        // 면접 채팅 페이지일 경우에만 조건 확인
        const isInterviewChat = document.querySelector('.main').querySelector('.modal-background') !== null;

        // 면접 채팅 페이지일 경우에만 조건 확인
        if (isInterviewChat) {
            if (!confirm('면접을 종료하고 help 페이지로 이동하시겠습니까?')) {
                return; // 사용자가 취소를 선택한 경우, 이벤트 처리 중지
            }
        }

        fetch('api/common/feedback') // 경로 확인 필요
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                document.querySelector('.main').innerHTML = html;
                fetchFeedbackData(1);
                repositorybuttonclick();
            })
            .catch(error => {
                console.error('Error loading the page: ', error);
            });
    });
});

// 페이지 내용을 AJAX로 가져와 메인 섹션에 삽입하는 함수
function loadPage(page, data=null) {
    fetch(`api/common/${page}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            document.querySelector('.main').innerHTML = html;
            // 애니메이션 클래스 추가
            document.querySelector('.main').classList.add('animate-fade-in');

            // 애니메이션 종료 후 클래스 제거 (옵션)
            document.querySelector('.main').addEventListener('animationend', function() {
                this.classList.remove('animate-fade-in');
            });

            initPage();
            if (page === 'interview_prepare') {
                preloadUserInfo();
                updateToggleStatus();
            } else if (page === 'interview_all_repo') {
                fetchRecords();
                const recordsListContainer = document.querySelector('.records-list');

                // 면접 기록 클릭 이벤트 리스너 추가
                recordsListContainer.addEventListener('click', function(event) {
                    const recordElement = event.target.closest('.record');
                    if (recordElement) {
                        const recordId = recordElement.getAttribute('data-record-id');
                        loadFeedbackPage(recordId);
                    }
                });
            } else if (page === 'interview_chat') {
                const aiQuestionTextBox = document.getElementById('ai-question-textbox');
                const questionText = data.content;
                const record_id = data.record_id;
                const question_id = data.id;
                aiQuestionTextBox.textContent = questionText;
                document.dispatchEvent(new CustomEvent('pageLoaded', {
                    detail: { page, data } // data includes questionData
                }));
            }
        })
        .catch(error => {
            console.error('Error loading the page: ', error);
        });
}


// 사용자 정보를 미리 입력하는 함수
function preloadUserInfo() {
    // localStorage에서 user_profile 정보를 가져옴
    const userProfileString = localStorage.getItem('user_profile');
    const userProfile = JSON.parse(userProfileString);
    if (userProfile) {
        // 이름, 관심분야, 스킬 목록을 입력 필드에 설정
        document.querySelector('input[name="name"]').value = userProfile.username || '';
        document.querySelector('input[name="interest"]').value = userProfile.field || '';
        
        const skillsContainer = document.getElementById('skillList');
        const skillsText = userProfile.skills.join(', ');
        skillsContainer.textContent = skillsText;
    } else {
        console.error('User profile data is not available in localStorage.');
    }
}
function fetchUserProfile() {
    // 여기서는 예시로 XMLHttpRequest를 사용합니다.
    // 실제로는 인증 방식에 맞춰 Authorization 헤더 등을 추가해야 합니다.
    var xhr = new XMLHttpRequest();
    var url = "/api/user/profile"; // 사용자 정보 API 엔드포인트
    let token = localStorage.getItem('accessToken');
    xhr.open("GET", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader("Authorization", "Bearer " + token); // "Bearer " 접두사 추가

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            populateUserProfile(response); // HTML에 사용자 정보를 채우는 함수 호출
        }
    };
    xhr.send();

}

function populateUserProfile(data) {
    // HTML 요소에 데이터 채우기
    document.querySelector('[name="userId"]').value = data.userid;
    document.querySelector('[name="name"]').value = data.username;
    document.querySelector('[name="interest"]').value = data.field;
    
    // 스킬 리스트 처리
    var skillsContainer = document.getElementById('skillList');
    data.skills.forEach(skill => {
        var skillDiv = document.createElement('div');
        skillDiv.textContent = skill;
        skillsContainer.appendChild(skillDiv);
    });
}

function repositorybuttonclick() {
    var repositoryButton = document.querySelector('.repository-button');
    if (repositoryButton) {
        repositoryButton.addEventListener('click', function(event) {
            event.preventDefault(); // 기본 이벤트 방지
            loadPage('interview_all_repo')
        });
    }
}

function loadFeedbackPage(recordId) {
    fetch('api/common/feedback') // 경로 확인 필요
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                document.querySelector('.main').innerHTML = html;
                fetchFeedbackData(recordId);
                repositorybuttonclick();
                
            })
            .catch(error => {
                console.error('Error loading the page: ', error);
            });
}