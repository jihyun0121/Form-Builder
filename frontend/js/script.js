const recentListEl = document.getElementById("recentList");
const searchInputEl = document.getElementById("searchInput");
const noResultEl = document.getElementById("noResultMessage");
const emptyTemplateCardEl = document.getElementById("emptyTemplateCard");

const recentForms = [
    {
        id: 1,
        title: "IT 쇼 피드백 설문",
        owner: "백지현",
        updatedAt: "2025-11-13",
    },
    {
        id: 2,
        title: "동아리 만족도 조사",
        owner: "뉴미디어소프트웨어과",
        updatedAt: "2025-11-10",
    },
    {
        id: 3,
        title: "프로젝트 팀 회고 설문",
        owner: "Form 팀",
        updatedAt: "2025-11-09",
    },
    {
        id: 4,
        title: "수업 이해도 체크",
        owner: "3학년 2반",
        updatedAt: "2025-11-05",
    },
];

function renderRecentForms(list) {
    recentListEl.innerHTML = "";

    if (!list || list.length === 0) {
        noResultEl.classList.remove("d-none");
        return;
    } else {
        noResultEl.classList.add("d-none");
    }

    list.forEach((form) => {
        const col = document.createElement("div");
        col.className = "col-12 col-md-6";
        col.innerHTML = `
                <div class="row g-3">
                    <div class="col-6 col-sm-4 col-md-3">
                        <div id="emptyTemplateCard" class="card template-card p-3 d-flex flex-column">
                            <div class="template-icon mb-3">
                                <i class="bi bi-plus-lg"></i>
                            </div>
                            <span class="fw-semibold mb-1">빈 템플릿</span>
                            <span class="text-muted" style="font-size: 0.85rem">제목 없는 새 설문지</span>
                        </div>
                    </div>
                </div>
                `;

        recentListEl.appendChild(col);
    });
}

function handleSearch() {
    const keyword = searchInputEl.value.trim().toLowerCase();

    if (keyword === "") {
        renderRecentForms(recentForms);
        return;
    }

    const filtered = recentForms.filter((form) => {
        return form.title.toLowerCase().includes(keyword) || form.owner.toLowerCase().includes(keyword);
    });

    renderRecentForms(filtered);
}

renderRecentForms(recentForms);

searchInputEl.addEventListener("input", handleSearch);

emptyTemplateCardEl.addEventListener("click", () => {
    alert("빈 템플릿으로 새 설문지를 시작합니다. (여기에 라우팅 연결)");
});
