import request from "./api.js";

export const getLatestResume = () => request("/resume/latest");
