import { SET_TYPES_DATA, SET_TYPES_VISIBILITY } from './actionTypes';

const INIT_STATE = {
   visible: false,
   data: {},
};

const Auth = (state = INIT_STATE, action) => {
   switch (action.type) {
      case SET_TYPES_VISIBILITY:
         return {
            ...state,
            visible: action.payload,
         };
      case SET_TYPES_DATA:
         return {
            ...state,
            data: action.payload,
         };

      default:
         return state;
   }
};

export default Auth;
