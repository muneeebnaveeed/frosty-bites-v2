import * as yup from 'yup';

export const employeeSchema = yup.object().shape({
   name: yup
      .string()
      .trim()
      .min(1, 'Employee name is required')
      .max(55, 'Employee name is too long')
      .required('Employee name is required'),
   phone: yup.string().min(0, 'Invalid phone').required('Phone is required'),
   salary: yup.number().typeError('Salary is required').min(0, 'Invalid salary').required('Salary is required'),
});
