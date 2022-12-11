import ModalWrapper from 'jsx/components/ModalWrapper';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CreatableSelect from 'jsx/components/CreatableSelect';
import { get, getV2, post, useAlert, useQuery } from 'jsx/helpers';
import Select from 'jsx/components/Select';
import { setTypesData, setTypesVisibility } from 'store/actions';
import { useFormik } from 'formik';
import { useMutation, useQueryClient } from 'react-query';
import { When } from 'react-if';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';

const AddNewType = () => {
   const state = useSelector((s) => s.types);
   const dispatch = useDispatch();
   const alert = useAlert();
   const queryClient = useQueryClient();
   const titleRef = useRef();

   const mutation = useMutation((payload) => post('/types', payload), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('types');
         dispatch(setTypesVisibility(false));
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to add type', err });
      },
   });

   const formik = useFormik({
      initialValues: {
         title: state.data.title ?? '',
      },
      onSubmit: (values, form) => {
         mutation.mutate(values);
         form.resetForm();
         dispatch(setTypesData({}));
      },
   });

   useEffect(() => {
      if (state.visible) titleRef.current.focus();
      if (state.data.title) formik.setFieldValue('title', state.data.title);
   }, [state.visible]);

   return (
      <>
         <ModalWrapper
            show={state.visible}
            onHide={() => {
               dispatch(setTypesVisibility(false));
            }}
            title="Add New Type"
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
            </form>
         </ModalWrapper>
      </>
   );
};

export default AddNewType;
