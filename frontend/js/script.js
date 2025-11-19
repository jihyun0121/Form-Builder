const recentListEl = document.getElementById("recentList");
const searchInputEl = document.getElementById("searchInput");
const noResultEl = document.getElementById("noResultMessage");
const emptyTemplateCardEl = document.getElementById("emptyTemplateCard");

let recentForms = [];

function formatDate(dateString) {
    if (!dateString) return "-";
    try {
        return new Date(dateString).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    } catch {
        return "-";
    }
}

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
            updatedAt: f.updated_at || f.modified_at || f.created_at || null,
        }));

        renderRecentForms(recentForms);
    } catch (e) {
        console.error("폼 목록 로드 실패:", e);
        noResultEl.classList.remove("d-none");
        noResultEl.textContent = "폼 목록을 불러오는 중 오류가 발생했습니다.";
    }
});

function renderRecentForms(list) {
    recentListEl.innerHTML = "";

    if (!list || list.length === 0) {
        noResultEl.classList.remove("d-none");
        return;
    }

    noResultEl.classList.add("d-none");

    list.forEach((form) => {
        const col = document.createElement("div");
        col.className = "col-12 col-md-6 col-lg-4";

        const formattedDate = formatDate(form.updatedAt);

        col.innerHTML = `
            <div class="recent-card position-relative">
                <div class="card-body">
                    <div class="dropdown position-absolute" style="top: 6px; right: 6px;">
                        <button class="icon-btn no-propagation" data-bs-toggle="dropdown">
                            <i class="bi bi-three-dots"></i>
                        </button>

                        <div class="dropdown-menu small dropdown-menu-end">
                            <button class="dropdown-item text-danger no-propagation delete-btn" data-form-id="${form.id}" >
                                삭제
                            </button>
                        </div>
                    </div>

                    <div class="recent-title">${form.title}</div>
                    <div class="muted-text mt-1">${formattedDate}</div>
                </div>
            </div>
        `;

        const card = col.querySelector(".recent-card");
        card.addEventListener("click", () => {
            window.location.href = `/frontend/html/editer.html?formId=${form.id}`;
        });

        col.querySelectorAll(".no-propagation").forEach((el) => {
            el.addEventListener("click", (e) => e.stopPropagation());
        });

        col.querySelector(".delete-btn").addEventListener("click", async (e) => {
            const id = e.target.dataset.formId;

            if (!confirm("정말 이 설문을 삭제하시겠습니까?")) return;

            try {
                await FormAPI.deleteForm(id);
                recentForms = recentForms.filter((f) => f.id !== Number(id));
                renderRecentForms(recentForms);
            } catch (err) {
                alert("삭제 실패: 서버 오류");
                console.error(err);
            }
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

    const filtered = recentForms.filter((form) => form.title.toLowerCase().includes(keyword));

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
        if (!newForm?.form_id) throw new Error("form_id 없음");

        window.location.href = `/frontend/html/editer.html?formId=${newForm.form_id}`;
    } catch (e) {
        console.error("새 양식 생성 오류:", e);
        alert("새 양식을 생성할 수 없습니다.");
    }
});
