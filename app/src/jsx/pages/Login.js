import { api, get, post, useAlert } from 'jsx/helpers';
import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { When } from 'react-if';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { connect } from 'react-redux';
import { userRoles } from 'jsx/helpers/enums';
import { setLogin } from '../../store/auth/actions';

const Login = (props) => {
   const history = useHistory();
   const [loginData, setLoginData] = useState({});
   const [isLoading, setIsLoading] = useState(false);

   const alert = useAlert();

   const handleBlur = (e) => {
      const newLoginData = { ...loginData };
      newLoginData[e.target.name] = e.target.value;
      setLoginData(newLoginData);
   };

   useEffect(() => {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      if (token) {
         get(`auth/decode/${token}`)
            .then((decode) => {
               props.setLogin({ ...decode, auth_token: token });
               localStorage.setItem('auth_token', token);
               setIsLoading(false);
               if (decode?.isConfirmed) {
                  // if (decode?.role === userRoles.CASHIER) {
                  //    history.push('/purchase');
                  // } else if (decode?.role === userRoles.ADMINISTRATOR) {
                  //    history.push('/dashboard');
                  // } else {
                  //    alert.setErrorAlert({ message: 'Unable to login', err: 'Account not confirmed!' });
                  // }
                  history.push('/sale');
               } else {
                  localStorage.clear();
                  props.setLogin({});
                  alert.setErrorAlert({ message: 'Unable to login', err: 'Account not confirmed!' });
               }
            })
            .catch((err) => setIsLoading(false));
      } else setIsLoading(false);
   }, []);

   const handleLogin = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
         const res = await api.post('/auth/login', loginData);
         setIsLoading(false);
         const decode = await get(`auth/decode/${res.data}`);
         props.setLogin({ ...decode, auth_token: res.data });
         localStorage.setItem('auth_token', res.data);
         if (decode?.isConfirmed) {
            // if (decode?.role === userRoles.CASHIER) {
            //    history.push('/purchase');
            // } else if (decode?.role === userRoles.ADMINISTRATOR) {
            //    history.push('/dashboard');
            // } else {
            //    alert.setErrorAlert({ message: 'Unable to login', err: 'Account not confirmed!' });
            // }
            window.location.reload();
            // history.push('/purchase');
         } else {
            localStorage.clear();
            props.setLogin({});
            alert.setErrorAlert({ message: 'Unable to login', err: 'Account not confirmed!' });
         }
      } catch (err) {
         setIsLoading(false);
         alert.setErrorAlert({ message: 'Unable to login', err });
      }
   };

   return (
      <>
         <When condition={isLoading}>
            <SpinnerOverlay />
         </When>
         <div className="authincation">
            <div className="container p-0">
               <div className="row justify-content-center align-items-center tw-h-screen">
                  <div className="col-lg-6 col-md-9">
                     <div className="authincation-content">
                        <div className="row no-gutters">
                           <div className="col-xl-12">
                              <div className="auth-form">
                                 {alert.getAlert()}
                                 <h4 className="text-center mb-4">Sign in your account</h4>
                                 <form action="" onSubmit={handleLogin}>
                                    <div className="form-group">
                                       <label className="mb-1" htmlFor="login-name">
                                          <strong>Name</strong>
                                       </label>
                                       <input
                                          id="login-name"
                                          type="text"
                                          className="form-control"
                                          name="name"
                                          onChange={handleBlur}
                                       />
                                    </div>
                                    <div className="form-group">
                                       <label className="mb-1" htmlFor="login-password">
                                          <strong>Password</strong>
                                       </label>
                                       <input
                                          id="login-password"
                                          type="password"
                                          className="form-control"
                                          name="password"
                                          onChange={handleBlur}
                                       />
                                    </div>
                                    <div className="form-row d-flex justify-content-between mt-4 mb-2">
                                       <div className="form-group">
                                          <Link to="/page-forgot-password">Forgot Password?</Link>
                                       </div>
                                    </div>
                                    <div className="text-center">
                                       <button type="submit" className="btn btn-primary btn-block">
                                          Sign Me In
                                       </button>
                                    </div>
                                 </form>
                                 <div className="new-account mt-3">
                                    <p>
                                       Don't have an account?{' '}
                                       <Link className="text-primary" to="/page-register">
                                          Sign up
                                       </Link>
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </>
   );
};

const mapStateToProps = ({ auth }) => ({});

const mapDispatchToProps = (dispatch) => ({
   setLogin: (payload) => dispatch(setLogin(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
