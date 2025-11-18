const API_URL = "http://localhost:8080";

async function request(method, url, data) {
    const token = localStorage.getItem("token");

    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
    };

    if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const res = await fetch(API_URL + url, options);

        const contentType = res.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");

        const responseBody = isJson ? await res.json() : await res.text();

        if (!res.ok) {
            console.error("API 오류:", responseBody);
            throw responseBody;
        }

        return responseBody;
    } catch (err) {
        console.error("네트워크 오류:", err);
        throw err;
    }
}

const FormAPI = {
    signup(dto) {
        return request("POST", `/users/signup`, dto);
    },
    login(dto) {
        return request("POST", `/users/login`, dto);
    },
    getProfile(userId) {
        return request("GET", `/users/${userId}`);
    },

    createForm(dto) {
        return request("POST", `/forms`, dto);
    },
    getAllForms() {
        return request("GET", `/forms`);
    },
    getFormById(formId) {
        return request("GET", `/forms/${formId}`);
    },
    getFormByUserId(userId) {
        return request("GET", `/forms/user/${userId}`);
    },
    updateForm(formId, dto) {
        return request("PUT", `/forms/${formId}`, dto);
    },
    deleteForm(formId) {
        return request("DELETE", `/forms/${formId}`);
    },
    getFormStructure(formId) {
        return request("GET", `/forms/${formId}/structure`);
    },

    addSection(formId, dto) {
        return request("POST", `/forms/${formId}/sections`, dto);
    },
    updateSection(sectionId, dto) {
        return request("PUT", `/sections/${sectionId}`, dto);
    },
    deleteSection(sectionId) {
        return request("DELETE", `/sections/${sectionId}`);
    },

    addQuestion(formId, dto) {
        return request("POST", `/forms/${formId}/question`, dto);
    },
    getQuestionByFormId(formId) {
        return request("GET", `/forms/${formId}/questions`);
    },
    updateQuestion(questionId, dto) {
        return request("PUT", `/questions/${questionId}`, dto);
    },
    deleteQuestion(questionId) {
        return request("DELETE", `/questions/${questionId}`);
    },

    createResponse(formId, dto) {
        return request("POST", `/forms/${formId}/responses`, dto);
    },
    getResponseByFormId(formId) {
        return request("GET", `/forms/${formId}/responses`);
    },
    getResponseById(responseId) {
        return request("GET", `/responses/${responseId}`);
    },
    getResponseByUserId(userId) {
        return request("GET", `/users/${userId}/responses`);
    },
    deleteResponse(responseId) {
        return request("DELETE", `/responses/${responseId}`);
    },

    addAnswers(responseId, dto) {
        return request("POST", `/responses/${responseId}/answers`, dto);
    },
    getAnswerByQuestionId(questionId) {
        return request("GET", `/questions/${questionId}/answers`);
    },
    getAnswerByResponseId(responseId) {
        return request("GET", `/responses/${responseId}/answers`);
    },
    updateAnswers(responseId, userId, dto) {
        return request("PUT", `/responses/${responseId}/answers?userId=${userId}`, dto);
    },
};

window.FormAPI = FormAPI;
