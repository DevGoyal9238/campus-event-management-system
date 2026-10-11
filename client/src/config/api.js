/**
 * Centralized API configuration for the UniVerse frontend application.
 *
 * Reads backend base URL from Vite environment variable (import.meta.env.VITE_API_BASE_URL).
 * Falls back to 'http://localhost:5000' during local development if not set.
 */

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Strip any trailing slashes to ensure consistent URL concatenation without duplicate slashes
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

/**
 * Safely constructs a full API endpoint URL from a relative path.
 * Ensures there are no duplicate or missing slashes.
 *
 * @param {string} endpoint - Relative API route (e.g. '/api/events' or 'api/events')
 * @returns {string} Complete URL (e.g. 'http://localhost:5000/api/events')
 */
export const getApiUrl = (endpoint = '') => {
  if (!endpoint) return API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export default {
  API_BASE_URL,
  getApiUrl
};
