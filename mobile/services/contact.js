import request from "./api.js";

export const sendMessage = (payload) => request("/contact", { method: "POST", body: JSON.stringify(payload) });
