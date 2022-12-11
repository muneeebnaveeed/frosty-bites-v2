import axios from 'axios';
import { isArray } from 'lodash';

const baseURL = process.env.REACT_APP_BASE_URL;

if (!baseURL) throw new Error('Base URL not found in ENV');

export const api = axios.create({ baseURL });

api.interceptors.request.use(
   async (config) => {
      const token = await localStorage.getItem('auth_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
   },
   (err) => Promise.reject(err)
);

export const getError = (err) => {
   const response = err.response?.data?.data;

   if (!isArray(response)) return [response];

   if (!response) return [err.message];

   return response;
};

export const getV2 = (path, params = {}) => api.get(path, { params }).then((res) => res.data);

export const get = (path, page, limit, field, order, search = '') =>
   api.get(path, { params: { page, limit, [`sort[${field}]`]: order, search } }).then((res) => res.data);

/**
 * Send a POST request
 * @param {string} path
 * @param {object} payload
 * @returns
 */
export const post = (path, payload) =>
   api.post(path, payload).then((res) =>
      // eslint-disable-next-line no-nested-ternary
      res.status === 200 || res.status === 201
         ? typeof res.data === 'string'
            ? { msg: res.data, status: 'ok' }
            : { ...res.data, status: 'ok' }
         : res.data
   );

/**
 * Send a PATCH request
 * @param {string} path
 * @param {object} payload
 * @returns
 */
export const patch = (path, payload) =>
   api.patch(path, payload).then((res) => (res.status === 200 ? { ...res.data, status: 'ok' } : res.data));

export const put = (path, payload = {}) => api.put(path, payload).then((res) => res.data);

/**
 * Send a DELETE request
 * @param {string} path
 * @returns
 */
export const del = (path) =>
   api.delete(path).then((res) => (res.status === 200 ? { ...res.data, status: 'ok' } : res.data));
