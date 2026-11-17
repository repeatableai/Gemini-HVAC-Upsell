// One data layer for the whole app. With VITE_SUPABASE_URL set at build time
// the app runs on the Supabase database; without it, on the in-browser demo data.
import * as mock from './mockApiImpl.js';
import * as live from './supabaseApi.js';

export const IS_LIVE = live.IS_CONFIGURED;
export const api = IS_LIVE ? live.api : mock.api;
export const requiredServiceIds = IS_LIVE ? live.requiredServiceIds : mock.requiredServiceIds;
