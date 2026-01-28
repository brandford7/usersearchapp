export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  TIMEOUT: 30000,
  DEBOUNCE_DELAY: 500,
};

export const QUERY_KEYS = {
  PEOPLE_SEARCH: "people-search",
  STATES: "states",
  STATS: "stats",
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
};
