import { SET_SUPPLIERS_DATA, SET_SUPPLIERS_VISIBILITY } from './actionTypes';

export const setSuppliersVisibility = (payload) => ({
   type: SET_SUPPLIERS_VISIBILITY,
   payload,
});

export const setSuppliersData = (payload) => ({
   type: SET_SUPPLIERS_DATA,
   payload,
});
