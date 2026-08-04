export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
};

if (!env.API_BASE_URL) {
  throw new Error("Missing VITE_API_BASE_URL environment variable.");
}
