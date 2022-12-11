import ModalWrapper from 'jsx/components/ModalWrapper';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CreatableSelect from 'jsx/components/CreatableSelect';
import { get, getV2, post, useAlert, useQuery } from 'jsx/helpers';
import Select from 'jsx/components/Select';
import { setUnitsData, setUnitsVisibility } from 'store/actions';
import { useFormik } from 'formik';
import { useMutation, useQueryClient } from 'react-query';
import { When } from 'react-if';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';

const AddNewUnit = () => {
   const state = useSelector((s) => s.units);
   const dispatch = useDispatch();
   const alert = useAlert();
   const queryClient = useQueryClient();
   const titleRef = useRef();

   const types = useQuery('types', () => getV2('/types'));

   const mutation = useMutation((payload) => post('/units', payload), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('units');
         dispatch(setUnitsVisibility(false));
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to add unit', err });
      },
   });

   const formik = useFormik({
      initialValues: {
         title: state.data.title ?? '',
         value: state.data.value ?? '',
         type: state.data.type,
      },
      onSubmit: (values, form) => {
         mutation.mutate(values);
         form.resetForm();
         dispatch(setUnitsData({}));
      },
   });

   useEffect(() => {
      if (state.visible) titleRef.current.focus();
      if (state.data.title) formik.setFieldValue('title', state.data.title);
      if (state.data.value) formik.setFieldValue('value', state.data.value);
      if (state.data.type) formik.setFieldValue('type', state.data.type);
   }, [state.visible]);

   return (
      <>
         <ModalWrapper
            show={state.visible}
            onHide={() => {
               dispatch(setUnitsVisibility(false));
            }}
            title="Add New Unit"
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
               </div>
               <div className="row">
                  <div className="form-group col-xl-12">
                     <label className="col-form-label">Value</label>
                     <input
                        className="form-control"
                        onChange={formik.handleChange}
                        type="number"
                        name="value"
                        value={formik.values.value}
                     />
                  </div>
               </div>
               <div className="row">
                  <div className="form-group col-xl-12">
                     <label className="col-form-label">Type</label>
                     {!types.isLoading && !types.isError && (
                        <CreatableSelect
                           onChange={(type) => formik.setFieldValue('type', type.value)}
                           options={types.data?.map((type) => ({ label: type.title, value: type }))}
                           onCreateOption={(title) => {
                              dispatch(setUnitsData({ title }));
                              dispatch(setUnitsVisibility(true));
                           }}
                        />
                     )}
                  </div>
               </div>
            </form>
         </ModalWrapper>
      </>
   );
};

export default AddNewUnit;
