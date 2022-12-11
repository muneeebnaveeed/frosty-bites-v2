import { SET_EMPLOYEES_DATA, SETT_EMPLOYEES_VISIBILITY } from './actionTypes';

const INIT_STATE = {
   visible: false,
   data: {},
};

const Auth = (state = INIT_STATE, action) => {
   switch (action.type) {
      case SETT_EMPLOYEES_VISIBILITY:
         return {
            ...state,
            visible: action.payload,
         };
      case SET_EMPLOYEES_DATA:
         return {
            ...state,
            data: action.payload,
         };

      default:
         return state;
   }
};

export default Auth;
