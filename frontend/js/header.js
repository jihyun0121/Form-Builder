const tabButtons = document.querySelectorAll(".tab-btn");

const pages = {
    questions: document.getElementById("questionsPage"),
    responses: document.getElementById("responsesPage"),
    settings: document.getElementById("settingsPage"),
};

function hideAllPages() {
    Object.values(pages).forEach((p) => p.classList.add("d-none"));
}

function showPage(pageName) {
    hideAllPages();
    const page = pages[pageName] || pages.questions;
    page.classList.remove("d-none");

    tabButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.page === pageName);
    });
}

function syncTabWithHash() {
    const hash = location.hash.replace("#", "") || "questions";

    if (hash === "responses") showPage("responses");
    else if (hash === "settings") showPage("settings");
    else showPage("questions");
}

tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const page = btn.dataset.page;

        if (page === "questions") {
            history.replaceState(null, "", location.pathname + location.search);
            showPage("questions");
        } else {
            location.hash = page;
        }
    });
});

const tabs = document.querySelector(".page-tabs");
const underline = document.createElement("div");
underline.className = "tab-underline";
tabs.appendChild(underline);

function moveUnderline(activeBtn) {
    const rect = activeBtn.getBoundingClientRect();
    const parentRect = tabs.getBoundingClientRect();

    underline.style.width = rect.width + "px";
    underline.style.left = rect.left - parentRect.left + "px";
}

window.addEventListener("DOMContentLoaded", () => {
    const active = document.querySelector(".tab-btn.active");
    if (active) moveUnderline(active);
});

tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        moveUnderline(btn);
    });
});

window.addEventListener("hashchange", syncTabWithHash);
window.addEventListener("DOMContentLoaded", syncTabWithHash);

const backgroundPalette = {
    "#db4437": ["#fae3e1", "#f6d0cd", "#f2beb9", "#f6f6f6"],
    "#673ab7": ["#f0ebf8", "#e1d8f1", "#d1c4e9", "#f6f6f6"],
    "#3f51b5": ["#eceef8", "#d9dcf0", "#c5cbe9", "#f6f6f6"],
    "#4285f4": ["#e3edfd", "#d0e1fc", "#bdd4fb", "#f6f6f6"],
    "#03a9f4": ["#d9f2fd", "#c0eafc", "#a7e1fb", "#f6f6f6"],
    "#00bcd4": ["#d9f5f9", "#bfeef4", "#a6e8f0", "#f6f6f6"],
    "#ff5722": ["#ffe6de", "#ffd5c8", "#ffc4b2", "#f6f6f6"],
    "#ff9800": ["#fff0d9", "#ffe5bf", "#ffdba6", "#f6f6f6"],
    "#009688": ["#d9efed", "#bfe5e1", "#a6dad5", "#f6f6f6"],
    "#4caf50": ["#e4f3e5", "#d2ebd3", "#c0e3c2", "#f6f6f6"],
    "#607d8b": ["#e7ecee", "#d7dfe2", "#c7d2d6", "#f6f6f6"],
    "#9e9e9e": ["#f0f0f0", "#e7e7e7", "#dddddd", "#f6f6f6"],
};

document.addEventListener("DOMContentLoaded", () => {
    const colorButtons = document.querySelectorAll(".theme-menu .theme-color");
    const bgContainer = document.querySelector(".theme-menu .background-group");

    function renderBackgroundPalette(paletteArray) {
        bgContainer.innerHTML = "";
        paletteArray.forEach((color) => {
            const div = document.createElement("div");
            div.className = "theme-color bg-option";
            div.dataset.color = color;
            div.style.backgroundColor = color;

            div.addEventListener("click", () => {
                setBackground(color);
                selectBgOption(div);
            });

            bgContainer.appendChild(div);
        });
    }

    function selectBgOption(selectedDiv) {
        document.querySelectorAll(".bg-option").forEach((b) => b.classList.remove("selected"));
        selectedDiv.classList.add("selected");
    }

    function setBackground(color) {
        document.documentElement.style.setProperty("--form-bg-color", color);
        document.body.style.backgroundColor = color;
        localStorage.setItem("form-bg-color", color);
    }

    colorButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const selectedColor = btn.dataset.color;

            document.documentElement.style.setProperty("--form-theme-color", selectedColor);
            localStorage.setItem("form-theme-color", selectedColor);

            const palette = backgroundPalette[selectedColor];
            renderBackgroundPalette(palette);

            setBackground(palette[0]);

            colorButtons.forEach((b) => b.classList.remove("selected"));
            btn.classList.add("selected");
        });
    });

    const savedTheme = localStorage.getItem("form-theme-color") || "#673ab7";
    const savedBg = localStorage.getItem("form-bg-color");

    document.documentElement.style.setProperty("--form-theme-color", savedTheme);

    renderBackgroundPalette(backgroundPalette[savedTheme]);

    setBackground(savedBg || backgroundPalette[savedTheme][0]);

    colorButtons.forEach((b) => {
        b.classList.toggle("selected", b.dataset.color === savedTheme);
    });
});

const previewHeaderBtn = document.getElementById("previewHeaderBtn");
previewHeaderBtn?.addEventListener("click", () => {
    alert("미리보기 모드");
});

const originalUrlInput = document.getElementById("originalUrl");
const shortUrlInput = document.getElementById("shortUrl");
const copyUrlBtn = document.getElementById("copyUrlBtn");

if (originalUrlInput) {
    originalUrlInput.value = window.location.href.replace(/#.*$/, "");
    shortUrlInput.value = originalUrlInput.value;
}

copyUrlBtn?.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(shortUrlInput.value);
        alert("링크 복사됨");
    } catch {
        alert("복사 실패");
    }
});

document.getElementById("manageFormBtn")?.addEventListener("click", () => {
    alert("폼 관리 기능");
});

document.getElementById("shareFormBtn")?.addEventListener("click", () => {
    alert("폼 공유 설정");
});

document.getElementById("moveToTrashBtn")?.addEventListener("click", () => {
    if (confirm("휴지통으로 이동할까요?")) alert("휴지통으로 이동됨");
});

document.getElementById("unpublishBtn")?.addEventListener("click", () => {
    if (confirm("양식 게시를 취소할까요?")) alert("게시 취소됨");
});
