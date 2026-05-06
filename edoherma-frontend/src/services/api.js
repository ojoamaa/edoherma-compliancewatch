import axios from "axios";

const API_BASE_URL =
  "https://edoherma-compliancewatch-1-s9p4.onrender.com";

export const api = axios.create({
  baseURL: API_BASE_URL,
});
