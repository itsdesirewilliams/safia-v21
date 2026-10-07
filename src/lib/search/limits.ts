/**
 * Query-length limits, kept in their own dependency-free module so client
 * components can enforce them without importing the (server-only) search
 * engine and its datasets.
 */
export const MIN_SEARCH_LENGTH = 2;
export const MAX_SEARCH_LENGTH = 64;
