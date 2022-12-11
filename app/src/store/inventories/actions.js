import { SET_INVENTORIES_DATA, SET_INVENTORIES_VISIBILITY } from './actionTypes';

export const setInventoriesVisibility = (payload) => ({
   type: SET_INVENTORIES_VISIBILITY,
   payload,
});

export const setInventoriesData = (payload) => ({
   type: SET_INVENTORIES_DATA,
   payload,
});
