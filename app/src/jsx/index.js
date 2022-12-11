import React, { lazy, Suspense, useMemo } from 'react';
import { connect } from 'react-redux';
/// React router dom
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './chart.css';
import { userRoles } from './helpers/enums';
/// Css
import './index.css';
import Layout from './layouts';

import { ManageProductModal } from './pages/products/modals';
import { ManageEmployeeModal } from './pages/employees/modals';
import AddNewExpense from './pages/expenses/AddNewExpense';
/// Pages
// import Registration from './pages/Registration';
// import Login from './pages/Login';

const Registration = lazy(() => import('./pages/Registration'));
const Login = lazy(() => import('./pages/Login'));

const Users = lazy(() => import('./pages/users'));
const Products = lazy(() => import('./pages/products'));
const Employees = lazy(() => import('./pages/employees'));
const Dashboard = lazy(() => import('./pages/dashboard'));
const Error404 = lazy(() => import('./pages/Error404'));
const Expenses = lazy(() => import('./pages/expenses'));

const Sale = lazy(() => import('./pages/sale'));
const AddSale = lazy(() => import('./pages/sale/add-sale'));

const protectedRoutes = [];

const DefaultPage = () => <Redirect to="/page-login" />;

const routes = [
   /// Deshborad
   { url: '', component: DefaultPage },
   { url: 'page-register', component: Registration, isPublic: true },
   { url: 'page-login', component: Login, isPublic: true },
   { url: 'users', component: Users },
   { url: 'products', component: Products },
   { url: 'sale', component: Sale },
   { url: 'sale/add', component: AddSale },
   { url: 'dashboard', component: Dashboard },
];

const Markup = (props) => {
   const isCashier = props.user?.role === userRoles.CASHIER;

   return (
      <Suspense fallback={<p>Loading</p>}>
         <ToastContainer />
         <ManageProductModal />
         <ManageEmployeeModal />
         {/* <AddNewType />
         <AddNewUnit />
         <AddNewSupplier />
         <AddNewCustomer />
         <AddNewSalary /> */}
         {/* <AddNewEmployee /> */}
         {/* <AddNewInventory /> */}
         <AddNewExpense />

         <Router>
            <Switch>
               {[...routes, ...protectedRoutes].map((data, i) => (
                  <Route key={i} exact path={`/${data.url}`}>
                     <Layout isPublic={data.isPublic}>
                        <data.component />
                     </Layout>
                  </Route>
               ))}
               <Route component={Error404} />
            </Switch>
         </Router>
      </Suspense>
   );
};

const mapStateToProps = ({ auth }) => ({
   user: auth.user,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Markup);
