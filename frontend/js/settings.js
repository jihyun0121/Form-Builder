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

    const settings = {
        modifyResponse: document.getElementById("modifyResponse"),
        limitOneResponse: document.getElementById("limitOneResponse"),
        submitMessage: document.getElementById("submitMessage"),
        showAnotherLink: document.getElementById("showAnotherLink"),
        defaultRequired: document.getElementById("defaultRequired"),
    };

    function saveSettings() {
        const data = {
            modifyResponse: settings.modifyResponse.checked,
            limitOneResponse: settings.limitOneResponse.checked,
            submitMessage: settings.submitMessage.value,
            showAnotherLink: settings.showAnotherLink.checked,
            defaultRequired: settings.defaultRequired.checked,
        };

        localStorage.setItem("form-settings", JSON.stringify(data));
    }

    function loadSettings() {
        const saved = JSON.parse(localStorage.getItem("form-settings") || "{}");

        settings.modifyResponse.checked = saved.modifyResponse || false;
        settings.limitOneResponse.checked = saved.limitOneResponse || false;
        settings.submitMessage.value = saved.submitMessage || "";
        settings.showAnotherLink.checked = saved.showAnotherLink || false;
        settings.defaultRequired.checked = saved.defaultRequired || false;
    }

    Object.values(settings).forEach((el) => {
        el?.addEventListener("input", saveSettings);
        el?.addEventListener("change", saveSettings);
    });

    loadSettings();
});
