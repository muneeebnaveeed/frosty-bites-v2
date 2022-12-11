import { SET_TYPES_DATA, SET_TYPES_VISIBILITY } from './actionTypes';

export const setTypesVisibility = (payload) => ({
   type: SET_TYPES_VISIBILITY,
   payload,
});

export const setTypesData = (payload) => ({
   type: SET_TYPES_DATA,
   payload,
});
