import * as WebBrowser from "expo-web-browser";
import { API_URL } from "./api.js";

// The backend always redirects Google/GitHub sign-in back to this fixed
// custom-scheme URL when the flow is started with ?platform=mobile (see
// server/src/controllers/authController.js). This only resolves correctly
// in a dev-client or standalone/EAS build — Expo Go cannot own a custom
// `buildwithvishant://` scheme, so social login will not complete inside
// plain Expo Go. Email/password auth is unaffected either way.
const REDIRECT_URL = "buildwithvishant://auth/callback";

export const signInWithProvider = async (provider) => {
  const authUrl = `${API_URL}/auth/${provider}?platform=mobile`;
  const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URL);

  if (result.type !== "success" || !result.url) {
    if (result.type === "cancel" || result.type === "dismiss") return null; // user backed out — not an error
    throw new Error("Sign-in didn't complete. Please try again.");
  }

  const fragment = result.url.split("#")[1] || "";
  const params = new URLSearchParams(fragment);
  const error = params.get("error");
  if (error) throw new Error(error);

  const token = params.get("token");
  const userRaw = params.get("user");
  if (!token || !userRaw) throw new Error("Sign-in response was incomplete. Please try again.");

  return { token, user: JSON.parse(userRaw) };
};
