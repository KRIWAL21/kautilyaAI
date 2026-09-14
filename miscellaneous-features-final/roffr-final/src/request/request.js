import axios from "axios";

// === BASE CONFIG ===

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3333";
axios.defaults.baseURL = BASE_URL;

// === MAKE REQUEST FUNCTION ===

/**
 * Make a request to the API (No Auth)
 *
 * @param {string} endpoint - Base endpoint (e.g. 'userleave')
 * @param {string} method - HTTP method (e.g. 'GET', 'POST')
 * @param {Object} data - Request body
 * @param {Object} config - Axios config overrides
 * @param {Object} params - URL query parameters
 * @param {number} [wait=0] - Optional delay in milliseconds
 * @param {string|number} [id=null] - Optional request ID
 * @param {string} [subPath=''] - Optional sub-route (e.g. '/admin')
 * @returns {Promise<any>}
 */
export async function makeRequest(
  endpoint,
  method = "GET",
  data = {},
  config = {},
  params = {},
  wait = 0,
  id = null,
  subPath = ""
) {
  try {
    if (!endpoint) throw new Error("Endpoint is required");

    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }

    // Build final endpoint path (subPath before id)
    let fullEndpoint = endpoint;
    if (subPath) fullEndpoint += `${subPath}`;
    if (id !== null && id !== undefined) fullEndpoint += `/${id}`;

    const response = await axios({
      url: fullEndpoint,
      method: method.toUpperCase(),
      data,
      params,
      ...config,
    });

    return response.data;
  } catch (error) {
    console.error(`[Request Failed${id ? ` - ${id}` : ""}]`, error);
    throw error;
  }
}
