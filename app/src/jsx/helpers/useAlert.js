import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { When } from 'react-if';
import cls from 'classnames';
import { getError } from './server';

export const useAlert = () => {
   const [isShowing, setIsShowing] = useState(false);
   const [message, setMessage] = useState('');
   const [variant, setVariant] = useState('success');

   const callback = useRef(null);
   const timeout = useRef(null);

   // eslint-disable-next-line arrow-body-style
   useEffect(() => {
      return () => {
         if (timeout.current) clearTimeout(timeout.current);
      };
   }, []);

   const resetTimeout = useCallback((duration) => {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
         setIsShowing(false);
         timeout.current = null;
         if (callback.current) callback.current();
      }, duration);
   }, []);

   const getAlert = useCallback(
      () =>
         isShowing ? (
            <Alert
               className="alert-dismissible fade show"
               variant={variant}
               dismissible
               onClose={() => setIsShowing(false)}
            >
               <p className={cls(`tw-m-0 tw-opacity-60`, { 'tw-text-black': variant === 'success' })}>{message}</p>
            </Alert>
         ) : null,
      [isShowing, message, variant]
   );

   const setAlert = useCallback(
      ({ message: msg = '', variant: v = 'success', callback: cb = null, duration: d = 3000 }) => {
         callback.current = cb;
         resetTimeout(d);
         setIsShowing(true);
         setMessage(msg);
         setVariant(v);
      },
      [resetTimeout]
   );

   const setErrorAlert = useCallback(
      ({ message: msg = 'Unable to dispatch action', err, callback: cb = null, duration: d = 6000 }) => {
         resetTimeout(d);
         const m = (
            <>
               <strong>{msg}</strong>
               <br />
               {getError(err).map((e, i, a) => (
                  <React.Fragment key={`error-${i}`}>
                     <p className="tw-m-0">{e}</p>
                     {i < a.length - 2 ? <br /> : null}
                  </React.Fragment>
               ))}
            </>
         );

         callback.current = cb;
         setIsShowing(true);
         setMessage(m);
         setVariant('danger');
      },
      [resetTimeout]
   );

   const alert = useMemo(() => ({ getAlert, setAlert, setErrorAlert }), [getAlert, setAlert, setErrorAlert]);

   return alert;
};
