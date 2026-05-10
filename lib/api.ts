import axios from "axios";

// No baseURL — relative paths so requests go through the Next.js API routes
// which then proxy to http://localhost:3000 server-side.
export const api = axios.create({
  headers: { "Content-Type": "application/json" },
});
