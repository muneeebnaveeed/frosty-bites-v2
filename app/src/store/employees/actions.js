import { SET_EMPLOYEES_DATA, SETT_EMPLOYEES_VISIBILITY } from './actionTypes';

export const setEmployeesVisibility = (payload) => ({
   type: SETT_EMPLOYEES_VISIBILITY,
   payload,
});

export const setEmployeesData = (payload) => ({
   type: SET_EMPLOYEES_DATA,
   payload,
});
