import ModalWrapper from 'jsx/components/ModalWrapper';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CreatableSelect from 'jsx/components/CreatableSelect';
import { get, getV2, post, useAlert, useQuery } from 'jsx/helpers';
import Select from 'jsx/components/Select';
import { setExpensesData, setExpensesVisibility } from 'store/actions';
import { useFormik } from 'formik';
import { useMutation, useQueryClient } from 'react-query';
import { When } from 'react-if';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';

const AddNewExpense = () => {
   const state = useSelector((s) => s.expenses);
   const dispatch = useDispatch();
   const alert = useAlert();
   const queryClient = useQueryClient();
   const titleRef = useRef();

   const mutation = useMutation((payload) => post('/expenses', payload), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('expenses');
         dispatch(setExpensesVisibility(false));
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to add expense', err });
      },
   });

   const formik = useFormik({
      initialValues: {
         title: state.data.title ?? '',
         amount: state.data.amount ?? '',
      },
      onSubmit: (values, form) => {
         mutation.mutate(values);
         form.resetForm();
         dispatch(setExpensesData({}));
      },
   });

   useEffect(() => {
      if (state.visible) titleRef.current.focus();
      if (state.data.title) formik.setFieldValue('title', state.data.title);
      if (state.data.amount) formik.setFieldValue('amount', state.data.amount);
   }, [state.visible]);

   return (
      <>
         <ModalWrapper
            show={state.visible}
            onHide={() => {
               dispatch(setExpensesVisibility(false));
            }}
            title="Add New Expense"
            isLoading={mutation.isLoading}
            size="md"
            onSubmit={formik.handleSubmit}
            submitButtonText="Save"
         >
            <When condition={mutation.isLoading}>
               <SpinnerOverlay />
            </When>
            {alert.getAlert()}

            <form onSubmit={formik.handleSubmit}>
               <div className="row">
                  <div className="form-group col-xl-12">
                     <label className="col-form-label">Title</label>
                     <input
                        ref={titleRef}
                        className="form-control"
                        onChange={formik.handleChange}
                        type="text"
                        name="title"
                        value={formik.values.title}
                     />
                  </div>
                  <div className="form-group col-xl-12">
                     <label className="col-form-label">Amount</label>
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

export default AddNewExpense;
