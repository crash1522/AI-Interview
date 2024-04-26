document.addEventListener('DOMContentLoaded', function () {
    var modal = document.getElementById('login-modal');


    var loginBtn = document.getElementById('go-sign-in'); // 로그인 버튼
    var loginFormButton = document.querySelector('.login-button'); // 로그인 폼 내의 로그인 버튼
    var authLinks = document.querySelector('.auth-links'); // 로그인/회원가입 링크를 담고 있는 div
    var userInfo = document.querySelector('.user-info'); // 사용자 정보 및 로그아웃 링크를 담고 있는 div
    
    function isTokenExpired(token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Date.now() / 1000; // 현재 시간을 초 단위로 변환
        return now > payload.exp;
    }
    
    function isLoggedIn() {
        const token = localStorage.getItem('access_token');
        if (!token) {
            return false;
        }
        return !isTokenExpired(token);
    }
    
    // 로그인 상태에 따라 UI 변경 함수
    function toggleUIBasedOnLoginStatus() {
        if (isLoggedIn()) { //로그인 상태로 바꿀려면 !표 붙여야함
            authLinks.style.display = 'none';
            userInfo.style.display = 'flex';
        } else {
            authLinks.style.display = 'flex';
            userInfo.style.display = 'none';
        }
    }

    // 모달 열기 함수 (범용)
    function openModal(modal) {
        if (modal) {
            modal.style.display = 'block';  
            modal.classList.add('modal-open-animation');
            modal.classList.remove('modal-close-animation');
        }
    }
    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('modal-open-animation');
            modal.classList.add('modal-close-animation');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 500);
        }
    }

    function openAnswerModal(userAnswerModal) {
        if (userAnswerModal) {
            userAnswerModal.style.display = 'flex';  
            userAnswerModal.classList.add('chat-modal-open-animation2');
            userAnswerModal.classList.remove('chat-modal-close-animation2');
        }
    }


    function closeAnswerModal(userAnswerModal) {
        if (userAnswerModal) {
            userAnswerModal.classList.remove('chat-modal-open-animation');
            userAnswerModal.classList.add('chat-modal-close-animation');
            setTimeout(() => {
                userAnswerModal.style.display = 'none';
            }, 500);
        }
    }
    function fetchNewQuestion(data) {
        var userAnswerModal = document.getElementById('user-answer-modal'); // 사용자 답변 모달 요소 선택
        fetch(`/api/question/question_create/${data.record_id}?before_answer_id=${data.id}`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`  
            },
        })
        .then(response => response.json())
        .then(questionData => {
            console.log('New question received:', questionData);
            closeAnswerModal(userAnswerModal);
            playAIQuestion(questionData);
        })
        .catch(error => console.error('Error fetching new question:', error));
    }

    function openQuestionModal(aiQuestionModal) {
                if (aiQuestionModal) {
                aiQuestionModal.style.display = 'flex';  
                aiQuestionModal.classList.remove('chat-modal-close-animation');
                aiQuestionModal.classList.add('chat-modal-open-animation');
                }
            }
    function closeQuestionModal(aiQuestionModal) {
        if (aiQuestionModal) {
            aiQuestionModal.classList.remove('chat-modal-open-animation');
            aiQuestionModal.classList.add('chat-modal-close-animation');
            setTimeout(() => {
                aiQuestionModal.style.display = 'none';
            }, 500);
        }
    }
    // 모달 외부 클릭 시 모달 창 닫기
    window.onclick = function(event) {
        if (event.target === modal) {
            closeModal(modal);
        }
    };

    toggleUIBasedOnLoginStatus();

    // 사용자 이름 업데이트 코드
    const userid = localStorage.getItem('userid');
    if (userid) {
        const usernameSpan = document.getElementById('user-name');
        if (usernameSpan) {
            usernameSpan.textContent = userid + '님';
        }
    }

    loginBtn.onclick = function() {
        openModal(modal);
    };

    var loginForm = document.getElementById('login-form'); // 로그인 폼 ID
    var loginFormButton = document.getElementById('loginFormButton'); // 로그인 버튼 ID

    if (loginForm) {
        // 로그인 처리 공통 함수
        function handleLogin(event) {
            event.preventDefault(); // 폼의 기본 제출 동작을 방지

            var userIdElement = document.getElementsByName('user-id')[0];
            var passwordElement = document.getElementsByName('user-password')[0];
            if (userIdElement && passwordElement) {
                var userId = userIdElement.value;
                var password = passwordElement.value;
            } else {
                console.error('Form elements not found');
                return;
            }

            // 로그인 요청을 위한 URL
            const url = '/api/user/login';

            // XMLHttpRequest 객체 생성
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var data = JSON.parse(xhr.responseText);
                        localStorage.setItem('access_token', data.access_token);
                        localStorage.setItem('userid', data.userid);
                        localStorage.setItem('user_profile', JSON.stringify(data.user_profile));
                        // document.getElementById('user-name').textContent = data.userid + '님';

                        closeModal(); // 모달 창 닫기
                        // toggleUIBasedOnLoginStatus(); // UI 상태 업데이트

                        setTimeout(function() {
                            window.location.href = '/'; // 홈 페이지로 리디렉션
                        }, 500);
                    } else {
                        var errorMessageDiv = document.getElementById('login-error-message');
                        var errorResponse = JSON.parse(xhr.responseText);
                        errorMessageDiv.innerHTML = errorResponse.detail.replace(/\n/g, '<br>');
                        errorMessageDiv.style.display = 'block';
                        console.error('Login failed:', errorResponse.detail);
                    }
                }
            };

            var formData = new URLSearchParams();
            formData.append('username', userId);
            formData.append('password', password);
            console.log('Sending request with body:', formData.toString());
            xhr.send(formData.toString());

            document.getElementById('user-password').value = ''; // 비밀번호 필드 초기화
        }

        // 이벤트 리스너 등록
        loginForm.addEventListener('submit', handleLogin);
        if (loginFormButton) {
            loginFormButton.addEventListener('click', handleLogin);
        }
    }
    
    
    
    var logoutButton = document.getElementById('logout');
        // 면접 채팅 페이지일 경우에만 조건 확인
        const isInterviewChat = document.querySelector('.main').querySelector('.modal-background') !== null;

        // 면접 채팅 페이지일 경우에만 조건 확인
        if (isInterviewChat) {
            if (!confirm('면접을 종료하고 홈 페이지로 이동하시겠습니까?')) {
                return; // 사용자가 취소를 선택한 경우, 이벤트 처리 중지
            }
        }
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('access_token'); // 액세스 토큰 삭제
            localStorage.removeItem('userid'); // 사용자 ID 삭제
            toggleUIBasedOnLoginStatus(); // UI 업데이트

            // 'home.html' 내용을 AJAX로 가져와 메인 섹션에 삽입
            fetch('/api/user/logout')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(html => {
                    localStorage.clear();
                    window.location.href = '/';
                    // document.querySelector('.main').innerHTML = html;
                    // home.html 로딩 후 필요한 추가적인 초기화 로직이 있다면 여기에 구현
                })
                .catch(error => {
                    console.error('Error loading the page: ', error);
                });
        });
    }

    toggleUIBasedOnLoginStatus();

    // 시작하기 버튼 클릭 이벤트
    document.body.addEventListener('click', function(event) {
        // 이벤트가 발생한 요소가 "시작하기" 버튼인지 확인
        if (event.target.classList.contains('start-btn')) {
            if (!isLoggedIn()) {  //로그인 상태로 바꿀려면 !표 빼야함
                openModal(modal); // 비로그인 상태에서 모달 창 열기
            } else {
                loadServicePage(); // 로그인 상태일 때 service.html 내용 가져오기
            }
        }
    });

    // service.html 내용을 가져와서 페이지에 삽입하는 함수
    function loadServicePage() {
        fetch('api/common/service')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log(response)
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
                // service.html 로딩 후 필요한 추가적인 초기화 로직이 있다면 여기에 구현
            })
            .catch(error => {
                console.error('Error loading the page: ', error);
            });
    }
    
    // move.js 와 script.js 연결
    document.addEventListener('pageLoaded', function(event) {
        if (event.detail.page === 'interview_chat') {
            const questionData = event.detail.data; // Here you access the passed questionData
            console.log('Received question data:', questionData);
            ChatPage(questionData); // Pass the questionData to ChatPage
        }
    });
    



    // AI 질문 모달에서 MP3 재생 시작 및 이벤트 핸들링
    async function playAIQuestion(questionData) {
        document.getElementById("loadingModal").style.display = "block";
        var aiQuestionModal = document.getElementById('ai-question-modal'); // AI 질문 모달 요소 선택
        const response = await fetch('/api/handler/text_to_speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: questionData.content }) //content: text
        });
        document.getElementById("loadingModal").style.display = "none";
        // AI 질문 모달 열기
        openQuestionModal(aiQuestionModal);
    
        if (response.ok) {
            const blob = await response.blob(); // 음성 데이터를 blob으로 받기
            const url = URL.createObjectURL(blob); // Blob 객체로부터 URL 생성
            const audio = new Audio(url);
            audio.play(); // 오디오 재생
            audio.onended = function() {
                // AI 질문 모달 닫기
                closeQuestionModal(aiQuestionModal);
                // 사용자 답변 모달 열기
                handleUserAnswer(questionData);
            };
        } else {
            console.error('Failed to convert text to speech');
        }
    }
    

    function handleUserAnswer(questionData) {
        const userAnswerTextbox = document.querySelector('.user-answer-textbox');
        userAnswerTextbox.textContent = "답변이 여기에 표시됩니다.";
        var userAnswerModal = document.getElementById('user-answer-modal'); // 사용자 답변 모달 요소 선택
        const micIcon = document.getElementById('mic-icon');
        const outlines = document.querySelectorAll('.user_recording_outline'); // 모든 outline 요소 선택
        const recordOutlines = document.querySelectorAll('.user_recording_button'); // 모든 outline 요소 선택
        const chatSystemMessage = document.querySelector('.chat-system-message');

        chatSystemMessage.textContent = "녹음 중 입니다... 40초 남았습니다. 마이크를 클릭하면 녹음이 종료됩니다.";
        document.getElementById('ai-question-textbox').textContent = questionData.content;

        openAnswerModal(userAnswerModal);
        // 마이크 아이콘 및 기타 요소들의 클래스를 제거하여 스타일 초기화
        if (micIcon) {micIcon.classList.remove('recording-complete');}
        outlines.forEach(outline => {outline.classList.remove('no-animation');});
        recordOutlines.forEach(recordOutlines => {recordOutlines.classList.remove('no-animation');});


        // 사용자의 오디오 입력 장치에 접근 권한을 요청
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                
                const chatSystemMessage = document.querySelector('.chat-system-message');
                chatSystemMessage.textContent = "녹음 중 입니다... 마이크를 클릭하면 녹음이 종료됩니다.";
                let remainingTime = 40; // 녹음 시간을 40초로 설정
                let mediaRecorder = new MediaRecorder(stream);
                let audioChunks = [];
            
                // 타이머 로직 추가
                const timerInterval = setInterval(() => {
                    remainingTime -= 1;
                    chatSystemMessage.textContent = `녹음 중 입니다... ${remainingTime}초 남았습니다. 마이크를 클릭하면 녹음이 종료됩니다.`;
            
                    if (remainingTime <= 0) {
                        clearInterval(timerInterval);
                        mediaRecorder.stop(); // 타이머에 의해 녹음 종료
                    }
                }, 1000);
            
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    clearInterval(timerInterval); // 타이머 종료
                    const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                    mediaRecorder.stream.getTracks().forEach(track => track.stop()); // 마이크 사용 중지

                    micIcon.classList.add('recording-complete'); // 마이크 아이콘 스타일 변경
                
                    // 모든 outline 요소에 대해 반복 실행
                    outlines.forEach(outline => {outline.classList.add('no-animation');});
                    recordOutlines.forEach(recordOutlines => {recordOutlines.classList.add('no-animation');});

                    const chatSystemMessage = document.querySelector('.chat-system-message');

                    if (chatSystemMessage) {
                        chatSystemMessage.textContent = "녹음이 완료되었습니다.";
                    }
                
                        // 2초 후에 질문 준비 메시지 시작
                        setTimeout(() => {
                            if (chatSystemMessage) {
                                chatSystemMessage.textContent = "질문 준비 중";
                            }
                            
                            // "..."를 동적으로 업데이트하는 로직
                            let dots = 0;
                            const dotInterval = setInterval(() => {
                                dots = (dots + 1) % 4;
                                const dotsString = '.'.repeat(dots);
                                if (chatSystemMessage) {
                                    chatSystemMessage.textContent = `질문 준비 중${dotsString}`;
                                }
                                    // 5초 후 점 추가를 종료하고, 최종 메시지 설정
                                setTimeout(() => {
                                    clearInterval(dotInterval);  // 점 추가 중지
                                    chatSystemMessage.textContent = "질문 준비가 완료되었습니다.";  // 최종 상태 메시지
                                }, 5000);  // 5초 후 점 업데이트 종료
                            }, 500); // 반초마다 실행
                            
                            // 필요한 경우 이후에 clearInterval(dotInterval);을 호출하여 정지
                        }, 2000); // 2초 후에 실행
        
                    const formData = new FormData();
                    formData.append('file', audioBlob, 'recorded_audio.mp3');
                    const accessToken = localStorage.getItem('access_token');
        
                    document.getElementById("loadingModal").style.display = "block"; //로딩창 추가, 단 로딩이 짧아 거의 보이지 않음
                    fetch(`/api/answer/user_answer_create/${questionData.id}`, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Authorization': `Bearer ${accessToken}` // 인증 토큰 헤더에 추가
                        },
                    }).then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    }).then(data => {
                        console.log(data);
                        const userAnswerTextbox = document.querySelector('.user-answer-textbox');
                        if (userAnswerTextbox) {
                            userAnswerTextbox.textContent = data.content;
                        }
                    
                        // 마지막 질문에 도달했을 때의 처리 로직
                        if (data.last_question_flag) {
                            // API 경로로부터 피드백 페이지의 HTML을 가져온다
                            fetch('/api/common/feedback', {
                                method: 'GET'
                            })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }
                                return response.text();
                            })
                            .then(html => {
                                // 현재 페이지의 메인 컨텐츠를 새로운 HTML로 교체
                                document.querySelector('.main').innerHTML = html;
                                fetchFeedbackData(data.record_id); // 피드백 페이지에 필요한 데이터를 가져오는 함수
                                repositorybuttonclick();
                                // initializeFeedbackPage(); // 피드백 페이지 초기화 함수
                            })
                            .catch(error => {
                                console.error('Error loading feedback page:', error);
                            });
                        } else {
                            // 새 질문 요청 로직
                            fetchNewQuestion(data);
                        }

                    }).catch(error => console.error('Error in user answer submission:', error));};
        
                // 녹음 시작
                mediaRecorder.start();
        
                // 마이크 아이콘에 클릭 이벤트 리스너 추가
                const micIcon = document.getElementById('mic-icon');
                const outlines = document.querySelectorAll('.user_recording_outline'); // 모든 outline 요소 선택
                const recordOutlines = document.querySelectorAll('.user_recording_button'); // 모든 outline 요소 선택
                
                micIcon.addEventListener('click', () => {
                    mediaRecorder.stop(); // 사용자가 마이크 아이콘을 클릭하면 녹음 중지
                    clearInterval(timerInterval); // 타이머 종료
                    micIcon.classList.add('recording-complete'); // 마이크 아이콘 스타일 변경
                
                    // 모든 outline 요소에 대해 반복 실행
                    outlines.forEach(outline => {outline.classList.add('no-animation');});
                    recordOutlines.forEach(recordOutlines => {recordOutlines.classList.add('no-animation');});

                    const chatSystemMessage = document.querySelector('.chat-system-message');
                    if (chatSystemMessage) {
                        chatSystemMessage.textContent = "녹음이 완료되었습니다.";
                    }
                
                        // 2초 후에 질문 준비 메시지 시작
                    setTimeout(() => {
                        if (chatSystemMessage) {
                            chatSystemMessage.textContent = "질문 준비 중";
                        }
                        
                        // "..."를 동적으로 업데이트하는 로직
                        let dots = 0;
                        const dotInterval = setInterval(() => {
                            dots = (dots + 1) % 4;
                            const dotsString = '.'.repeat(dots);
                            if (chatSystemMessage) {
                                chatSystemMessage.textContent = `질문 준비 중${dotsString}`;
                            }
                                // 5초 후 점 추가를 종료하고, 최종 메시지 설정
                            setTimeout(() => {
                                clearInterval(dotInterval);  // 점 추가 중지
                                chatSystemMessage.textContent = "질문 준비가 완료되었습니다.";  // 최종 상태 메시지
                            }, 5000);  // 5초 후 점 업데이트 종료
                        }, 500); // 반초마다 실행
                        
                        // 필요한 경우 이후에 clearInterval(dotInterval);을 호출하여 정지
                    }, 2000); // 2초 후에 실행

                });
                
            })
            .catch(error => {
                console.error("Microphone access was denied: ", error);
            });
    }
    

    
    
    function ChatPage(questionData) {
        fetch('api/common/interview_chat')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                document.querySelector('.main').innerHTML = html;
                // 사용자의 오디오 입력 장치에 접근 권한을 요청
                navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => { 
                    playAIQuestion(questionData);
                })
                .catch(error => {
                    console.error("Microphone access was denied: ", error);
                });
        })
        .catch(error => {
            console.error('Error loading the page: ', error);
        });
    }
    
});


function initializeSignUpForm() {
    const addSkillButton = document.getElementById('addSkillButton');
    const skillInput = document.getElementById('skillInput');
    const skillList = document.getElementById('skillList');
    const skillsHiddenInput = document.getElementById('skillsHiddenInput');

    function updateSkillsInput() {
        const allSkills = Array.from(skillList.querySelectorAll('.skill-item div')).map(skill => skill.textContent);
        skillsHiddenInput.value = allSkills.join(',');
        document.getElementById('skillListPlaceholder').style.display = allSkills.length > 0 ? 'none' : 'block';
    }

    function removeSkill(event) {
        if (event.target.classList.contains('delete-skill')) { // 클래스 이름이 'delete-skill'인 버튼 클릭을 확인
            skillList.removeChild(event.target.closest('.skill-item'));
            updateSkillsInput();
        }
    }

    function addSkill(skill) {
        const skillItem = document.createElement('div');
        skillItem.classList.add('skill-item');
        const skillTextDiv = document.createElement('div');
        skillTextDiv.textContent = skill;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.classList.add('delete-skill'); // 삭제 버튼에 클래스 추가
        skillItem.appendChild(skillTextDiv);
        skillItem.appendChild(deleteButton);

        skillList.appendChild(skillItem);
        updateSkillsInput();
    }

    addSkillButton.addEventListener('click', function() {
        const skill = skillInput.value.trim();
        if (skill) {
            addSkill(skill);
            skillInput.value = '';
        }
    });

    // 이벤트 위임을 사용하여 skillList 내의 모든 삭제 버튼에 대한 클릭 이벤트 처리
    skillList.addEventListener('click', removeSkill);



    document.getElementById('check-duplicate').addEventListener('click', function() {
        var userId = document.querySelector('[name="userId"]').value; // 사용자가 입력한 아이디 값을 가져옵니다.

        // XMLHttpRequest 객체 생성
        var xhr = new XMLHttpRequest();
        var url = "/api/user/create/is_duplcate"; // 서버의 중복 확인 API 경로
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        
        // 서버로부터 응답을 받았을 때 실행될 함수
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                var errorMessageDiv = document.getElementById('duplicate-message');
                var response = JSON.parse(xhr.responseText);
                errorMessageDiv.textContent = response.message; // 에러 메시지 표시
                if (response.message == "사용 가능한 아이디입니다.") {
                    errorMessageDiv.style.color = '#4c80f0';   
                }
                else {
                    errorMessageDiv.style.color = 'red';
                }
                errorMessageDiv.style.display = 'block'; // 에러 메시지 보이기
            }
        };
        
        // 서버로 전송할 데이터 구성 및 전송
        var data = JSON.stringify({userid: userId});
        xhr.send(data);
    });

    document.getElementById('signupForm').addEventListener('submit', function(event) {
        event.preventDefault(); // 폼의 기본 제출 동작 방지
    
        // 입력값 수집
        let userid = document.querySelector('[name="userId"]').value;
        let password = document.querySelector('[name="password"]').value;
        let confirm_password = document.querySelector('[name="passwordConfirm"]').value;
        let username = document.querySelector('[name="name"]').value;
        let field = document.querySelector('[name="interest"]').value;
        let skillsInputValue = document.getElementById('skillsHiddenInput').value;
        // 값을 배열로 변환합니다.
        let skills = skillsInputValue ? skillsInputValue.split(',') : [];
        
        // XMLHttpRequest 객체 생성 및 설정
        var xhr = new XMLHttpRequest();
        var url = "/api/user/create"; // 변경될 수 있음
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                var errorMessageDiv = document.getElementById('error-message');
                if (xhr.status === 204) {
                    console.log("User created successfully");
                    // 성공 처리 로직: 홈 페이지로 리디렉션
                    window.location.href = '/'; // 홈 페이지 URL로 변경하세요
                } else {
                    console.error("Error creating user: ", xhr.responseText);
                    var message = JSON.parse(xhr.responseText).detail[0].msg.replace("Value error, ", "");
                    errorMessageDiv.textContent = message; // 에러 메시지 표시
                    errorMessageDiv.style.display = 'block'; // 에러 메시지 보이기
                }
            }
        };
    
        // 서버로 전송할 데이터 구성 및 전송
        var data = JSON.stringify({
            userid: userid,
            username: username,
            password: password,
            confirm_password: confirm_password,
            field: field,
            skills: skills
        });
    
        xhr.send(data);
    });


}


