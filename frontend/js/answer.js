let sections = [];
let currentSection = 0;

const sectionContainer = document.getElementById("sectionContainer");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

function stripHTML(str) {
    if (!str) return "";
    return str
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();
}

async function loadAnswerPage() {
    const formId = new URLSearchParams(location.search).get("formId");
    if (!formId) return;

    try {
        const form = await FormAPI.getFormById(formId);

        if (!form.is_public) {
            alert("이 설문은 아직 게시되지 않았습니다.");
            location.href = "/frontend/html/";
            return;
        }

        document.getElementById("answerFormTitle").textContent = form.title;
        document.getElementById("answerFormDescription").textContent = form.description;

        const structure = await FormAPI.getFormStructure(formId);
        sections = (structure.sections || []).sort((a, b) => a.order_num - b.order_num);

        renderSections();
        showSection(0);
    } catch (err) {
        console.error(err);
        alert("설문을 불러오는 중 오류가 발생했습니다.");
    }
}

function renderSections() {
    sectionContainer.innerHTML = "";

    sections.forEach((sec) => {
        const secDiv = document.createElement("div");
        secDiv.className = "section-block";

        let html = `
            <h5>${sec.title || `섹션 ${sec.order_num}`}</h5>
            ${sec.description ? `<p class="text-muted">${sec.description}</p>` : ""}
        `;

        (sec.questions || []).forEach((q) => {
            html += renderQuestionHTML(q);
        });

        secDiv.innerHTML = html;
        sectionContainer.appendChild(secDiv);
    });
}

function renderQuestionHTML(q) {
    const settings = q.settings || {};
    let inputHTML = "";

    switch (q.question_type) {
        case "SHORT_TEXT":
            inputHTML = `<input data-qid="${q.question_id}" type="text" class="form-control answer-input">`;
            break;

        case "LONG_TEXT":
            inputHTML = `<textarea data-qid="${q.question_id}" class="form-control answer-input" rows="4"></textarea>`;
            break;

        case "RADIO":
            inputHTML = (settings.options || [])
                .map(
                    (opt) => `
                    <div class="form-check">
                        <input class="form-check-input" type="radio"
                            name="q_${q.question_id}" value="${opt}">
                        <label class="form-check-label">${opt}</label>
                    </div>
                `
                )
                .join("");
            break;

        case "CHECKBOX":
            inputHTML = (settings.options || [])
                .map(
                    (opt) => `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox"
                            data-qid="${q.question_id}" value="${opt}">
                        <label class="form-check-label">${opt}</label>
                    </div>
                `
                )
                .join("");
            break;

        case "DROPDOWN":
            inputHTML = `
                <select class="form-select" data-qid="${q.question_id}">
                    ${(settings.options || []).map((opt) => `<option>${opt}</option>`).join("")}
                </select>
            `;
            break;

        case "SCALE":
            const min = settings.min ?? 1;
            const max = settings.max ?? 5;
            const labels = settings.labels || ["최소", "최대"];

            inputHTML = `
                <div class="scale-container">
                    <div class="d-flex justify-content-between small text-muted mb-1">
                        <span>${labels[0]}</span>
                        <span>${labels[1]}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        ${Array.from({ length: max - min + 1 }, (_, i) => {
                            const num = i + min;
                            return `
                                <label>
                                    <input 
                                        type="radio" 
                                        name="q_${q.question_id}" 
                                        value="${num}" 
                                        class="form-check-input me-1">
                                    ${num}
                                </label>
                            `;
                        }).join("")}
                    </div>
                </div>
            `;
            break;
    }

    return `
        <div class="question-block">
            <div class="fw-semibold">
                ${q.question_text}
                ${q.is_required ? `<span class="text-danger">*</span>` : ""}
            </div>
            <div class="mt-3">${inputHTML}</div>
        </div>
    `;
}

function showSection(index) {
    const list = document.querySelectorAll(".section-block");

    list.forEach((s) => s.classList.remove("active"));
    list[index].classList.add("active");

    currentSection = index;

    prevBtn.style.visibility = index === 0 ? "hidden" : "visible";
    nextBtn.textContent = index === sections.length - 1 ? "제출" : "다음";
}

function validateRequiredQuestions(sectionIndex) {
    const sec = sections[sectionIndex];
    if (!sec || !sec.questions) return true;

    for (const q of sec.questions) {
        if (!q.is_required) continue;

        const qid = q.question_id;
        const type = q.question_type;

        let isValid = true;

        switch (type) {
            case "SHORT_TEXT":
            case "LONG_TEXT": {
                const el = document.querySelector(`[data-qid="${qid}"]`);
                isValid = el && el.value.trim() !== "";
                break;
            }

            case "RADIO": {
                const selected = document.querySelector(`input[name="q_${qid}"]:checked`);
                isValid = !!selected;
                break;
            }

            case "DROPDOWN": {
                const el = document.querySelector(`select[data-qid="${qid}"]`);
                isValid = el && el.value.trim() !== "";
                break;
            }

            case "CHECKBOX": {
                const checked = document.querySelectorAll(`input[data-qid="${qid}"][type='checkbox']:checked`);
                isValid = checked.length > 0;
                break;
            }

            case "SCALE": {
                const selected = document.querySelector(`input[name="q_${qid}"]:checked`);
                isValid = !!selected;
                break;
            }
        }

        if (!isValid) {
            alert(`필수 질문을 모두 입력해주세요:\n- ${q.question_text}`);
            return false;
        }
    }

    return true;
}

nextBtn.addEventListener("click", () => {
    if (currentSection === sections.length - 1) {
        if (!validateRequiredQuestions(currentSection)) return;
        submitResponse();
        return;
    }

    if (!validateRequiredQuestions(currentSection)) return;

    showSection(currentSection + 1);
});

prevBtn.addEventListener("click", () => {
    if (currentSection > 0) showSection(currentSection - 1);
});

function collectAnswers() {
    const data = [];

    sections.forEach((sec) => {
        sec.questions.forEach((q) => {
            const qid = q.question_id;
            const type = q.question_type;

            let answerData = {};

            switch (type) {
                case "SHORT_TEXT":
                case "LONG_TEXT": {
                    const el = document.querySelector(`[data-qid="${qid}"]`);
                    answerData = { text: el?.value || "" };
                    break;
                }

                case "RADIO": {
                    const selected = document.querySelector(`input[name="q_${qid}"]:checked`);
                    answerData = { selected_option: selected ? selected.value : null };
                    break;
                }

                case "DROPDOWN": {
                    const el = document.querySelector(`select[data-qid="${qid}"]`);
                    answerData = { selected_option: el ? el.value : null };
                    break;
                }

                case "CHECKBOX": {
                    const boxItems = document.querySelectorAll(`input[data-qid="${qid}"][type='checkbox']:checked`);
                    answerData = {
                        selected_options: [...boxItems].map((c) => c.value),
                    };
                    break;
                }

                case "SCALE": {
                    const selected = document.querySelector(`input[name="q_${qid}"]:checked`);
                    answerData = { score: selected ? Number(selected.value) : null };
                    break;
                }
            }

            data.push({
                question_id: qid,
                answer_data: answerData,
            });
        });
    });

    return data;
}

async function submitResponse() {
    const formId = new URLSearchParams(location.search).get("formId");

    if (!validateRequiredQuestions(currentSection)) return;

    try {
        const response = await FormAPI.createResponse(formId, {
            user_id: null,
        });

        await FormAPI.addAnswers(response.response.response_id, collectAnswers());

        location.href = `/frontend/html/complete.html?formId=${formId}`;
    } catch (err) {
        console.error(err);
        alert("제출 중 오류가 발생했습니다.");
    }
}

window.addEventListener("DOMContentLoaded", loadAnswerPage);
