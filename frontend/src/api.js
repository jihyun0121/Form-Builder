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

export const signup = (dto) => api.post(`/users/signup`, dto);
export const login = (dto) => api.post(`/users/login`, dto);
export const getProfile = (userId) => api.get(`/users/${userId}`);

export const createForm = (dto) => api.post(`/forms`, dto);
export const getAllForms = () => api.get(`/forms`);
export const getFormById = (formId) => api.get(`/forms/${formId}`);
export const getFormsByUser = (userId) => api.get(`/forms/user/${userId}`);
export const updateForm = (formId, dto) => api.put(`/forms/${formId}`, dto);
export const deleteForm = (formId) => api.delete(`/forms/${formId}`);

export const addQuestion = (formId, dto) => api.post(`/forms/${formId}/questions`, dto);
export const getQuestionsByForm = (formId) => api.get(`/forms/${formId}/questions`);
export const updateQuestion = (questionId, dto) => api.put(`/questions/${questionId}`, dto);
export const deleteQuestion = (questionId) => api.delete(`/questions/${questionId}`);

export const addResponse = (formId, dto) => api.post(`/forms/${formId}/responses`, dto);
export const getResponsesByForm = (formId) => api.get(`/forms/${formId}/responses`);
export const getResponseById = (responseId) => api.get(`/responses/${responseId}`);
export const getResponsesByUser = (userId) => api.get(`/users/${userId}/responses`);
export const deleteResponse = (responseId) => api.delete(`/responses/${responseId}`);

export const addAnswers = (responseId, dtos) => api.post(`/responses/${responseId}/answers`, dtos);
export const getAnswersByQuestion = (questionId) => api.get(`/questions/${questionId}/answers`);
export const getAnswersByResponse = (responseId) => api.get(`/responses/${responseId}/answers`);
export const updateAnswers = (responseId, dtos) => api.put(`/responses/${responseId}/answers`, dtos);

export default api;
