import ModalWrapper from 'jsx/components/ModalWrapper';
import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CreatableSelect from 'jsx/components/CreatableSelect';
import { get, getV2, patch, post, useAlert, useQuery } from 'jsx/helpers';
import Select from 'jsx/components/Select';
import {
   setTypesData,
   setSu,
   setSuppliersVisibilityppliersVisibility,
   setSuppliersVisibility,
   setSuppliersData,
} from 'store/actions';
import { useFormik } from 'formik';
import { useMutation, useQueryClient } from 'react-query';
import { When } from 'react-if';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';

const AddNewSupplier = () => {
   const state = useSelector((s) => s.suppliers);
   const dispatch = useDispatch();
   const alert = useAlert();
   const queryClient = useQueryClient();
   const nameRef = useRef();

   const postMutation = useMutation((payload) => post('/suppliers', payload), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('suppliers');
         dispatch(setSuppliersData({}));
         dispatch(setSuppliersVisibility(false));
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to add supplier', err });
      },
   });

   const patchMutation = useMutation((payload) => patch(`/suppliers/id/${state.data._id}`, payload), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('suppliers');
         dispatch(setSuppliersVisibility(false));
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to edit supplier', err });
      },
   });

   const mutation = useMemo(
      () => (state.data.name ? patchMutation : postMutation),
      [patchMutation, postMutation, state.data.name]
   );

   const formik = useFormik({
      initialValues: {
         name: state.data.name ?? '',
         phone: state.data.phone ?? '',
         company: state.data.company ?? '',
      },
      onSubmit: (values, form) => {
         mutation.mutate(values);
         form.resetForm();
      },
   });

   useEffect(() => {
      if (state.visible) nameRef.current.focus();
      if (state.data.name) formik.setFieldValue('name', state.data.name);
      if (state.data.phone) formik.setFieldValue('phone', state.data.phone);
      if (state.data.company) formik.setFieldValue('company', state.data.company);
   }, [state.visible]);

   return (
      <>
         <ModalWrapper
            show={state.visible}
            onHide={() => {
               dispatch(setSuppliersVisibility(false));
            }}
            title={`${state.data._id ? 'Edit' : 'Add New'} Supplier`}
            isLoading={postMutation.isLoading || patchMutation.isLoading}
            size="md"
            onSubmit={formik.handleSubmit}
            submitButtonText="Save"
         >
            <When condition={postMutation.isLoading || patchMutation.isLoading}>
               <SpinnerOverlay />
            </When>
            {alert.getAlert()}

            <form onSubmit={formik.handleSubmit}>
               <div className="row">
                  <div className="form-group col-xl-12">
                     <label className="col-form-label">Name</label>
                     <input
                        ref={nameRef}
                        className="form-control"
                        onChange={formik.handleChange}
                        type="text"
                        name="name"
                        value={formik.values.name}
                     />
                  </div>
               </div>
               <div className="row">
                  <div className="form-group col-xl-12">
                     <label className="col-form-label">Phone</label>
                     <input
                        className="form-control"
                        onChange={formik.handleChange}
                        type="text"
                        name="phone"
                        value={formik.values.phone}
                     />
                  </div>
               </div>
               <div className="row">
                  <div className="form-group col-xl-12">
                     <label className="col-form-label">Company</label>
                     <input
                        className="form-control"
                        onChange={formik.handleChange}
                        type="text"
                        name="company"
                        value={formik.values.company}
                     />
                  </div>
               </div>
            </form>
         </ModalWrapper>
      </>
   );
};

export default AddNewSupplier;
