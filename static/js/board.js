const recordsPerPage = 5;
let currentPage = 1;
let allRecords = []; // 전역 변수로 모든 레코드 저장

async function fetchRecords() {
    try {
        const response = await fetch('api/user/get_records', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch records');
        const data = await response.json();

        allRecords = data.records_list; // API에서 받은 데이터를 전역 변수에 저장
        
        // nth_round 기준으로 내림차순 정렬
        allRecords.sort((a, b) => {
            return b.nth_round - a.nth_round;  // b의 nth_round가 a의 nth_round보다 크면 앞으로 오도록 정렬
        });

        displayRecords(currentPage);
        setupPagination(allRecords.length, recordsPerPage);
    } catch (error) {
        console.error('Error:', error);
    }
}


function displayRecords(page) {
    const startIndex = (page - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const recordsToShow = allRecords.slice(startIndex, endIndex);

    const listElement = document.querySelector('.records-list');
    listElement.innerHTML = '';
    recordsToShow.forEach(record => {
        const date = new Date(record.create_date);
        const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
        const companyName = typeof record.company_name === 'string' && record.company_name.trim() !== '' ? record.company_name : '';

        const recordElement = document.createElement('div');
        recordElement.classList.add('record');
        recordElement.setAttribute('data-record-id', record.record_id); // 각 기록에 대한 record_id 설정
        recordElement.textContent = `${record.nth_round}번째 ${formattedDate} ${companyName} 모의면접`;

        listElement.appendChild(recordElement);
    });
}

function setupPagination(totalRecords, recordsPerPage) {
    const pageCount = Math.ceil(totalRecords / recordsPerPage);
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    // 페이지 이동 버튼 추가 (맨 처음, 이전)
    const firstButton = document.createElement('button');
    firstButton.textContent = '<<';
    firstButton.addEventListener('click', () => {
        currentPage = 1;
        displayRecords(currentPage);
        setupPagination(totalRecords, recordsPerPage);
    });
    paginationContainer.appendChild(firstButton);

    const prevButton = document.createElement('button');
    prevButton.textContent = '<';
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRecords(currentPage);
            setupPagination(totalRecords, recordsPerPage);
        }
    });
    paginationContainer.appendChild(prevButton);

    // 현재 페이지를 중심으로 최대 5개의 페이지 번호 표시
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(pageCount, startPage + 4);

    // 시작 페이지 조정 (페이지 수가 5개 이하면 조정)
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.textContent = i;

        if (currentPage === i) {
            button.classList.add('active');
        }

        button.addEventListener('click', function () {
            currentPage = i;
            displayRecords(currentPage);
            setupPagination(totalRecords, recordsPerPage);
        });

        paginationContainer.appendChild(button);
    }

    // 페이지 이동 버튼 추가 (다음, 맨 끝)
    const nextButton = document.createElement('button');
    nextButton.textContent = '>';
    nextButton.addEventListener('click', () => {
        if (currentPage < pageCount) {
            currentPage++;
            displayRecords(currentPage);
            setupPagination(totalRecords, recordsPerPage);
        }
    });
    paginationContainer.appendChild(nextButton);

    const lastButton = document.createElement('button');
    lastButton.textContent = '>>';
    lastButton.addEventListener('click', () => {
        currentPage = pageCount;
        displayRecords(currentPage);
        setupPagination(totalRecords, recordsPerPage);
    });
    paginationContainer.appendChild(lastButton);
}
