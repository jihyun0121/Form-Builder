window.addEventListener("DOMContentLoaded", async () => {
    const formId = new URLSearchParams(location.search).get("formId");
    if (!formId) return;

    try {
        const form = await FormAPI.getFormById(formId);
        let msg = "설문 참여에 감사드립니다.";
        if (form.settings && form.settings.submitMessage) {
            msg = form.settings.submitMessage;
        }

        document.getElementById("submitMessage").textContent = msg;

        document.getElementById("goBackBtn").addEventListener("click", () => {
            location.href = `/frontend/html/answer.html?formId=${formId}`;
        });
    } catch (err) {
        console.error(err);
    }
});
