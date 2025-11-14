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

export const signup = () => api.POST(`/users/signup`);
export const login = () => api.POST(`/users/login`);
export const getProfile = (userId) => api.GET(`/users/${userId}`);

export const createForm = () => api.POST(`/forms`);
export const getAllForms = () => api.GET(`/forms`);
export const getFormById = (formId) => api.GET(`/forms/${formId}`);
export const getFormByUserId = (userId) => api.GET(`/forms/user/${userId}`);
export const updateForm = (formId) => api.PUT(`/forms/${formId}`);
export const deleteForm = (formId) => api.DELETE(`/forms/${formId}`);
export const getFormStructure = (formId) => api.GET(`/forms/${formId}/structure`);

export const addSection = (formId) => api.POST(`/forms/${formId}/sections`);
export const updateSection = (sectionId) => api.PUT(`/sections/${sectionId}`);
export const deleteSection = (sectionId) => api.DELETE(`/sections/${sectionId}`);
export const getAllSection = (formId) => api.GET(`/forms/${formId}/sections`);

export const addQuestion = (formId) => api.POST(`/forms/${formId}/question`);
export const getQuestionByFormId = (formId) => api.GET(`/forms/${formId}/questions`);
export const updateQuestion = (questionId) => api.PUT(`/questions/${questionId}`);
export const deleteQuestion = (questionId) => api.DELETE(`/questions/${questionId}`);

export const createResponse = (formId) => api.POST(`/forms/${formId}/responses`);
export const getResponseByFormId = (formId) => api.GET(`/forms/${formId}/responses`);
export const getResponseById = (responseId) => api.GET(`/responses/${responseId}`);
export const getResponseByUserId = (userId) => api.GET(`/users/${userId}/responses`);
export const deleteResponse = (responseId) => api.DELETE(`/responses/${responseId}`);

export const addAnswers = (responseId) => api.POST(`/responses/${responseId}/answers`);
export const getAnswerByQuestionId = (questionId) => api.GET(`/questions/${questionId}/answers`);
export const getAnswerByResponseId = (responseId) => api.GET(`/responses/${responseId}/answers`);
export const updateAnswers = (responseId) => api.PUT(`/responses/${responseId}/answers`);

export default api;
