import { SET_PRODUCT_DATA, SET_PRODUCT_VISIBILITY } from './actionTypes';

export const setProductsVisibility = (payload) => ({
   type: SET_PRODUCT_VISIBILITY,
   payload,
});

export const setProductsData = (payload) => ({
   type: SET_PRODUCT_DATA,
   payload,
});
