import ModalWrapper from 'jsx/components/ModalWrapper';
import React, { useEffect, useRef, useMemo } from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';
import CreatableSelect from 'jsx/components/CreatableSelect';
import { api, getV2, post, useAlert, useQuery } from 'jsx/helpers';
import { setEmployeesData, setEmployeesVisibility, setProductsData, setProductsVisibility } from 'store/actions';
import { Formik } from 'formik';
import { useMutation, useQueryClient } from 'react-query';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { When } from 'react-if';
import { handleFormError } from 'jsx/helpers/misc';
import { toast } from 'react-toastify';
import ManageProductForm from './manage-employee-form';
import { employeeSchema } from '../../validations';

const ManageEmployeeModal = () => {
   const state = useSelector((s) => s.employees);
   const dispatch = useDispatch();

   const nameInputRef = useRef();

   const queryClient = useQueryClient();

   const editingProductId = state.data._id;
   const isEditing = !!editingProductId;

   const createMutation = useMutation((payload) => post('/employees', payload));
   const editMutation = useMutation((payload) => api.patch(`/employees/id/${editingProductId}`, payload));

   const mutation = useMemo(
      () => (isEditing ? editMutation : createMutation),
      [createMutation, editMutation, isEditing]
   );

   const handleSubmit = (values, { resetForm, setErrors }) => {
      mutation.mutate(values, {
         onSuccess: async () => {
            dispatch(setEmployeesVisibility(false));
            dispatch(setEmployeesData({}));
            toast.success(`Employee has been ${isEditing ? 'edited' : 'created'} successfully`);
            return queryClient.invalidateQueries('employees').then(resetForm);
         },
         onError: handleFormError(setErrors),
      });
   };

   const handleShow = () => {
      nameInputRef.current.focus();
   };

   const shouldShowSpinner = mutation.isLoading;

   return (
      <Formik
         enableReinitialize
         validateOnBlur={false}
         validateOnChange={false}
         validateOnMount={false}
         validationSchema={employeeSchema}
         onSubmit={handleSubmit}
         initialValues={{
            name: state.data.name ?? '',
            mobile: state.data.mobile ?? '',
            salary: state.data.salary ?? null,
         }}
      >
         {({ resetForm }) => {
            const handleHide = () => {
               resetForm();
               batch(() => {
                  dispatch(setEmployeesData({}));
                  dispatch(setEmployeesVisibility(false));
               });
            };

            return (
               <ModalWrapper
                  show={state.visible}
                  title={isEditing ? 'Edit Employee' : 'Add New Employee'}
                  isLoading={shouldShowSpinner}
                  onShow={handleShow}
                  onHide={handleHide}
                  includeFormikForm
               >
                  <When condition={shouldShowSpinner}>
                     <SpinnerOverlay />
                  </When>
                  <ManageProductForm ref={nameInputRef} />
               </ModalWrapper>
            );
         }}
      </Formik>
   );
};

export default ManageEmployeeModal;
