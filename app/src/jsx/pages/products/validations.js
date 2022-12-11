import * as yup from 'yup';

export const productShema = yup.object().shape({
   name: yup
      .string()
      .trim()
      .min(1, 'Product name is required')
      .max(55, 'Product name is too long')
      .required('Product name is required'),
   price: yup
      .number()
      .typeError('Product price is required')
      .min(0, 'Invalid product price')
      .required('Product price is required'),
   tags: yup.array(yup.string()).required('Please select product tags'),
});
