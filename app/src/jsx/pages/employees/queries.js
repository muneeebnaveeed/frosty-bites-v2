import { api } from 'jsx/helpers';

export const GET_EMPLOYEES = ({ queryKey: [key, params] }) => api.get('/employees', { params }).then((res) => res.data);
