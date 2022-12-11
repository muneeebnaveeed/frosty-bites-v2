import ModalWrapper from 'jsx/components/ModalWrapper';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CreatableSelect from 'jsx/components/CreatableSelect';
import { get, getV2, post, useAlert, useQuery } from 'jsx/helpers';
import Select from 'jsx/components/Select';
import { setEmployeesData, setEmployeesVisibility, setSalariesData, setSalariesVisibility } from 'store/actions';
import { useFormik } from 'formik';
import { QueryClient, useMutation, useQueryClient } from 'react-query';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { When } from 'react-if';

const AddNewSalary = () => {
   const state = useSelector((s) => s.salaries);
   const dispatch = useDispatch();
   const alert = useAlert();

   const queryClient = useQueryClient();

   const employees = useQuery('all-employees', () =>
      getV2('/employees', { page: 1, limit: 1000, search: '', sort: { name: 1 } })
   );

   const mutation = useMutation((payload) => post('/salaries', payload), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('salaries');
         dispatch(setSalariesVisibility(false));
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to add salary', err });
      },
   });

   const formik = useFormik({
      initialValues: {
         employee: state.data.employee,
         amount: state.data.amount ?? '',
      },
      onSubmit: (values, form) => {
         const payload = { amount: values.amount, employee: values.employee?._id };
         mutation.mutate(payload);
         form.resetForm();
         dispatch(setSalariesData({}));
      },
   });

   useEffect(() => {
      if (state.data.amount) formik.setFieldValue('amount', state.data.amount);
   }, [state.visible]);

   return (
      <>
         <ModalWrapper
            show={state.visible}
            onHide={() => {
               dispatch(setSalariesVisibility(false));
            }}
            title="Add New Salary"
            isLoading={employees.isLoading || mutation.isLoading}
            size="md"
            onSubmit={formik.handleSubmit}
            submitButtonText="Save"
         >
            <When condition={employees.isLoading || mutation.isLoading}>
               <SpinnerOverlay />
            </When>
            {alert.getAlert()}
            <form onSubmit={formik.handleSubmit}>
               <div className="row">
                  <div className="form-group col-xl-12">
                     <label className="col-form-label">Employee</label>
                     <CreatableSelect
                        width="tw-w-full"
                        onChange={(employee) => {
                           formik.setFieldValue('employee', employee.value);
                           formik.setFieldValue('amount', employee.value.salary);
                        }}
                        options={employees.data?.docs.map((employee) => ({ label: employee.name, value: employee }))}
                        onCreateOption={(name) => {
                           dispatch(setEmployeesData({ name }));
                           dispatch(setEmployeesVisibility(true));
                        }}
                     />
                  </div>
                  <div className="form-group col-xl-12">
                     <label className="col-form-label">Salary</label>
                     <input
                        className="form-control"
                        onChange={formik.handleChange}
                        type="text"
                        name="amount"
                        value={formik.values.amount}
                     />
                  </div>
               </div>
            </form>
         </ModalWrapper>
      </>
   );
};

export default AddNewSalary;
