import { api } from 'jsx/helpers';

export const GET_PRODUCTS = ({ queryKey: [key, params] }) => api.get('/products', { params }).then((res) => res.data);
