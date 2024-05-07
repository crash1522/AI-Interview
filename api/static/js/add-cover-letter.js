function addCoverLetter() {
    var newCoverLetterContainer = document.createElement('div');
    newCoverLetterContainer.className = 'cover-letter-container';

    var newCoverLetter = document.createElement('textarea');
    newCoverLetter.className = 'cover-letter';
    newCoverLetter.required = true;

    // 'X' 버튼 생성 및 설정
    var closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = 'X';
    // 'X' 버튼 클릭 이벤트 리스너 추가
    closeButton.onclick = function() {
        newCoverLetterContainer.remove();
    };

    newCoverLetterContainer.appendChild(newCoverLetter);
    newCoverLetterContainer.appendChild(closeButton); // 'X' 버튼을 컨테이너에 추가

    var wrapper = document.getElementById('cover-letter-wrapper');
    var addButton = wrapper.querySelector('.add-button');
    wrapper.insertBefore(newCoverLetterContainer, addButton);
}

// 페이지 초기화 및 이벤트 리스너 재설정 함수
function initPage() {
    var addButton = document.querySelector('.add-button');
    if (addButton) {
        addButton.addEventListener('click', addCoverLetter);
    }
}

function updateToggleStatus() {
    var toggle = document.getElementById('difficultyToggle');
    var statusDisplay = document.getElementById('toggleStatus');

    // 초기 상태 설정
    statusDisplay.textContent = toggle.checked ? 'On' : 'Off';

    // 토글 변경 시 상태 업데이트
    toggle.addEventListener('change', function() {
        statusDisplay.textContent = this.checked ? 'On' : 'Off';
    });
}

