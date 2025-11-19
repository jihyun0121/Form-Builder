const SETTINGS_TEMPLATES = {
    SHORT_TEXT: {
        max_length: null,
        validation: null,
    },
    LONG_TEXT: {
        max_length: 500,
        validation: null,
    },
    RADIO: {
        options: ["옵션 1", "옵션 2"],
        randomize_options: false,
        branching: {},
    },
    CHECKBOX: {
        options: ["옵션 1", "옵션 2"],
        min_select: 0,
        max_select: null,
        allow_other: false,
        randomize_options: false,
    },
    DROPDOWN: {
        options: ["옵션 1", "옵션 2"],
        randomize_options: false,
    },
    SCALE: {
        min: 1,
        max: 5,
        labels: ["최소", "최대"],
    },
    DATE: {
        date_format: "YYYY-MM-DD",
        include_time: false,
    },
    TIME: {
        time_format: "HH:mm",
        type: "time",
    },
    SLIDER: {
        min: 0,
        max: 100,
        step: 1,
        show_value: true,
    },
    MATRIX_RADIO: {
        rows: ["행 1", "행 2"],
        columns: ["열 1", "열 2"],
        randomize_rows: false,
        one_response_per_row: true,
    },
    MATRIX_CHECKBOX: {
        rows: ["행 1", "행 2"],
        columns: ["열 1", "열 2"],
        randomize_rows: false,
    },
    RANKING: {
        options: ["옵션 1", "옵션 2"],
        randomize_options: false,
    },
};

const blocksContainer = document.getElementById("blocksContainer");
const formTitleInput = document.getElementById("formTitleInput");
const formDescriptionInput = document.getElementById("formDescriptionInput");

const addQuestionBtn = document.getElementById("addQuestionBtn");
const sideAddQuestionBtn = document.getElementById("sideAddQuestionBtn");
const sideAddSectionBtn = document.getElementById("sideAddSectionBtn");

const emptyHintEl = document.getElementById("emptyHint");
const debugOutput = document.getElementById("debugOutput");

const urlParams = new URLSearchParams(window.location.search);
const formId = urlParams.get("formId");

let tempIdCounter = 1;
let firstSectionId = null;

function parseApiResponse(res) {
    if (res.section) return res.section;
    if (res.question) return res.question;
    return res;
}

function getAllBlocks() {
    return [...blocksContainer.children].filter((b) => b.dataset.blockType !== "title");
}

function getBlocksBySection(sectionId) {
    const all = getAllBlocks();
    const arr = [];
    let active = false;
    for (const b of all) {
        if (b.dataset.blockType === "section" && b.dataset.sectionId === sectionId) {
            active = true;
            continue;
        }
        if (active) {
            if (b.dataset.blockType === "section") break;
            arr.push(b);
        }
    }
    return arr;
}

function getBranchingTargets() {
    const sections = [...blocksContainer.querySelectorAll("[data-block-type='section']")];
    const targets = [];

    targets.push({ value: "next", label: "다음 섹션으로 진행하기" });

    sections.forEach((s) => {
        const sid = s.dataset.sectionId;
        const title = s.querySelector(".section-title-input")?.value || "제목 없음";
        targets.push({ value: sid, label: `섹션 ${sid} (${title})` });
    });

    targets.push({ value: "submit", label: "설문지 제출" });

    return targets;
}

function renderOptionSettings(card) {
    const typeSelect = card.querySelector(".question-type-select");
    const type = typeSelect.value;
    const container = card.querySelector(".option-settings-container");
    const settings = card._settings || {};

    container.innerHTML = "";

    if (type === "SHORT_TEXT" || type === "LONG_TEXT") {
        const s = {
            placeholder: settings.placeholder || (type === "SHORT_TEXT" ? "답변을 입력하세요" : "자세히 입력해주세요"),
            max_length: settings.max_length || (type === "SHORT_TEXT" ? 100 : 500),
            validation: settings.validation || { type: "text", condition: "", value: "" },
        };

        container.innerHTML = `
            <div class="mb-2">
                <label class="form-label small mb-1">최대 문자 수</label>
                <input type="number" min="1" class="form-control form-control-sm opt-maxlen-input" value="${s.max_length}">
            </div>
            <div class="mb-2">
                <label class="form-label small mb-1">응답 확인 (검증)</label>
                <div class="d-flex gap-2">
                    <select class="form-select form-select-sm opt-val-type" style="max-width:120px">
                        <option value="">없음</option>
                        <option value="text" ${s.validation.type === "text" ? "selected" : ""}>텍스트</option>
                        <option value="number" ${s.validation.type === "number" ? "selected" : ""}>숫자</option>
                        <option value="regex" ${s.validation.type === "regex" ? "selected" : ""}>정규식</option>
                    </select>
                    <select class="form-select form-select-sm opt-val-condition" style="max-width:160px">
                        <option value="">조건 없음</option>
                        <option value="이메일" ${s.validation.condition === "이메일" ? "selected" : ""}>이메일</option>
                        <option value="URL" ${s.validation.condition === "URL" ? "selected" : ""}>URL</option>
                        <option value="최대 문자 수" ${s.validation.condition === "최대 문자 수" ? "selected" : ""}>최대 문자 수</option>
                        <option value="최소 문자 수" ${s.validation.condition === "최소 문자 수" ? "selected" : ""}>최소 문자 수</option>
                    </select>
                    <input type="text" class="form-control form-control-sm opt-val-value" placeholder="조건 값" value="${s.validation.value || ""}">
                </div>
            </div>
            <div class="mb-2">
                <label class="form-label small mb-1">오류 메시지</label>
                <input type="text" class="form-control form-control-sm opt-error-msg" value="${settings.error_message || ""}" placeholder="검증 실패 시 표시할 메시지">
            </div>
        `;
    }

    if (type === "RADIO" || type === "CHECKBOX" || type === "DROPDOWN") {
        const s = {
            options: settings.options || ["옵션 1", "옵션 2"],
            randomize_options: settings.randomize_options || false,
            allow_other: settings.allow_other || false,
            min_select: settings.min_select ?? "",
            max_select: settings.max_select ?? "",
            branching: settings.branching || {},
        };

        const targets = getBranchingTargets();

        container.innerHTML = `
            <div class="mb-2">
                <label class="form-label small mb-1">선택지 (줄바꿈으로 구분)</label>
                <textarea class="form-control form-control-sm opt-options-textarea" rows="3">${s.options.join("\n")}</textarea>
            </div>

            <div class="mb-2 d-flex align-items-center gap-3 flex-wrap">
                <div class="form-check">
                    <input class="form-check-input opt-randomize-options" type="checkbox" ${s.randomize_options ? "checked" : ""}>
                    <label class="form-check-label small">옵션 순서 무작위로 섞기</label>
                </div>
                ${
                    type === "CHECKBOX"
                        ? `
                <div class="d-flex align-items-center gap-1 small">
                    최소 선택
                    <input type="number" min="0" class="form-control form-control-sm opt-min-select" style="width:70px" value="${s.min_select}">
                    최대 선택
                    <input type="number" min="0" class="form-control form-control-sm opt-max-select" style="width:70px" value="${s.max_select}">
                </div>
                <div class="form-check">
                    <input class="form-check-input opt-allow-other" type="checkbox" ${s.allow_other ? "checked" : ""}>
                    <label class="form-check-label small">'기타' 옵션 허용</label>
                </div>
                `
                        : ""
                }
            </div>

            <div class="mt-3">
                <div class="form-check mb-2">
                    <input class="form-check-input opt-use-branching" type="checkbox" ${Object.keys(s.branching).length ? "checked" : ""}>
                    <label class="form-check-label small">답변을 기준으로 섹션 이동 (분기)</label>
                </div>
                <div class="opt-branching-area ${Object.keys(s.branching).length ? "" : "d-none"}">
                    <table class="table table-sm mb-0">
                        <thead>
                            <tr>
                                <th class="small" style="width:50%">선택지</th>
                                <th class="small" style="width:50%">이동할 섹션</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        `;

        const tbody = container.querySelector(".opt-branching-area tbody");
        const lines = s.options;

        lines.forEach((optTextRaw) => {
            const optText = optTextRaw.trim();
            if (!optText) return;

            const tr = document.createElement("tr");

            const tdLabel = document.createElement("td");
            tdLabel.className = "small align-middle";
            tdLabel.textContent = optText;

            const tdSelect = document.createElement("td");
            const sel = document.createElement("select");
            sel.className = "form-select form-select-sm opt-branch-target";
            sel.dataset.optionLabel = optText;

            targets.forEach((t) => {
                const o = document.createElement("option");
                o.value = t.value;
                o.textContent = t.label;
                if (s.branching[optText] === t.value) o.selected = true;
                sel.appendChild(o);
            });

            tdSelect.appendChild(sel);

            tr.appendChild(tdLabel);
            tr.appendChild(tdSelect);
            tbody.appendChild(tr);
        });
    }

    if (type === "SCALE") {
        const s = {
            min: settings.min ?? 1,
            max: settings.max ?? 5,
            labels: settings.labels || ["매우 나쁨", "매우 좋음"],
        };

        container.innerHTML = `
            <div class="mb-2 d-flex align-items-center gap-2">
                <span class="small">값 범위</span>
                <input type="number" class="form-control form-control-sm opt-scale-min" style="width:80px" value="${s.min}">
                <span>~</span>
                <input type="number" class="form-control form-control-sm opt-scale-max" style="width:80px" value="${s.max}">
            </div>
            <div class="mb-2 d-flex align-items-center gap-2">
                <span class="small">라벨</span>
                <input type="text" class="form-control form-control-sm opt-scale-label-min" style="width:40%" value="${s.labels[0] || ""}" placeholder="왼쪽 라벨">
                <input type="text" class="form-control form-control-sm opt-scale-label-max" style="width:40%" value="${s.labels[1] || ""}" placeholder="오른쪽 라벨">
            </div>
        `;
    }

    if (type === "DATE") {
        const s = {
            date_format: settings.date_format || "YYYY-MM-DD",
            include_time: settings.include_time || false,
            validation: settings.validation || { type: "", condition: "", value: "" },
        };

        container.innerHTML = `
            <div class="mb-2 d-flex align-items-center gap-2">
                <span class="small">형식</span>
                <select class="form-select form-select-sm opt-date-format" style="max-width:150px">
                    <option value="YYYY-MM-DD" ${s.date_format === "YYYY-MM-DD" ? "selected" : ""}>YYYY-MM-DD</option>
                    <option value="YYYY.MM.DD" ${s.date_format === "YYYY.MM.DD" ? "selected" : ""}>YYYY.MM.DD</option>
                </select>
                <div class="form-check ms-2">
                    <input class="form-check-input opt-include-time" type="checkbox" ${s.include_time ? "checked" : ""}>
                    <label class="form-check-label small">시간 포함</label>
                </div>
            </div>
            <div class="mb-2">
                <label class="form-label small mb-1">응답 확인</label>
                <div class="d-flex gap-2">
                    <select class="form-select form-select-sm opt-date-condition" style="max-width:150px">
                        <option value="">조건 없음</option>
                        <option value="이후" ${s.validation.condition === "이후" ? "selected" : ""}>이후</option>
                        <option value="이전" ${s.validation.condition === "이전" ? "selected" : ""}>이전</option>
                        <option value="사이값" ${s.validation.condition === "사이값" ? "selected" : ""}>사이값</option>
                    </select>
                    <input type="text" class="form-control form-control-sm opt-date-value" placeholder="2025-01-01 또는 2025-01-01,2025-12-31" value="${s.validation.value || ""}">
                </div>
            </div>
        `;
    }

    if (type === "TIME") {
        const s = {
            time_format: settings.time_format || "HH:mm",
            type: settings.type || "time",
        };

        container.innerHTML = `
            <div class="mb-2 d-flex align-items-center gap-2">
                <span class="small">형식</span>
                <select class="form-select form-select-sm opt-time-format" style="max-width:150px">
                    <option value="HH:mm" ${s.time_format === "HH:mm" ? "selected" : ""}>HH:mm</option>
                    <option value="HH:mm:ss" ${s.time_format === "HH:mm:ss" ? "selected" : ""}>HH:mm:ss</option>
                </select>
            </div>
            <div class="mb-2">
                <label class="form-label small mb-1">답변 유형</label>
                <div class="d-flex gap-3 small">
                    <div class="form-check">
                        <input class="form-check-input opt-time-type" type="radio" name="timeType-${card.dataset.questionId}" value="time" ${s.type === "time" ? "checked" : ""}>
                        <label class="form-check-label">시간</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input opt-time-type" type="radio" name="timeType-${card.dataset.questionId}" value="duration" ${s.type === "duration" ? "checked" : ""}>
                        <label class="form-check-label">기간</label>
                    </div>
                </div>
            </div>
        `;
    }
}

function collectSettingsFromUI(card) {
    const type = card.querySelector(".question-type-select").value;
    const container = card.querySelector(".option-settings-container");
    const settings = {};

    if (type === "SHORT_TEXT" || type === "LONG_TEXT") {
        settings.placeholder = container.querySelector(".opt-placeholder-input")?.value || "";
        settings.max_length = Number(container.querySelector(".opt-maxlen-input")?.value || 0) || null;

        const valType = container.querySelector(".opt-val-type")?.value || "";
        const cond = container.querySelector(".opt-val-condition")?.value || "";
        const valValue = container.querySelector(".opt-val-value")?.value || "";

        settings.validation = {
            type: valType,
            condition: cond,
            value: valValue,
        };
        settings.error_message = container.querySelector(".opt-error-msg")?.value || "";
    }

    if (type === "RADIO" || type === "CHECKBOX" || type === "DROPDOWN") {
        const textarea = container.querySelector(".opt-options-textarea");
        const lines = (textarea?.value || "")
            .split("\n")
            .map((v) => v.trim())
            .filter((v) => v);

        settings.options = lines;
        settings.randomize_options = container.querySelector(".opt-randomize-options")?.checked || false;

        if (type === "CHECKBOX") {
            settings.min_select = container.querySelector(".opt-min-select")?.value || "";
            settings.max_select = container.querySelector(".opt-max-select")?.value || "";
            settings.allow_other = container.querySelector(".opt-allow-other")?.checked || false;
        }

        const useBranching = container.querySelector(".opt-use-branching")?.checked || false;
        if (useBranching) {
            const branching = {};
            container.querySelectorAll(".opt-branch-target").forEach((sel) => {
                const label = sel.dataset.optionLabel;
                if (label && sel.value) branching[label] = sel.value;
            });
            settings.branching = branching;
        } else {
            settings.branching = {};
        }
    }

    if (type === "SCALE") {
        settings.min = Number(container.querySelector(".opt-scale-min")?.value || 1);
        settings.max = Number(container.querySelector(".opt-scale-max")?.value || 5);
        settings.labels = [container.querySelector(".opt-scale-label-min")?.value || "", container.querySelector(".opt-scale-label-max")?.value || ""];
    }

    if (type === "DATE") {
        settings.date_format = container.querySelector(".opt-date-format")?.value || "YYYY-MM-DD";
        settings.include_time = container.querySelector(".opt-include-time")?.checked || false;
        const cond = container.querySelector(".opt-date-condition")?.value || "";
        const val = container.querySelector(".opt-date-value")?.value || "";

        settings.validation = {
            type: "date",
            condition: cond,
            value: val,
        };
    }

    if (type === "TIME") {
        settings.time_format = container.querySelector(".opt-time-format")?.value || "HH:mm";
        const checked = container.querySelector(".opt-time-type:checked");
        settings.type = checked?.value || "time";
    }

    return settings;
}

function regenerateOrderNumbers() {
    const blocks = [...blocksContainer.children];

    const firstSection = blocks.find((b) => b.dataset.blockType === "section");
    if (!firstSection) return;

    firstSectionId = firstSection.dataset.sectionId;

    const sectionMap = {};
    let currentSection = firstSectionId;

    for (const b of blocks) {
        if (b.dataset.blockType === "section") {
            currentSection = b.dataset.sectionId;
            if (!sectionMap[currentSection]) sectionMap[currentSection] = 1;
            continue;
        }

        if (b.dataset.blockType === "question") {
            if (!sectionMap[currentSection]) sectionMap[currentSection] = 1;
            const order = sectionMap[currentSection]++;

            b.dataset.sectionId = currentSection;
            b.dataset.orderNum = String(order);
        }
    }
}

if (blocksContainer) {
    new Sortable(blocksContainer, {
        animation: 150,
        handle: ".drag-handle",
        ghostClass: "bg-light",
        filter: "[data-block-type='section'], [data-block-type='title']",
        onEnd(evt) {
            const item = evt.item;

            if (item.dataset.blockType === "section" || item.dataset.blockType === "title") {
                evt.from.insertBefore(item, evt.from.children[evt.oldIndex]);
                return;
            }

            const newSectionId = getSectionIdOfBlock(item);
            item.dataset.sectionId = newSectionId;

            regenerateOrderNumbers();
            updateDebug();

            FormAPI.updateQuestion(item.dataset.questionId, {
                section_id: newSectionId,
                order_num: Number(item.dataset.orderNum),
            });
        },
    });
}

function collectFormStructure() {
    const blocks = [...blocksContainer.children];

    const result = {
        title: formTitleInput?.value || "",
        description: formDescriptionInput?.value || "",
        sections: [],
    };

    const sectionIds = ["1"];

    blocks.forEach((block) => {
        if (block.dataset.blockType === "section") {
            if (!sectionIds.includes(block.dataset.sectionId)) {
                sectionIds.push(block.dataset.sectionId);
            }
        }
    });

    for (const id of sectionIds) {
        const title = id === "1" ? "" : "";
        const description = "";

        const section = {
            sectionId: id,
            title: title,
            description: description,
            questions: [],
        };

        const blocksInSection = getBlocksBySection(id);

        for (const b of blocksInSection) {
            if (b.dataset.blockType === "question") {
                section.questions.push({
                    question_id: b.dataset.questionId,
                    question_text: b.querySelector(".question-text-input")?.value || "",
                    description: b.querySelector(".question-description-input")?.value || "",
                    question_type: b.querySelector(".question-type-select")?.value || "SHORT_TEXT",
                    is_required: b.querySelector(".question-required-switch")?.checked || false,
                    order_num: Number(b.dataset.orderNum) || 1,
                });
            }
        }

        result.sections.push(section);
    }

    return result;
}

function updateDebug() {
    if (!debugOutput) return;
    const data = collectFormStructure();
    debugOutput.textContent = JSON.stringify(data, null, 2);
}

function generateTempId(prefix) {
    return `${prefix}-${Date.now()}-${tempIdCounter++}`;
}

function createQuestionBlock(initial = {}, insertAfter = null) {
    const card = document.createElement("div");
    card.className = "card block-qeustion-card question-block";
    card.dataset.blockType = "question";
    card.dataset.questionId = initial.questionId || generateTempId("q");

    card._settings = initial.settings || {};

    const sectionId = initial.sectionId || firstSectionId;
    card.dataset.sectionId = sectionId;

    card.innerHTML = `
        <div class="card-body">
            <span class="drag-handle"><i class="bi bi-three-dots"></i></span>
            <div class="question-header d-flex justify-content-between align-items-start">
                <div class="question-left flex-grow-1">
                    <div class="editor-wrapper mb-1">
                        <div class="question-text-input form-input-base editable" contenteditable="true" data-placeholder="질문">${initial.question_text || ""}</div>
                        <div class="editor-toolbar small">
                            <button class="toolbar-btn" data-cmd="bold"><i class="bi bi-type-bold"></i></button>
                            <button class="toolbar-btn" data-cmd="italic"><i class="bi bi-type-italic"></i></button>
                            <button class="toolbar-btn" data-cmd="underline"><i class="bi bi-type-underline"></i></button>
                            <button class="toolbar-btn" data-cmd="removeFormat"><i class="bi bi-x-circle"></i></button>
                        </div>
                    </div>
                </div>
                <div class="question-right ms-3">
                    <select class="form-select form-select-sm question-type-select" style="min-width: 150px">
                        <option value="SHORT_TEXT">단답형</option>
                        <option value="LONG_TEXT">서술형</option>
                        <option value="RADIO">객관식</option>
                        <option value="CHECKBOX">체크박스</option>
                        <option value="DROPDOWN">드롭다운</option>
                        <option value="SCALE">등급(척도)</option>
                        <option value="DATE">날짜</option>
                        <option value="TIME">시간</option>
                    </select>
                </div>
            </div>

            <div class="editor-wrapper mb-2">
                <div class="question-description-input form-input-base editable" contenteditable="true" data-placeholder="설명">${initial.description || ""}</div>
                <div class="editor-toolbar small">
                    <button class="toolbar-btn" data-cmd="bold"><i class="bi bi-type-bold"></i></button>
                    <button class="toolbar-btn" data-cmd="italic"><i class="bi bi-type-italic"></i></button>
                    <button class="toolbar-btn" data-cmd="underline"><i class="bi bi-type-underline"></i></button>
                    <button class="toolbar-btn" data-cmd="insertOrderedList"><i class="bi bi-list-ol"></i></button>
                    <button class="toolbar-btn" data-cmd="insertUnorderedList"><i class="bi bi-list-ul"></i></button>
                    <button class="toolbar-btn" data-cmd="removeFormat"><i class="bi bi-x-circle"></i></button>
                </div>
            </div>

            <div class="question-preview-area mt-3 mb-3">${renderPreview(initial.question_type || "SHORT_TEXT")}</div>

            <div class="question-options-panel mt-2 d-none">
                <div class="option-settings-container"></div>
            </div>

            <div class="question-footer d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                <div class="form-check form-switch">
                    <input class="form-check-input question-required-switch" type="checkbox" ${initial.is_required ? "checked" : ""} />
                    <label class="form-check-label small">필수</label>
                </div>

                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-outline-danger btn-sm btn-delete"><i class="bi bi-trash"></i></button>
                    <button type="button" class="btn btn-sm btn-outline-secondary btn-options-toggle me-2"><i class="bi bi-three-dots"></i></button>
                </div>
            </div>
        </div>
    `;

    attachQuestionEvents(card);

    if (insertAfter) blocksContainer.insertBefore(card, insertAfter.nextElementSibling);
    else blocksContainer.appendChild(card);

    regenerateOrderNumbers();
    updateDebug();
}

function createSectionBlock(initial = {}) {
    const card = document.createElement("div");
    card.className = "card block-card";
    card.dataset.blockType = "section";
    card.dataset.sectionId = initial.sectionId || generateTempId("s");

    card.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <input type="text" class="form-question-editable form-input-base form-control form-control-sm section-title-input me-2" placeholder="섹션 제목" value="${initial.title || ""}"/>
                <button class="btn btn-outline-danger btn-sm btn-delete-section">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <div class="mb-2"><input type="text" class="form-description-editable form-input-base form-control form-control-sm section-description-input" placeholder="섹션 설명 (선택 사항)" value="${initial.description || ""}"/></div>
        </div>
    `;

    attachSectionEvents(card);

    blocksContainer.appendChild(card);

    // createGotoBlockForSection(card.dataset.sectionId);
    // toggleGotoVisibility();
    updateDebug();
}

function renderPreview(type) {
    switch (type) {
        case "LONG_TEXT":
            return `<textarea class="form-control form-control-sm" disabled placeholder="긴 답변"></textarea>`;
        case "RADIO":
            return `
                <div class="form-check"><input class="form-check-input" type="radio" disabled><label class="form-input-base form-check-label small">옵션 1</label></div>
                <div class="form-check"><input class="form-check-input" type="radio" disabled><label class="form-input-base form-check-label small">옵션 2</label></div>
            `;
        case "CHECKBOX":
            return `
                <div class="form-check"><input class="form-check-input" type="checkbox" disabled><label class="form-input-base form-check-label small">옵션 1</label></div>
                <div class="form-check"><input class="form-check-input" type="checkbox" disabled><label class="form-input-base form-check-label small">옵션 2</label></div>
            `;
        case "DROPDOWN":
            return `<select class="form-select form-select-sm" disabled><option>옵션 1</option><option>옵션 2</option></select>`;
        case "SCALE":
            return `<div class="small text-muted mb-1">1 ~ 5</div>`;
        case "DATE":
            return `<input type="date" class="form-control form-control-sm" disabled>`;
        case "TIME":
            return `<input type="time" class="form-control form-control-sm" disabled>`;
        default:
            return `<input type="text" disabled class="form-control form-control-sm" placeholder="단답형">`;
    }
}

function openSettingsPanel(questionCard) {
    const qid = questionCard.dataset.questionId;
    const type = questionCard.querySelector(".question-type-select").value;

    let settings = questionCard.settings || JSON.parse(JSON.stringify(SETTINGS_TEMPLATES[type]));

    const modal = document.createElement("div");
    modal.className = "settings-modal-backdrop";
    modal.innerHTML = `
        <div class="settings-modal">
            <h6 class="fw-bold mb-3">옵션 더보기</h6>
            <div class="settings-body"></div>
            <div class="text-end mt-3">
                <button class="btn btn-secondary btn-close-settings">닫기</button>
            </div>
        </div>
    `;

    renderSettingsUI(type, settings, modal.querySelector(".settings-body"));

    attachSettingsEvents(modal, questionCard, settings);

    document.body.appendChild(modal);
}

function attachQuestionEvents(card) {
    const questionId = card.dataset.questionId;
    const typeSelect = card.querySelector(".question-type-select");
    const deleteBtn = card.querySelector(".btn-delete");
    const textInput = card.querySelector(".question-text-input");
    const descInput = card.querySelector(".question-description-input");
    const requiredSwitch = card.querySelector(".question-required-switch");

    const optionsPanel = card.querySelector(".question-options-panel");
    const optionsToggleBtn = card.querySelector(".btn-options-toggle");

    optionsToggleBtn.addEventListener("click", () => {
        const isHidden = optionsPanel.classList.contains("d-none");
        if (isHidden) {
            renderOptionSettings(card);
            optionsPanel.classList.remove("d-none");
        } else {
            optionsPanel.classList.add("d-none");
        }
    });

    typeSelect.addEventListener("change", async () => {
        card.querySelector(".question-preview-area").innerHTML = renderPreview(typeSelect.value);

        if (!card._settings) card._settings = {};
        if (!optionsPanel.classList.contains("d-none")) {
            renderOptionSettings(card);
        }

        await FormAPI.updateQuestion(questionId, {
            question_type: typeSelect.value,
            settings: card._settings,
        });

        updateDebug();
    });

    textInput.addEventListener("blur", async () => {
        await FormAPI.updateQuestion(questionId, {
            question_text: textInput.innerHTML.trim(),
        });
        updateDebug();
    });

    descInput.addEventListener("blur", async () => {
        await FormAPI.updateQuestion(questionId, {
            description: descInput.innerHTML.trim(),
        });
        updateDebug();
    });

    requiredSwitch.addEventListener("change", async () => {
        await FormAPI.updateQuestion(questionId, {
            is_required: requiredSwitch.checked,
        });
    });

    card.addEventListener(
        "blur",
        async (e) => {
            if (!optionsPanel.contains(e.target)) return;

            const newSettings = collectSettingsFromUI(card);
            card._settings = newSettings;

            await FormAPI.updateQuestion(questionId, {
                settings: newSettings,
            });
        },
        true
    );
    deleteBtn.addEventListener("click", async () => {
        await FormAPI.deleteQuestion(questionId);
        card.remove();
        regenerateOrderNumbers();
        updateDebug();
    });
}

function attachSectionEvents(card) {
    const sectionId = card.dataset.sectionId;
    const titleInput = card.querySelector(".section-title-input");
    const descInput = card.querySelector(".section-description-input");
    const deleteBtn = card.querySelector(".btn-delete-section");

    titleInput.addEventListener("blur", async () => {
        await FormAPI.updateSection(sectionId, {
            title: titleInput.value.trim(),
        });
    });

    descInput.addEventListener("blur", async () => {
        await FormAPI.updateSection(sectionId, {
            description: descInput.value.trim(),
        });
    });

    deleteBtn.addEventListener("click", async () => {
        await FormAPI.deleteSection(sectionId);
        deleteSectionWithChildren(sectionId);
        updateDebug();
    });
}

// function createGotoBlockForSection(sectionId) {
//     const goto = document.createElement("div");
//     goto.className = "goto d-flex-row";
//     goto.dataset.blockType = "sectionGoto";
//     goto.dataset.sectionId = sectionId;

//     goto.innerHTML = `
//         <label class="small fw-semibold">이 섹션을 완료하면</label>
//         <select class="section-goto-select form-select form-select-sm"></select>
//     `;

//     attachGotoEvents(goto);

//     const last = findLastBlockOfSection(sectionId);
//     if (last) blocksContainer.insertBefore(goto, last.nextElementSibling);
//     else {
//         const sectionBlock = [...blocksContainer.children].find((b) => b.dataset.blockType === "section" && b.dataset.sectionId === sectionId);
//         blocksContainer.insertBefore(goto, sectionBlock.nextElementSibling);
//     }

//     updateGotoOptionsAll();
// }

// function attachGotoEvents(block) {
//     const sectionId = block.dataset.sectionId;
//     const select = block.querySelector(".section-goto-select");

//     select.addEventListener("change", async () => {
//         await FormAPI.updateSection(sectionId, {
//             jump_to: select.value,
//         });
//     });
// }

// function updateGotoOptionsAll() {
//     const sections = [...blocksContainer.querySelectorAll("[data-block-type='section']")];
//     const gotoBlocks = [...blocksContainer.querySelectorAll("[data-block-type='sectionGoto']")];

//     gotoBlocks.forEach((goto) => {
//         const sectionId = goto.dataset.sectionId;
//         const select = goto.querySelector(".section-goto-select");

//         select.innerHTML = "";

//         const nextOption = document.createElement("option");
//         nextOption.value = "next";
//         nextOption.textContent = "다음 섹션으로 진행하기";
//         select.appendChild(nextOption);

//         sections.forEach((s) => {
//             const sid = s.dataset.sectionId;
//             const title = s.querySelector(".section-title-input")?.value || "제목 없음";

//             const opt = document.createElement("option");
//             opt.value = sid;
//             opt.textContent = `섹션 ${sid} (${title})`;

//             if (sid === sectionId) return;

//             select.appendChild(opt);
//         });

//         const submitOpt = document.createElement("option");
//         submitOpt.value = "submit";
//         submitOpt.textContent = "설문지 제출";
//         select.appendChild(submitOpt);
//     });
// }

function deleteSectionWithChildren(sectionId) {
    const blocks = [...blocksContainer.children];

    let removeMode = false;
    for (const b of blocks) {
        if (b.dataset.blockType === "section" && b.dataset.sectionId === sectionId) {
            b.remove();
            removeMode = true;
            continue;
        }
        if (removeMode) {
            if (b.dataset.blockType === "section") break;
            b.remove();
        }
    }

    // [...blocksContainer.querySelectorAll("[data-block-type='sectionGoto']")].forEach((g) => {
    //     if (g.dataset.sectionId === sectionId) g.remove();
    // });

    // updateGotoOptionsAll();
    regenerateOrderNumbers();
}

// function toggleGotoVisibility() {
//     const count = blocksContainer.querySelectorAll("[data-block-type='section']").length;

//     const gotoBlocks = blocksContainer.querySelectorAll("[data-block-type='sectionGoto']");
//     gotoBlocks.forEach((g) => {
//         g.style.display = count > 1 ? "flex" : "none";
//     });
// }

function getSectionIdOfBlock(block) {
    if (!block) return firstSectionId;
    while (block) {
        if (block.dataset.blockType === "section") return block.dataset.sectionId;
        block = block.previousElementSibling;
    }
    return firstSectionId;
}

function findLastSectionId() {
    const sections = [...blocksContainer.querySelectorAll("[data-block-type='section']")];
    if (sections.length === 0) return firstSectionId;
    return sections[sections.length - 1].dataset.sectionId;
}

function findLastBlockOfSection(sectionId) {
    const blocks = [...blocksContainer.children];
    let last = null;
    for (const b of blocks) {
        if (b.dataset.sectionId === sectionId && b.dataset.blockType === "question") {
            last = b;
        }
        if (b.dataset.blockType === "section" && b.dataset.sectionId !== sectionId) continue;
    }
    return last;
}

function exportFormStructure() {
    regenerateOrderNumbers();

    const blocks = [...blocksContainer.children];
    const sections = {};
    const result = {
        title: formTitleInput.innerHTML,
        description: formDescriptionInput.innerHTML,
        sections: [],
    };

    sections[firstSectionId] = {
        sectionId: firstSectionId,
        title: null,
        description: null,
        questions: [],
    };

    for (const b of blocks) {
        if (b.dataset.blockType === "section") {
            sections[b.dataset.sectionId] = {
                sectionId: b.dataset.sectionId,
                title: b.querySelector(".section-title-input")?.value || "",
                description: b.querySelector(".section-description-input")?.value || "",
                questions: [],
            };
            continue;
        }

        if (b.dataset.blockType === "question") {
            sections[b.dataset.sectionId].questions.push({
                question_id: b.dataset.questionId,
                question_text: b.querySelector(".question-text-input")?.value || "",
                description: b.querySelector(".question-description-input")?.value || "",
                question_type: b.querySelector(".question-type-select")?.value || "SHORT_TEXT",
                is_required: b.querySelector(".question-required-switch")?.checked || false,
                order_num: b.dataset.orderNum,
                section_id: b.dataset.sectionId,
            });
        }
    }

    result.sections = Object.values(sections);
    return result;
}

sideAddQuestionBtn?.addEventListener("click", async () => {
    try {
        let targetSectionId = findLastSectionId();

        const res = await FormAPI.addQuestion(formId, {
            section_id: targetSectionId,
            question_text: "",
            question_type: "SHORT_TEXT",
            description: "",
            is_required: false,
            order_num: 999,
            settings: {},
        });

        const q = res.question ?? res;

        const lastBlock = findLastBlockOfSection(targetSectionId);
        createQuestionBlock(
            {
                questionId: q.question_id,
                question_text: q.question_text,
                description: q.description,
                question_type: q.question_type,
                is_required: q.is_required,
                sectionId: targetSectionId,
                settings: q.settings || {},
            },
            lastBlock
        );

        regenerateOrderNumbers();
        updateDebug();
    } catch (err) {
        alert("질문 생성 중 문제가 발생했습니다.");
    }
});

sideAddSectionBtn?.addEventListener("click", async () => {
    try {
        const sectionCount = blocksContainer.querySelectorAll("[data-block-type='section']").length;

        const res = await FormAPI.addSection(formId, {
            title: "제목없는 섹션",
            description: "",
            order_num: sectionCount + 1,
        });

        const s = res.section ?? res;
        createSectionBlock({
            sectionId: s.section_id,
            title: s.title || "",
            description: s.description || "",
        });

        regenerateOrderNumbers();
        updateDebug();
    } catch (err) {
        alert("섹션 추가 중 오류가 발생했습니다.");
    }
});

window.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await FormAPI.getFormStructure(formId);
        const data = res;

        const titleBlock = blocksContainer.querySelector("[data-block-type='title']");

        if (titleBlock) {
            blocksContainer.innerHTML = "";
            blocksContainer.appendChild(titleBlock);
        }

        if (formTitleInput) formTitleInput.innerHTML = data.title || "";
        if (formDescriptionInput) formDescriptionInput.innerHTML = data.description || "";

        formTitleInput.addEventListener("blur", async () => {
            await FormAPI.updateForm(formId, { title: formTitleInput.innerHTML.trim() });
        });

        formDescriptionInput.addEventListener("blur", async () => {
            await FormAPI.updateForm(formId, { description: formDescriptionInput.innerHTML.trim() });
        });

        if (!data.sections || data.sections.length === 0) {
            const secRes = await FormAPI.addSection(formId, {
                title: "",
                description: "",
                order_num: 1,
            });

            const section = secRes.section ?? secRes;
            firstSectionId = section.section_id;

            const qRes = await FormAPI.addQuestion(formId, {
                section_id: firstSectionId,
                question_text: "",
                question_type: "SHORT_TEXT",
                description: "",
                is_required: false,
                order_num: 1,
                settings: {},
            });

            const q = qRes.question ?? qRes;

            const invisible = document.createElement("div");
            invisible.dataset.blockType = "section";
            invisible.dataset.sectionId = firstSectionId;
            invisible.style.display = "none";
            blocksContainer.appendChild(invisible);

            createQuestionBlock({
                questionId: q.question_id,
                question_text: q.question_text,
                description: q.description,
                question_type: q.question_type,
                is_required: q.is_required,
                sectionId: section.section_id,
                settings: q.settings || {},
            });

            regenerateOrderNumbers();
            updateDebug();
            return;
        }

        firstSectionId = data.sections[0].section_id;

        const invisible = document.createElement("div");
        invisible.dataset.blockType = "section";
        invisible.dataset.sectionId = firstSectionId;
        invisible.style.display = "none";
        blocksContainer.appendChild(invisible);

        for (const s of data.sections) {
            if (s.section_id === firstSectionId) {
                for (const q of s.questions || []) {
                    createQuestionBlock(
                        {
                            questionId: q.question_id,
                            question_text: q.question_text,
                            description: q.description,
                            question_type: q.question_type,
                            is_required: q.is_required,
                            sectionId: s.section_id,
                            settings: q.settings || {},
                        },
                        findLastBlockOfSection(firstSectionId)
                    );
                }
                continue;
            }

            createSectionBlock({
                sectionId: s.section_id,
                title: s.title,
                description: s.description,
            });

            for (const q of s.questions || []) {
                createQuestionBlock(
                    {
                        questionId: q.question_id,
                        question_text: q.question_text,
                        description: q.description,
                        question_type: q.question_type,
                        is_required: q.is_required,
                        sectionId: s.section_id,
                        settings: q.settings || {},
                    },
                    findLastBlockOfSection(s.section_id)
                );
            }
        }

        // for (const s of data.sections) {
        //     if (s.section_id !== firstSectionId) {
        //         createGotoBlockForSection(s.section_id);
        //     }
        // }

        regenerateOrderNumbers();
        // updateGotoOptionsAll();
        // toggleGotoVisibility();
        updateDebug();
    } catch (err) {
        alert("폼 구조를 불러오는 중 오류가 발생했습니다.");
    }
});

document.getElementById("saveBtn")?.addEventListener("click", async () => {
    try {
        const structure = exportFormStructure();
        await FormAPI.updateForm(formId, structure);
        alert("저장되었습니다!");
    } catch (err) {
        alert("저장 중 오류 발생");
    }
});

document.addEventListener("click", (e) => {
    const editors = document.querySelectorAll(".editor-wrapper");
    editors.forEach((wrap) => {
        if (wrap.contains(e.target)) wrap.classList.add("focused-editor");
        else wrap.classList.remove("focused-editor");
    });
});
