import FormField from 'jsx/components/FormField';
import React, { forwardRef } from 'react';

const _ManageEmployeeForm = ({ ...restProps }, ref) => (
   <div className="row">
      <FormField ref={ref} label="Name" name="name" isRequired />
      <FormField type="number" label="Phone" name="phone" isRequired />
      <FormField type="number" label="Salary" name="salary" isRequired />
   </div>
);

const ManageEmployeeForm = forwardRef(_ManageEmployeeForm);

export default ManageEmployeeForm;
