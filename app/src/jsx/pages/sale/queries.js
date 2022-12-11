import { api } from 'jsx/helpers';

export const GET_ALL_PRODUCTS = () =>
   api.get('/products', { params: { page: 1, limit: 10000, sort: { _id: -1 }, search: '' } }).then((res) => res.data);

export const GET_SALE = ({ queryKey: [key, params] }) => api.get('/sales', { params }).then((res) => res.data);
