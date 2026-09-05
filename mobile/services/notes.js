import request from "./api.js";

// Public
export const listNotes = (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v))
  ).toString();
  return request(`/notes${query ? `?${query}` : ""}`);
};

export const getNote = (slug) => request(`/notes/${slug}`);

// Admin
export const listAdminNotes = () => request("/notes/admin/all");
export const getAdminNote = (id) => request(`/notes/admin/${id}`);

export const createNote = (payload) =>
  request("/notes", { method: "POST", body: JSON.stringify(payload) });

export const updateNote = (id, payload) =>
  request(`/notes/${id}`, { method: "PUT", body: JSON.stringify(payload) });

export const deleteNote = (id) => request(`/notes/${id}`, { method: "DELETE" });

// Uploads the picked image straight to Cloudinary via the existing backend
// route and returns the resulting URL — the admin never has to paste one.
export const uploadThumbnail = (image) => {
  const form = new FormData();
  form.append("thumbnail", {
    uri: image.uri,
    name: image.fileName || "thumbnail.jpg",
    type: image.mimeType || "image/jpeg",
  });
  return request("/notes/admin/thumbnail", { method: "POST", body: form });
};
