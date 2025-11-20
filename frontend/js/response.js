let formsId = null;
let responses = [];
let responseDetails = {};
let questions = [];

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

        questions = structure.sections.flatMap((section) =>
            section.questions.map((q) => ({
                question_id: q.question_id,
                text: q.question_text,
                type: q.question_type,
            }))
        );
    } catch (err) {
        console.error("질문 불러오기 실패:", err);
    }
}

function renderSummaryTab() {
    const area = document.getElementById("responses");
    area.innerHTML = "";

    if (responses.length === 0) {
        area.innerHTML = `<div class="text-center text-muted">아직 응답이 없습니다.</div>`;
        return;
    }

    area.innerHTML = `<h5 class="fw-semibold mb-3 bg-white p-4" style="border-radius: 8px">응답 요약</h5>`;

    questions.forEach((q) => {
        area.innerHTML += `
            <div class="p-3 mb-3 border rounded bg-light">
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

        select.value = questions[currentIndex].question_id;
        showResponsesByQuestion(questions[currentIndex].question_id);
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

        const results = responses
            .map((r) => responseDetails[r.response_id]?.find((a) => a.question_id === questionId))
            .filter(Boolean)
            .map((a) => a.answer_data);

        if (results.length === 0) {
            area.innerHTML = `<div class="text-muted">응답 없음</div>`;
            return;
        }

        area.innerHTML = results
            .map(
                (a, i) => `
                <div class="mb-2 bg-white res-card">
                    <div class="fw-semibold small mb-1">응답 ${i + 1}</div>
                    <div class="small" style="margin-top: 10px; border-bottom: 1px solid rgba(0, 0, 0, 0.12)">${extractValue(a)}</div>
                </div>
            `
            )
            .join("");
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

    totalText.textContent = ` / ${responses.length}`;

    const prevBtn = document.getElementById("prevResponseBtn");
    const nextBtn = document.getElementById("nextResponseBtn");

    function moveResponse(step) {
        if (responses.length === 0) return;

        let num = Number(numInput.value) + step;

        if (num < 1) num = responses.length;
        if (num > responses.length) num = 1;

        numInput.value = num;
        showSingleResponse(num);
    }

    prevBtn.addEventListener("click", () => moveResponse(-1));
    nextBtn.addEventListener("click", () => moveResponse(1));

    numInput.addEventListener("input", () => showSingleResponse(numInput.value));

    function showSingleResponse(num) {
        const idx = num - 1;
        const r = responses[idx];

        if (!r) {
            area.innerHTML = `<div class="text-muted small">응답 없음</div>`;
            return;
        }

        const detail = responseDetails[r.response_id];

        const questionMap = Object.fromEntries(questions.map((q) => [q.question_id, q.text]));

        area.innerHTML = `
            ${detail
                .map((d) => {
                    const qText = questionMap[d.question_id] || "(삭제된 질문)";
                    return `
                    <div class=" mb-2 bg-light res-card">
                        <div class="fw-semibold small">${qText}</div>
                        <div class="small" style="margin-top: 10px; border-bottom: 1px solid rgba(0, 0, 0, 0.12)">${extractValue(d.answer_data)}</div>
                    </div>`;
                })
                .join("")}
        `;

        document.getElementById("deleteResponseBtn").addEventListener("click", async () => {
            if (!confirm("이 응답을 삭제하시겠습니까?")) return;

            try {
                await FormAPI.deleteResponse(r.response_id);

                responses.splice(idx, 1);
                delete responseDetails[r.response_id];

                document.getElementById("totalResponses").textContent = responses.length;
                totalText.textContent = ` / ${responses.length}`;

                if (responses.length === 0) {
                    area.innerHTML = `<div class="text-muted small">응답이 모두 삭제되었습니다.</div>`;
                    return;
                }

                let nextNum = num;
                if (nextNum > responses.length) nextNum = responses.length;

                numInput.value = nextNum;

                showSingleResponse(nextNum);
            } catch (err) {
                console.error("응답 삭제 실패:", err);
                alert("삭제 중 오류가 발생했습니다.");
            }
        });
    }

    if (responses.length > 0) showSingleResponse(1);
}
