import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID } from "./env.js";

export const googleOAuthClient = new OAuth2Client({
  clientId: GOOGLE_CLIENT_ID,
});
