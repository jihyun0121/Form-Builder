let formsId = null;
let responses = [];
let responseDetails = {};
let questions = [];
let formStructure = null;

document.addEventListener("DOMContentLoaded", async () => {
    initTabsUI();

    formsId = new URLSearchParams(location.search).get("formId");
    if (!formsId) return;

    await Promise.all([loadResponses(), loadQuestions()]);

    renderSummaryTab();
    setupQuestionTab();
    setupIndividualTab();
});

function initTabsUI() {
    const tabButtons = document.querySelectorAll(".page-btn");
    const tabs = {
        responses: document.getElementById("responses"),
        question: document.getElementById("question"),
        response: document.getElementById("response"),
    };
    const underline = document.querySelector(".page-underline");

    function moveUnderline(btn) {
        const { left, width } = btn.getBoundingClientRect();
        const parentLeft = btn.parentElement.getBoundingClientRect().left;
        underline.style.width = `${width}px`;
        underline.style.left = `${left - parentLeft}px`;
    }

    function showTab(name, btn) {
        Object.values(tabs).forEach((t) => t.classList.remove("active"));
        tabs[name].classList.add("active");

        tabButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        moveUnderline(btn);
    }

    tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => showTab(btn.dataset.page, btn));
    });

    const activeBtn = document.querySelector(".page-btn.active");
    if (activeBtn) moveUnderline(activeBtn);

    window.addEventListener("resize", () => {
        const active = document.querySelector(".page-btn.active");
        if (active) moveUnderline(active);
    });
}

async function loadResponses() {
    try {
        responses = await FormAPI.getResponseByFormId(formsId);
        document.getElementById("totalResponses").textContent = responses.length;

        for (const r of responses) {
            const answers = await FormAPI.getAnswerByResponseId(r.response_id);
            responseDetails[r.response_id] = answers;
        }
    } catch (err) {
        console.error("응답 불러오기 오류:", err);
    }
}

async function loadQuestions() {
    try {
        const structure = await FormAPI.getFormStructure(formsId);
        formStructure = structure;

        questions = (structure.sections || []).flatMap((section) =>
            (section.questions || []).map((q) => ({
                question_id: q.question_id,
                text: q.question_text,
                type: q.question_type,
            }))
        );
    } catch (err) {
        console.error("질문 불러오기 실패:", err);
    }
}

function getQuestionMeta(questionId) {
    if (!formStructure || !formStructure.sections) return null;

    for (const sec of formStructure.sections) {
        const found = (sec.questions || []).find((q) => q.question_id === questionId);
        if (found) return found;
    }
    return null;
}

function renderSummaryTab() {
    const area = document.getElementById("responses");
    area.innerHTML = "";

    if (responses.length === 0) {
        area.innerHTML = `<div class="text-center text-muted-none">아직 응답이 없습니다.</div>`;
        return;
    }

    area.innerHTML = `<h5 class="fw-semibold mb-3 bg-white p-4" style="border-radius: 8px">응답 요약</h5>`;

    questions.forEach((q) => {
        area.innerHTML += `
            <div class="p-3 mb-3 border rounded bg-white">
                <div class="fw-bold">${q.text}</div>
                <div class="small text-muted">${q.type}</div>
            </div>
        `;
    });
}

function setupQuestionTab() {
    const select = document.getElementById("questionSelect");
    const area = document.getElementById("questionResponseArea");

    const prevBtn = document.getElementById("prevQuestionBtn");
    const nextBtn = document.getElementById("nextQuestionBtn");

    let currentIndex = 0;

    function moveQuestion(step) {
        if (questions.length === 0) return;

        currentIndex += step;

        if (currentIndex < 0) currentIndex = questions.length - 1;
        if (currentIndex >= questions.length) currentIndex = 0;

        const qId = questions[currentIndex].question_id;
        select.value = qId;
        showResponsesByQuestion(qId);
    }

    prevBtn.addEventListener("click", () => moveQuestion(-1));
    nextBtn.addEventListener("click", () => moveQuestion(1));

    select.innerHTML = questions.map((q) => `<option value="${q.question_id}">${q.text}</option>`).join("");

    if (questions.length > 0) showResponsesByQuestion(questions[0].question_id);

    select.addEventListener("change", () => {
        showResponsesByQuestion(Number(select.value));
    });

    function showResponsesByQuestion(questionId) {
        area.innerHTML = "";

        const meta = getQuestionMeta(questionId);
        if (!meta) {
            area.innerHTML = `<div class="text-muted-none">질문 정보를 찾을 수 없습니다.</div>`;
            return;
        }

        const settings = meta.settings || {};
        const options = settings.options || [];

        const answers = responses.map((r) => responseDetails[r.response_id]?.find((a) => a.question_id === questionId)).filter(Boolean);

        if (answers.length === 0) {
            area.innerHTML = `<div class="text-muted-none">응답 없음</div>`;
            return;
        }

        let html = `
            <div class="res-card mb-3 bg-white">
                <div class="fw-semibold mb-1">${meta.question_text}</div>
                ${meta.description ? `<div class="small text-muted mb-2">${meta.description}</div>` : ""}
                <div class="badge bg-white text-dark border small">${meta.question_type}</div>
            </div>
        `;

        answers.forEach((ans, idx) => {
            const data = ans.answer_data;
            let body = "";

            switch (meta.question_type) {
                case "SHORT_TEXT":
                case "LONG_TEXT":
                    body = `
                    <input type="text" class="form-control" value="${data.text || ""}" disabled>
                `;
                    break;

                case "RADIO":
                    body = options
                        .map((opt) => {
                            return `
                                <div class="form-check mb-1">
                                    <input class="form-check-input"
                                        type="radio"
                                        name="radio_${questionId}_${idx}"
                                        value="${opt}"
                                        ${opt === data.selected_option ? "checked" : ""}
                                        disabled>
                                    <label class="form-check-label">${opt}</label>
                                </div>
                            `;
                        })
                        .join("");
                    break;

                case "CHECKBOX":
                    body = options
                        .map((opt) => {
                            return `
                            <div class="form-check mb-1">
                                <input class="form-check-input"
                                    type="checkbox"
                                    value="${opt}"
                                    ${data.selected_options?.includes(opt) ? "checked" : ""}
                                    disabled>
                                <label class="form-check-label">${opt}</label>
                            </div>
                        `;
                        })
                        .join("");
                    break;

                case "DROPDOWN":
                    body = `
                    <select class="form-select" disabled>
                        ${options
                            .map(
                                (opt) => `
                                <option ${opt === data.selected_option ? "selected" : ""}>
                                    ${opt}
                                </option>`
                            )
                            .join("")}
                    </select>
                `;
                    break;

                case "SCALE":
                    const min = settings.min ?? 1;
                    const max = settings.max ?? 5;

                    body = `
                    <div class="d-flex justify-content-between">
                        ${Array.from({ length: max - min + 1 }, (_, i) => {
                            const num = i + min;
                            return `
                                <label class="d-flex align-items-center">
                                    <input
                                        type="radio"
                                        name="scale_${questionId}_${idx}"
                                        value="${num}"
                                        ${data.score === num ? "checked" : ""}
                                        class="form-check-input me-2"
                                        disabled>
                                    ${num}
                                </label>
                            `;
                        }).join("")}
                    </div>
                `;
                    break;
            }

            html += `
                <div class="res-card mb-2 bg-white">
                    <div class="fw-semibold small mb-1">응답 ${idx + 1}</div>
                    <div class="mt-1">${body}</div>
                </div>
            `;
        });

        area.innerHTML = html;
    }
}

function extractValue(data) {
    if (typeof data !== "object" || data === null) return String(data);

    if ("selected_option" in data) return data.selected_option;
    if ("selected_options" in data) return data.selected_options.join(", ");
    if ("text" in data) return data.text;
    if ("score" in data) return data.score;

    return JSON.stringify(data);
}

function setupIndividualTab() {
    const numInput = document.getElementById("responseNumber");
    const totalText = document.getElementById("totalResponseCountText");
    const area = document.getElementById("singleResponseDetail");
    const deleteBtn = document.getElementById("deleteResponseBtn");

    totalText.textContent = ` / ${responses.length}`;

    const prevBtn = document.getElementById("prevResponseBtn");
    const nextBtn = document.getElementById("nextResponseBtn");

    let currentIndex = 0;

    function moveResponse(step) {
        if (responses.length === 0) return;

        currentIndex += step;
        if (currentIndex < 0) currentIndex = responses.length - 1;
        if (currentIndex >= responses.length) currentIndex = 0;

        numInput.value = currentIndex + 1;
        showSingleResponse(currentIndex);
    }

    prevBtn.addEventListener("click", () => moveResponse(-1));
    nextBtn.addEventListener("click", () => moveResponse(1));

    numInput.addEventListener("input", () => {
        let num = Number(numInput.value);
        if (isNaN(num) || num < 1 || num > responses.length) return;
        currentIndex = num - 1;
        showSingleResponse(currentIndex);
    });

    deleteBtn?.addEventListener("click", async () => {
        if (responses.length === 0) return;

        const r = responses[currentIndex];
        if (!r) return;

        if (!confirm("이 응답을 삭제하시겠습니까?")) return;

        try {
            await FormAPI.deleteResponse(r.response_id);

            responses.splice(currentIndex, 1);
            delete responseDetails[r.response_id];

            document.getElementById("totalResponses").textContent = responses.length;
            totalText.textContent = ` / ${responses.length}`;

            if (responses.length === 0) {
                area.innerHTML = `<div class="text-muted small">응답이 모두 삭제되었습니다.</div>`;
                numInput.value = "";
                return;
            }

            if (currentIndex >= responses.length) currentIndex = responses.length - 1;
            numInput.value = currentIndex + 1;
            showSingleResponse(currentIndex);
        } catch (err) {
            console.error("응답 삭제 실패:", err);
            alert("삭제 중 오류가 발생했습니다.");
        }
    });

    function showSingleResponse(idx) {
        const r = responses[idx];
        if (!r) {
            area.innerHTML = `<div class="text-muted-none small">응답 없음</div>`;
            return;
        }

        const detail = responseDetails[r.response_id] || [];
        area.innerHTML = "";

        detail.forEach((d) => {
            const meta = getQuestionMeta(d.question_id);
            if (!meta) return;

            const qText = meta.question_text || "(삭제된 질문)";
            const qType = meta.question_type;
            const settings = meta.settings || {};
            const options = settings.options || [];
            const answer = d.answer_data;

            let inputHTML = "";

            switch (qType) {
                case "SHORT_TEXT":
                case "LONG_TEXT":
                    inputHTML = `
                    <input type="text" class="form-control" value="${answer.text || ""}" disabled>
                `;
                    break;

                case "RADIO":
                    inputHTML = options
                        .map(
                            (opt) => `
                        <div class="form-check mb-1">
                            <input class="form-check-input"
                                type="radio"
                                name="single_radio_${d.question_id}_${idx}"
                                value="${opt}"
                                ${answer.selected_option === opt ? "checked" : ""}
                                disabled>
                            <label class="form-check-label">${opt}</label>
                        </div>
                    `
                        )
                        .join("");
                    break;

                case "CHECKBOX":
                    inputHTML = options
                        .map(
                            (opt) => `
                        <div class="form-check mb-1">
                            <input class="form-check-input"
                                type="checkbox"
                                value="${opt}"
                                ${answer.selected_options?.includes(opt) ? "checked" : ""}
                                disabled>
                            <label class="form-check-label">${opt}</label>
                        </div>
                    `
                        )
                        .join("");
                    break;

                case "DROPDOWN":
                    inputHTML = `
                    <select class="form-select" disabled>
                        ${options
                            .map(
                                (opt) => `
                            <option ${opt === answer.selected_option ? "selected" : ""}>
                                ${opt}
                            </option>
                        `
                            )
                            .join("")}
                    </select>
                `;
                    break;

                case "SCALE": {
                    const min = settings.min ?? 1;
                    const max = settings.max ?? 5;

                    inputHTML = `
                    <div class="d-flex justify-content-between">
                        ${Array.from({ length: max - min + 1 }, (_, i) => {
                            const num = i + min;
                            return `
                                <label>
                                    <input
                                        type="radio"
                                        name="single_scale_${d.question_id}_${idx}"
                                        value="${num}"
                                        ${answer.score === num ? "checked" : ""}
                                        class="form-check-input me-2"
                                        disabled>
                                    ${num}
                                </label>
                            `;
                        }).join("")}
                    </div>
                `;
                    break;
                }

                default:
                    inputHTML = `
                    <div class="p-3 bg-white">${extractValue(answer) || "(미응답)"}</div>
                `;
            }

            area.innerHTML += `
            <div class="res-card mb-3 p-3 bg-white">
                <div class="fw-semibold">${qText}</div>
                <div class="mt-2">${inputHTML}</div>
            </div>
        `;
        });
    }

    if (responses.length > 0) {
        currentIndex = 0;
        numInput.value = 1;
        showSingleResponse(0);
    }
}
