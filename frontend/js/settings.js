document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-toggle='section']").forEach((header) => {
        header.addEventListener("click", () => {
            const body = header.nextElementSibling;
            const icon = header.querySelector("i");

            const isOpen = body.style.display === "block";

            document.querySelectorAll(".section-body").forEach((b) => (b.style.display = "none"));
            document.querySelectorAll(".section-toggle-btn i").forEach((i) => (i.style.transform = "rotate(0deg)"));

            if (!isOpen) {
                body.style.display = "block";
                icon.style.transform = "rotate(180deg)";
            }
        });
    });

    const formId = new URLSearchParams(location.search).get("formId");
    if (!formId) return;

    const settings = {
        modifyResponse: document.getElementById("modifyResponse"),
        limitOneResponse: document.getElementById("limitOneResponse"),
        submitMessage: document.getElementById("submitMessage"),
        showAnotherLink: document.getElementById("showAnotherLink"),
        defaultRequired: document.getElementById("defaultRequired"),
    };

    async function saveSettingsToDB() {
        const data = {
            modifyResponse: settings.modifyResponse.checked,
            limitOneResponse: settings.limitOneResponse.checked,
            submitMessage: settings.submitMessage.value,
            showAnotherLink: settings.showAnotherLink.checked,
            defaultRequired: settings.defaultRequired.checked,
        };

        try {
            await FormAPI.updateForm(formId, { settings: data });
            console.log("✔ 설정 DB에 저장됨:", data);
        } catch (err) {
            console.error("설정 저장 실패:", err);
        }
    }

    function loadSettings() {
        const form = window.currentForm;
        if (!form?.settings) return;

        settings.modifyResponse.checked = form.settings.modifyResponse || false;
        settings.limitOneResponse.checked = form.settings.limitOneResponse || false;
        settings.submitMessage.value = form.settings.submitMessage || "";
        settings.showAnotherLink.checked = form.settings.showAnotherLink || false;
        settings.defaultRequired.checked = form.settings.defaultRequired || false;
    }

    Object.values(settings).forEach((el) => {
        el?.addEventListener("input", saveSettingsToDB);
        el?.addEventListener("change", saveSettingsToDB);
    });

    loadSettings();
});
