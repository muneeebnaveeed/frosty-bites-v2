import { SET_SALARIES_DATA, SET_SALARIES_VISIBILITY } from './actionTypes';

export const setSalariesVisibility = (payload) => ({
   type: SET_SALARIES_VISIBILITY,
   payload,
});

export const setSalariesData = (payload) => ({
   type: SET_SALARIES_DATA,
   payload,
});
