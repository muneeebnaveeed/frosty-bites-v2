import { toast } from 'react-toastify';

export const handleToastError = (error) => {
   let toastMessage = null;
   const errorMessages = error.response?.data.data;
   if (errorMessages) {
      // eslint-disable-next-line prefer-destructuring
      if (Array.isArray(errorMessages)) toastMessage = errorMessages[0];
      else toastMessage = errorMessages;
   } else toastMessage = error.message;
   toast.error(toastMessage);
};

export const handleValidationErrors = (setErrors) => (error) => {
   const isValidationError = error?.response.data.status === 'validationError';
   if (isValidationError) setErrors(error.response.data.data);
   return isValidationError;
};

export const handleFormError =
   (setErrors, callback = () => {}) =>
   (error, context) => {
      callback(error, context);
      const isValidationError = handleValidationErrors(setErrors)(error);
      if (isValidationError) return;
      handleToastError(error);
   };

export const initialSort = { field: '_id', order: -1 };

export const currencyFormatter = new Intl.NumberFormat('en-IN', {
   maximumFractionDigits: 0,
   style: 'currency',
   currency: 'PKR',
});
