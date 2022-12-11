import { api } from './jsx/helpers/server';

export const DELETE_ENTITY = (model) => (id) => api.delete(`/delete-entity/${model}/${id}`);
