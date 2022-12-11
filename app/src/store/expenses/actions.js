import { SET_EXPENSES_DATA, SET_EXPENSES_VISIBILITY } from './actionTypes';

export const setExpensesVisibility = (payload) => ({
   type: SET_EXPENSES_VISIBILITY,
   payload,
});

export const setExpensesData = (payload) => ({
   type: SET_EXPENSES_DATA,
   payload,
});
