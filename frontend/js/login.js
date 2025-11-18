const loginPage = document.getElementById("loginPage");
const signupPage = document.getElementById("signupPage");
const tabButtons = document.querySelectorAll(".tab-btn");

function hideAll() {
    loginPage.classList.add("d-none");
    signupPage.classList.add("d-none");
}

function showPage(name) {
    hideAll();

    if (name === "signup") {
        signupPage.classList.remove("d-none");
    } else {
        loginPage.classList.remove("d-none");
    }

    tabButtons.forEach((btn) => {
        btn.classList.toggle("fw-bold", btn.dataset.page === name);
    });
}

function syncHash() {
    const hash = location.hash.replace("#", "");
    if (hash === "signup") showPage("signup");
    else showPage("login");
}

window.addEventListener("hashchange", syncHash);
window.addEventListener("DOMContentLoaded", syncHash);

tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        location.hash = btn.dataset.page;
    });
});

document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        alert("이메일과 비밀번호를 입력하세요.");
        return;
    }

    try {
        const res = await FormAPI.login({
            email,
            password,
        });

        console.log("로그인 응답:", res);

        localStorage.setItem("token", res.token);
        localStorage.setItem("user_id", res.user_id);
        localStorage.setItem("email", res.email);

        alert("로그인 성공!");

        window.location.href = "/frontend/html/";
    } catch (err) {
        console.error("로그인 실패:", err);
        alert(err.error || "로그인 중 오류가 발생했습니다.");
    }
});

document.getElementById("signupBtn").addEventListener("click", async () => {
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    if (!email || !password) return alert("모든 항목을 입력해주세요.");

    try {
        const res = await FormAPI.signup({ email, password });
        alert("회원가입 성공! 이제 로그인해주세요.");
        location.hash = "#login";
    } catch (e) {
        console.error(e);
        alert("회원가입 실패");
    }
});
