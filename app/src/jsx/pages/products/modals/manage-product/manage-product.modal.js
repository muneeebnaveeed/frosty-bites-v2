import ModalWrapper from 'jsx/components/ModalWrapper';
import React, { useEffect, useRef, useMemo } from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';
import CreatableSelect from 'jsx/components/CreatableSelect';
import { api, getV2, post, useAlert, useQuery } from 'jsx/helpers';
import {
   setProductsData,
   setProductsVisibility,
   setTypesData,
   setTypesVisibility,
   setUnitsData,
   setUnitsVisibility,
} from 'store/actions';
import { Formik } from 'formik';
import { useMutation, useQueryClient } from 'react-query';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { When } from 'react-if';
import { handleFormError } from 'jsx/helpers/misc';
import { toast } from 'react-toastify';
import ManageProductForm from './manage-product-form';
import { productShema } from '../../validations';

const ManageProductModal = () => {
   const state = useSelector((s) => s.products);
   const dispatch = useDispatch();

   const nameInputRef = useRef();

   const queryClient = useQueryClient();

   const editingProductId = state.data._id;
   const isEditing = !!editingProductId;

   const createMutation = useMutation((payload) => post('/products', payload));
   const editMutation = useMutation((payload) => api.patch(`/products/id/${editingProductId}`, payload));

   const mutation = useMemo(
      () => (isEditing ? editMutation : createMutation),
      [createMutation, editMutation, isEditing]
   );

   const handleSubmit = (values, { resetForm, setErrors }) => {
      mutation.mutate(values, {
         onSuccess: async () => {
            dispatch(setProductsVisibility(false));
            dispatch(setProductsData({}));
            toast.success(`Product has been ${isEditing ? 'edited' : 'created'} successfully`);
            return queryClient.invalidateQueries('products').then(resetForm);
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
         validationSchema={productShema}
         onSubmit={handleSubmit}
         initialValues={{
            name: state.data.name ?? '',
            price: state.data.price ?? null,
            tags: state.data.tags || [],
         }}
      >
         {({ resetForm }) => {
            const handleHide = () => {
               resetForm();
               batch(() => {
                  dispatch(setProductsData({}));
                  dispatch(setProductsVisibility(false));
               });
            };

            return (
               <ModalWrapper
                  show={state.visible}
                  title={isEditing ? 'Edit Product' : 'Add New Product'}
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

export default ManageProductModal;
