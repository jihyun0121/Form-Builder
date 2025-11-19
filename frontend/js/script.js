const recentListEl = document.getElementById("recentList");
const searchInputEl = document.getElementById("searchInput");
const noResultEl = document.getElementById("noResultMessage");
const emptyTemplateCardEl = document.getElementById("emptyTemplateCard");

let recentForms = [];

window.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("user_id");

    try {
        let forms = [];

        if (userId) {
            try {
                const res = await FormAPI.getFormByUserId(userId);
                forms = Array.isArray(res) ? res : [];
            } catch (err) {
                if (err.error === "해당 사용자가 생성한 설문이 없습니다") {
                    forms = [];
                } else {
                    console.error("폼 목록 불러오기 실패:", err);
                    noResultEl.classList.remove("d-none");
                    noResultEl.textContent = "폼 목록을 불러오는 중 오류가 발생했습니다.";
                    return;
                }
            }
        } else {
            const res = await FormAPI.getAllForms();
            forms = res.data || [];
        }

        recentForms = forms.map((f) => ({
            id: f.form_id ?? f.id,
            title: f.title || "제목 없는 설문지",
            updatedAt: f.updated_at || f.modified_at || f.created_at || "",
        }));

        renderRecentForms(recentForms);
    } catch (e) {
        console.error("폼 목록 불러오기 실패:", e);
        noResultEl.classList.remove("d-none");
        noResultEl.textContent = "폼 목록을 불러오는 중 오류가 발생했습니다.";
    }
});

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
        col.className = "col-12 col-md-6 col-lg-4";

        col.innerHTML = `
            <div class="card template-card p-3 d-flex flex-column h-100" style="cursor: pointer">
                <span class="fw-semibold mb-1">${form.title}</span>
                <span class="text-muted" style="font-size: 0.8rem">
                    ${form.updatedAt ? new Date(form.updatedAt).toLocaleDateString() : "-"}
                </span>
                <div class="dropdown">
                    <button class="icon-btn" data-bs-toggle="dropdown" data-tooltip="더보기">
                        <i class="bi bi-three-dots"></i>
                    </button>
                    <div class="dropdown-menu small">
                        <button class="dropdown-item text-danger" id="moveToTrashBtn">삭제</button>
                    </div>
                </div>
            </div>
        `;

        col.querySelector(".card").addEventListener("click", () => {
            window.location.href = `/frontend/html/editer.html?formId=${form.id}`;
        });

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
        return form.title.toLowerCase().includes(keyword);
    });

    renderRecentForms(filtered);
}

searchInputEl.addEventListener("input", handleSearch);

emptyTemplateCardEl.addEventListener("click", async () => {
    try {
        const userId = localStorage.getItem("user_id");

        const dto = {
            title: "제목 없는 설문지",
            description: "",
            user_id: userId ? Number(userId) : null,
            is_public: false,
        };

        const res = await FormAPI.createForm(dto);

        const newForm = res.form;

        if (!newForm) {
            console.error("폼 생성 응답이 올바르지 않습니다:", res);
            alert("폼 생성 오류: 잘못된 응답 형식");
            return;
        }

        const newFormId = newForm.form_id;

        if (!newFormId) {
            console.error("form_id 없음:", newForm);
            alert("새 폼 ID를 찾을 수 없습니다.");
            return;
        }

        window.location.href = `/frontend/html/editer.html?formId=${newFormId}`;
    } catch (e) {
        console.error("새 폼 생성 중 오류:", e);
        alert("새 양식을 생성하는 중 오류가 발생했습니다.");
    }
});
