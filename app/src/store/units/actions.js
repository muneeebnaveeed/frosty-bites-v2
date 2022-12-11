import { SET_UNITS_DATA, SET_UNITS_VISIBILITY } from './actionTypes';

export const setUnitsVisibility = (payload) => ({
   type: SET_UNITS_VISIBILITY,
   payload,
});

export const setUnitsData = (payload) => ({
   type: SET_UNITS_DATA,
   payload,
});
