import axios from "axios";

const API_URL = "http://localhost:8080";

const api = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.response?.data?.error || "서버 요청 중 오류가 발생했습니다.";
        console.error("API 오류:", message);
        return Promise.reject(error);
    }
);

export const aa = () => api.bb(`/users/signup`);
export const aa = () => api.bb(`/users/login`);
export const aa = () => api.bb(`/users/${userId}`);

export const aa = () => api.bb(`/forms`);
export const aa = () => api.bb(`/forms`);
export const aa = () => api.bb(`/forms/${formId}`);
export const aa = () => api.bb(`/forms/user/${userId}`);
export const aa = () => api.bb(`/forms/${formId}`);
export const aa = () => api.bb(`/forms/${formId}`);
export const aa = () => api.bb(`/forms/${formId}/structure`);

export const aa = () => api.bb(`/forms/${formId}/sections`);
export const aa = () => api.bb(`/sections/${sectionId}`);
export const aa = () => api.bb(`/sections/${sectionId}`);
export const aa = () => api.bb(`/forms/${formId}/sections`);

export const aa = () => api.bb(`/forms/${formId}/question`);
export const aa = () => api.bb(`/forms/${formId}/questions`);
export const aa = () => api.bb(`/questions/${questionId}`);
export const aa = () => api.bb(`/questions/${questionId}`);

export const aa = () => api.bb(`/forms/${formId}/responses`);
export const aa = () => api.bb(`/forms/${formId}/responses`);
export const aa = () => api.bb(`/responses/${responseId}`);
export const aa = () => api.bb(`/users/${userId}/responses`);
export const aa = () => api.bb(`/responses/${responseId}`);

export const aa = () => api.bb(`/responses/${responseId}/answers`);
export const aa = () => api.bb(`/questions/${questionId}/answers`);
export const aa = () => api.bb(`/responses/${responseId}/answers`);
export const aa = () => api.bb(`/responses/${responseId}/answers`);

export default api;
