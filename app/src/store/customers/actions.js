import { SET_CUSTOMERS_DATA, SET_CUSTOMERS_VISIBILITY } from './actionTypes';

export const setCustomersVisibility = (payload) => ({
   type: SET_CUSTOMERS_VISIBILITY,
   payload,
});

export const setCustomersData = (payload) => ({
   type: SET_CUSTOMERS_DATA,
   payload,
});
