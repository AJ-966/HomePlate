import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "/" works for hosts with an SPA fallback (Netlify, Vercel, Cloudflare Pages).
// If you deploy to GitHub Pages under /repo-name/, set base accordingly and add a 404.html fallback.
export default defineConfig({
  plugins: [react()],
});
