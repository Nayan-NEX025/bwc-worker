import axios from "axios";
import { BREVO_API_KEY } from "../configs/env.js";

export const brevoClient = axios.create({
  baseURL: "https://api.brevo.com/v3",
  headers: {
    "api-key": BREVO_API_KEY,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});
