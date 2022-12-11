import { LOGIN, LOGOUT } from './actionTypes';

const INIT_STATE = {
   user: {},
   isLogin: false,
};

const Auth = (state = INIT_STATE, action) => {
   switch (action.type) {
      case LOGIN:
         return {
            ...state,
            user: action.payload,
            isLogin: true,
         };
      case LOGOUT:
         return {
            ...state,
            user: {},
            isLogin: false,
         };

      default:
         return state;
   }
};

export default Auth;
