function fetchFeedbackData(recordId) {
    // 여기서 record_id는 필요에 따라 설정해야 합니다.
    fetch(`/api/record/detail/${recordId}`)
        .then(response => response.json())
        .then(data => {
            // 데이터 처리 및 HTML 업데이트
            updateFeedbackContent(data);
        })
        .catch(error => console.error('Error fetching data:', error));
}

function updateFeedbackContent(data) {
    const container = document.querySelector('.feedback-container');
    container.innerHTML = '';  // Clear existing content
    data.questions.forEach((question, index) => {
        const response = data.answers[index] ? data.answers[index].content : null;
        const feedback = data.feedbacks[index] ? data.feedbacks[index].content : null;
        createElementFromTemplate(question.content, response, feedback);
    });
}

function createElementFromTemplate(question, response, feedback) {
    const formattedQuestion = question.replace(/\\n/g, '\n').replace(/\n/g, '<br>');
    const formattedResponse = response ? response.replace(/\\n/g, '\n').replace(/\n/g, '<br>') : '';
    const formattedFeedback = feedback ? feedback.replace(/\\n/g, '\n').replace(/\n/g, '<br>') : '';

    const template = `
        <div class="feedback-item">
            <div class="feedback-list">
                <p data-fulltext="${question}">${limitText(formattedQuestion, 50)}</p>
            </div>
            <div class="feedback-detail">
                <div class="feedback-response">
                    <p>${formattedResponse}</p>
                </div>
                <div class="feedback-feedback">
                    <p>${formattedFeedback}</p>
                </div>
            </div>
        </div>
    `;
    const container = document.querySelector('.feedback-container');
    container.insertAdjacentHTML('beforeend', template);

    const newItem = container.lastElementChild;
    addFeedbackItemEvent(newItem);
}


// 글자수 제한 함수
function limitText(text, limit) {
    return text.length > limit ? text.substring(0, limit) + '...' : text;
}

function addFeedbackItemEvent(item) {
    item.addEventListener('click', function() {
        // Close all other open items before opening this one
        document.querySelectorAll('.feedback-item.active').forEach(activeItem => {
            if (activeItem !== this) { // Ensure we do not close the current item being clicked
                const activeDetail = activeItem.querySelector('.feedback-detail');
                const activeQuestionP = activeItem.querySelector('.feedback-list p');
                const activeFullText = activeQuestionP.getAttribute('data-fulltext');

                activeDetail.style.transition = 'max-height 0.5s ease-in-out, opacity 0.5s ease-in-out';
                activeDetail.style.maxHeight = '0';
                activeDetail.style.opacity = '0';
                activeDetail.classList.remove('active');
                activeItem.classList.remove('active');
                activeQuestionP.innerHTML = limitText(activeFullText, 50);
            }
        });

        const detail = this.querySelector('.feedback-detail');
        const questionP = this.querySelector('.feedback-list p');
        const fullText = questionP.getAttribute('data-fulltext');

        if (detail.classList.contains('active')) {
            detail.style.transition = 'max-height 0.5s ease-in-out, opacity 0.5s ease-in-out';
            detail.style.maxHeight = '0';
            detail.style.opacity = '0';
            detail.classList.remove('active');
            questionP.innerHTML = limitText(fullText, 50);
        } else {
            detail.classList.add('active');
            detail.style.maxHeight = detail.scrollHeight + 100 + "px"; // Use scrollHeight to adjust height dynamically
            detail.style.opacity = '1';
            questionP.innerHTML = fullText.replace(/\\n/g, '\n').replace(/\n/g, '<br>');
        }

        this.classList.toggle('active');
    });
}




