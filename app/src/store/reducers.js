import { combineReducers } from 'redux';
import auth from './auth/reducer';
import products from './products/reducer';
import types from './types/reducer';
import units from './units/reducer';
import suppliers from './suppliers/reducer';
import customers from './customers/reducer';
import salaries from './salaries/reducer';
import employees from './employees/reducer';
import inventories from './inventories/reducer';
import expenses from './expenses/reducer';

const rootReducer = combineReducers({
   auth,
   products,
   types,
   units,
   suppliers,
   customers,
   salaries,
   employees,
   inventories,
   expenses,
});

export default rootReducer;
