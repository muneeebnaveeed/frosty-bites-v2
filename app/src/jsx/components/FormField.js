/* eslint-disable react/display-name */
import { ErrorMessage, Field, useFormikContext } from 'formik';
import React, { forwardRef } from 'react';
import cls from 'classnames';
import { When } from 'react-if';
import FormikField from './FormikField';

const FormField = forwardRef(
   (
      {
         containerClassName = '',
         labelClassName = '',
         inputClassName = '',
         label = '',
         name = '',
         children,
         isRequired = false,
         column = 12,
         ...restProps
      },
      ref
   ) => {
      const { errors } = useFormikContext();
      const fieldError = errors[name];

      return (
         <div className={cls(`form-group col-xl-${column}`, containerClassName)}>
            <label htmlFor={name} className={cls('col-form-label', labelClassName)}>
               {label}{' '}
               <When condition={isRequired}>
                  <span className="text-danger">*</span>
               </When>
            </label>
            {children ? (
               <Field name={name}>{children}</Field>
            ) : (
               <FormikField
                  ref={ref}
                  name={name}
                  className={cls('form-control', inputClassName, { 'is-invalid': !!fieldError })}
                  {...restProps}
               />
            )}
            <When condition={!!fieldError}>
               <div className="invalid-feedback">{fieldError}</div>
            </When>
         </div>
      );
   }
);

export default FormField;
