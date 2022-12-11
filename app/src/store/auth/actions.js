import { LOGIN, LOGOUT } from './actionTypes';

/**
 * Set user payload and login
 * @param {object} payload
 * @returns
 */
export const setLogin = (payload) => ({
   type: LOGIN,
   payload,
});

/**
 * Set user payload and login
 * @returns
 */
export const setLogout = () => ({
   type: LOGOUT,
});
