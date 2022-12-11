/// Menu
import MetisMenu from 'metismenujs';
import React, { Component, useEffect, memo } from 'react';
/// Scroll
import PerfectScrollbar from 'react-perfect-scrollbar';
/// Link
import { Link, useLocation } from 'react-router-dom';
import { When } from 'react-if';

import { connect, useSelector } from 'react-redux';
import { setLogin } from 'store/auth/actions';
import { userRoles } from 'jsx/helpers/enums';

/// Active menu
const manage = ['/employees', '/customers', '/products', '/users', '/types', '/units'];

class MM extends Component {
   componentDidMount() {
      this.$el = this.el;
      this.mm = new MetisMenu(this.$el);
   }

   componentWillUnmount() {
      this.mm.dispose();
   }

   render() {
      return (
         <div className="mm-wrapper">
            <ul className="metismenu" ref={(el) => (this.el = el)}>
               {this.props.children}
            </ul>
         </div>
      );
   }
}

const SideBar = (props) => {
   const { pathname: path } = useLocation();
   const isCashier = useSelector((state) => state.auth.user.role === 'CASHIER');

   useEffect(() => {
      const btn = document.querySelector('.nav-control');
      const aaa = document.querySelector('#main-wrapper');

      function toggleFunc() {
         return aaa.classList.toggle('menu-toggle');
      }

      btn.addEventListener('click', toggleFunc);
   }, []);

   return (
      <div className="deznav">
         <PerfectScrollbar className="deznav-scroll">
            <MM className="metismenu" id="menu">
               <When condition={!isCashier}>
                  <li className={path === '/dashboard' ? 'mm-active' : ''}>
                     <Link className="" to="/dashboard" aria-expanded="false">
                        <i className="flaticon-381-networking" />
                        <span className="nav-text">Dashboard</span>
                     </Link>
                  </li>
               </When>
               <li className={path === '/products' ? 'mm-active' : ''}>
                  <Link className="" to="/products" aria-expanded="false">
                     <i className="flaticon-381-box" />
                     <span className="nav-text">Products</span>
                  </Link>
               </li>
               {/* <li className={`${manage.includes(path.slice(1)) ? 'mm-active' : ''}`}>
                  <Link className="has-arrow ai-icon color" aria-expanded="false">
                     <i className="flaticon-381-notepad" />
                     <span className="nav-text">Manage</span>
                  </Link>
                  <ul aria-expanded="false">
                     <li className={path === '/products' ? 'mm-active' : ''}>
                        <Link to="/products">Products</Link>
                     </li>
                     <li>
                        <Link to="/suppliers">Suppliers</Link>
                     </li>
                     <li>
                        <Link to="/customers">Customers</Link>
                     </li>
                     <li>
                        <Link to="/app-calender">Users</Link>
                     </li>
                     <When condition={props.user?.role !== userRoles.CASHIER}>
                        <li>
                           <Link to="/users">Users</Link>
                        </li>
                        <li>
                           <Link to="/employees">Employees</Link>
                        </li>
                     </When>
                  </ul>
               </li> */}
               {/* <li className={path === '/purchase' ? 'mm-active' : ''}>
                  <Link className="" to="/purchase" aria-expanded="false">
                     <i className="flaticon-381-more" />
                     <span className="nav-text">Purchase</span>
                  </Link>
               </li> */}
               <li className={path === '/sale' ? 'mm-active' : ''}>
                  <Link className="" to="/sale" aria-expanded="false">
                     <i className="flaticon-381-notepad" />
                     <span className="nav-text">Sale</span>
                  </Link>
               </li>
               {!isCashier && (
                  <li className={path === '/users' ? 'mm-active' : ''}>
                     <Link className="" to="/users" aria-expanded="false">
                        <i className="flaticon-381-user" />
                        <span className="nav-text">Users</span>
                     </Link>
                  </li>
               )}
            </MM>
         </PerfectScrollbar>
      </div>
   );
};

const mapStateToProps = ({ auth }) => ({
   user: auth.user,
});

const mapDispatchToProps = (dispatch) => ({
   setLogin: (payload) => dispatch(setLogin(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(memo(SideBar));
