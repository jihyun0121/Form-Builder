let sections = [];
let currentSection = 0;

const sectionContainer = document.getElementById("sectionContainer");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

async function loadPreview() {
    const formId = new URLSearchParams(location.search).get("formId");
    if (!formId) return;

    try {
        const res = await FormAPI.getFormStructure(formId);

        document.getElementById("previewFormTitle").textContent = res.title || "제목 없는 설문지";
        document.getElementById("previewFormDescription").textContent = res.description || "";

        sections = (res.sections || []).sort((a, b) => a.order_num - b.order_num);

        renderSections();

        if (sections.length > 0) {
            showSection(0);
        }
    } catch (err) {
        console.error("미리보기 로드 실패:", err);
    }
}

function renderSections() {
    sectionContainer.innerHTML = "";

    sections.forEach((sec) => {
        const secDiv = document.createElement("div");
        secDiv.className = "section-block";

        const secTitle = sec.title && sec.title.trim().length > 0 ? sec.title : ``;

        let html = `
            <h5 class="mb-3">${secTitle}</h5>
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
    let inputHTML = "";

    const settings = q.settings || {};

    switch (q.question_type) {
        case "SHORT_TEXT":
            inputHTML = `<input type="text" class="form-control" placeholder="답변을 입력하세요" />`;
            break;

        case "LONG_TEXT":
            inputHTML = `<textarea class="form-control" rows="4" placeholder="자세히 입력해주세요"></textarea>`;
            break;

        case "RADIO":
            const radioOptions = settings.options || [];
            inputHTML = radioOptions
                .map(
                    (opt, i) => `
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="q_${q.question_id}" id="r_${q.question_id}_${i}">
                        <label class="form-check-label" for="r_${q.question_id}_${i}">${opt}</label>
                    </div>`
                )
                .join("");
            break;

        case "CHECKBOX":
            const checkboxOptions = settings.options || [];
            inputHTML = checkboxOptions
                .map(
                    (opt, i) => `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="c_${q.question_id}_${i}">
                        <label class="form-check-label" for="c_${q.question_id}_${i}">${opt}</label>
                    </div>`
                )
                .join("");
            break;

        case "DROPDOWN":
            const ddOptions = settings.options || [];
            inputHTML = `
                <select class="form-select">
                    ${ddOptions.map((opt) => `<option>${opt}</option>`).join("")}
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
                                    <input type="radio" name="scale_${q.question_id}" class="me-1">${num}
                                </label>
                            `;
                        }).join("")}
                    </div>
                </div>
            `;
            break;

        default:
            inputHTML = `<input type="text" class="form-control" />`;
            break;
    }

    return `
        <div class="question-block mb-4">
            <div class="fw-semibold mb-2">
                ${q.question_text}
                ${q.is_required ? '<span class="text-danger">*</span>' : ""}
            </div>
            ${inputHTML}
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

nextBtn.addEventListener("click", () => {
    if (currentSection === sections.length - 1) {
        alert("미리보기 모드입니다");
        return;
    }
    showSection(currentSection + 1);
});

prevBtn.addEventListener("click", () => {
    if (currentSection > 0) showSection(currentSection - 1);
});

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

window.addEventListener("DOMContentLoaded", loadPreview);
