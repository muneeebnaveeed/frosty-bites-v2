import { useFormikContext } from 'formik';
import React, { forwardRef } from 'react';

const _FormikField = ({ type = 'text', name = '', ...restProps }, ref) => {
   const { handleChange, handleBlur, values } = useFormikContext();
   return (
      <input
         type={type}
         id={name}
         name={name}
         value={values[name]}
         onChange={handleChange}
         onBlur={handleBlur}
         ref={ref}
         autoComplete="off"
         {...restProps}
      />
   );
};

const FormikField = forwardRef(_FormikField);

export default FormikField;
