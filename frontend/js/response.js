document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".page-btn");
    const summaryTab = document.getElementById("responses");
    const questionTab = document.getElementById("question");
    const individualTab = document.getElementById("response");

    const tabs = {
        responses: summaryTab,
        question: questionTab,
        response: individualTab,
    };

    const underline = document.querySelector(".page-underline");

    function moveUnderline(activeBtn) {
        const rect = activeBtn.getBoundingClientRect();
        const parentRect = activeBtn.parentElement.getBoundingClientRect();

        underline.style.width = `${rect.width}px`;
        underline.style.left = `${rect.left - parentRect.left}px`;
    }

    function hideTabs() {
        Object.values(tabs).forEach((tab) => tab.classList.remove("active"));
    }

    function showTab(name, clickedBtn) {
        hideTabs();
        tabs[name].classList.add("active");

        tabButtons.forEach((btn) => btn.classList.remove("active"));
        clickedBtn.classList.add("active");

        moveUnderline(clickedBtn);
    }

    const defaultActiveBtn = document.querySelector(".page-btn.active");
    if (defaultActiveBtn) moveUnderline(defaultActiveBtn);

    tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const pageName = btn.dataset.page;
            showTab(pageName, btn);
        });
    });

    window.addEventListener("resize", () => {
        const activeBtn = document.querySelector(".page-btn.active");
        if (activeBtn) moveUnderline(activeBtn);
    });
});
