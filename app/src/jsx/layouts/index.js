import React, { memo, useEffect } from 'react';
import { setLogin, setLogout } from 'store/auth/actions';
import { connect } from 'react-redux';
import Nav from './nav';
import Footer from './Footer';
import { get } from '../helpers';

const Layout = ({ children: Children, isPublic, setUser, logout }) => {
   const token = localStorage.getItem('auth_token');
   const getUserProfile = async () => {
      try {
         const res = await get(`/auth/decode/${token}`);
         if (!res?.isConfirmed) {
            logout();
            localStorage.clear();
            window.location = 'page-login';
         } else {
            setUser({ ...res, auth_token: token });
         }
      } catch (error) {
         logout();
         setUser({});
         localStorage.clear();
         window.location = 'page-login';
      }
   };

   useEffect(() => {
      if (token) {
         getUserProfile();
      }
   }, [token]);

   if (isPublic)
      return (
         <>
            <div id="main-wrapper" className="show">
               <div className="container-fluid">
                  {/* <Children /> */}
                  {Children}
               </div>
            </div>
         </>
      );

   return (
      <>
         <div id="main-wrapper" className="show" style={{ minHeight: '100vh' }}>
            <Nav />
            <div className="content-body">
               <div className="container-fluid">
                  {/* <Children /> */}
                  {Children}
               </div>
            </div>
            {/* <Footer /> */}
         </div>
      </>
   );
};
const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({
   setUser: (payload) => dispatch(setLogin(payload)),
   logout: () => dispatch(setLogout()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
