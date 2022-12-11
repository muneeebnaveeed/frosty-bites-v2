import ModalWrapper from 'jsx/components/ModalWrapper';
import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CreatableSelect from 'jsx/components/CreatableSelect';
import { get, getV2, patch, post, useAlert, useQuery } from 'jsx/helpers';
import Select from 'jsx/components/Select';
import { setInventoriesData, setInventoriesVisibility, setProductsData, setProductsVisibility } from 'store/actions';
import { useFormik } from 'formik';
import { QueryClient, useMutation, useQueryClient } from 'react-query';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { Else, If, Then, When } from 'react-if';
import produce from 'immer';

const AddNewInventory = () => {
   const state = useSelector((s) => s.inventories);
   const dispatch = useDispatch();
   const alert = useAlert();

   const queryClient = useQueryClient();

   const products = useQuery('all-products', () =>
      getV2('/products', { page: 1, limit: 1000, sort: { modelNumber: 1 }, search: '' })
   );

   const postMutation = useMutation((payload) => post('/inventories', payload), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('inventories');
         dispatch(setInventoriesVisibility(false));
         dispatch(setInventoriesData({}));
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to add inventory', err });
      },
   });

   const patchMutation = useMutation((payload) => patch('/inventories', payload), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('inventories');
         dispatch(setInventoriesVisibility(false));
         dispatch(setInventoriesData({}));
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to edit inventory', err });
      },
   });

   const mutation = useMemo(
      () => (state.data.product ? patchMutation : postMutation),
      [patchMutation, postMutation, state.data.product]
   );

   const formik = useFormik({
      initialValues: {
         product: state.data.product,
         quantity: state.data.quantity ?? '',
         variants: {
            a: state.data.variants?.a ?? '',
            b: state.data.variants?.b ?? '',
            c: state.data.variants?.c ?? '',
            d: state.data.variants?.d ?? '',
         },
      },
      onSubmit: (values, form) => {
         const payload = { product: values.product._id };

         const { variants, quantity } = values;

         if (quantity) payload.quantity = quantity;
         else {
            const filteredVariants = {};
            Object.entries(variants).forEach(([key, value]) => {
               if (value) filteredVariants[key] = value;
            });

            if (Object.values(filteredVariants).length) payload.variants = filteredVariants;
         }

         mutation.mutate([payload]);
         form.resetForm();
      },
   });

   useEffect(() => {
      if (state.data.product) formik.setFieldValue('product', state.data.product);
      if (state.data.quantity) formik.setFieldValue('quantity', state.data.quantity);
      if (state.data.variants) formik.setFieldValue('variants', state.data.variants);
   }, [state.visible]);

   const handleChangeVariantQuantity = (key, value) => {
      const updatedValues = produce(formik.values, (draft) => {
         draft.variants[key] = value;
      });
      formik.setValues(updatedValues);
   };

   return (
      <>
         <ModalWrapper
            show={state.visible}
            onHide={() => {
               dispatch(setInventoriesVisibility(false));
               dispatch(setInventoriesData({}));
            }}
            title={`${state.data.product ? 'Edit' : 'Add New'} Inventory`}
            isLoading={products.isLoading || mutation.isLoading}
            size="md"
            onSubmit={formik.handleSubmit}
            submitButtonText="Save"
         >
            <When condition={products.isLoading || mutation.isLoading}>
               <SpinnerOverlay />
            </When>
            {alert.getAlert()}
            <form onSubmit={formik.handleSubmit}>
               <div className="row">
                  <div className="form-group col-xl-12">
                     <label className="col-form-label">Product</label>
                     <CreatableSelect
                        defaultValue={
                           state.data.product
                              ? { label: state.data.product.modelNumber, value: state.data.product }
                              : {}
                        }
                        onChange={(product) => formik.setFieldValue('product', product.value)}
                        options={products.data?.docs.map((product) => ({ label: product.modelNumber, value: product }))}
                        onCreateOption={(modelNumber) => {
                           dispatch(setProductsData({ modelNumber }));
                           dispatch(setProductsVisibility(true));
                        }}
                     />
                  </div>
                  <When condition={formik.values.product}>
                     <If condition={formik.values.product?.type.title.toLowerCase() !== 'tile'}>
                        <Then>
                           <div className="form-group col-12">
                              <label className="col-form-label">Quantity</label>
                              <input
                                 className="form-control"
                                 onChange={formik.handleChange}
                                 type="text"
                                 name="quantity"
                                 value={formik.values.quantity}
                              />
                           </div>
                        </Then>
                        <Else>
                           <div className="form-group col-xl-12">
                              <label className="col-form-label">Quantity</label>
                              <div className="row tw-mx-0">
                                 <div className="col-xl-3 tw-p-0">
                                    <input
                                       className="form-control"
                                       onChange={(e) => handleChangeVariantQuantity('a', e.target.value)}
                                       type="text"
                                       placeholder="A"
                                       value={formik.values.variants.a}
                                    />
                                 </div>
                                 <div className="col-xl-3 tw-p-0">
                                    <input
                                       className="form-control"
                                       onChange={(e) => handleChangeVariantQuantity('b', e.target.value)}
                                       type="text"
                                       placeholder="B"
                                       value={formik.values.variants.b}
                                    />
                                 </div>
                                 <div className="col-xl-3 tw-p-0">
                                    <input
                                       className="form-control"
                                       onChange={(e) => handleChangeVariantQuantity('c', e.target.value)}
                                       type="text"
                                       placeholder="C"
                                       value={formik.values.variants.c}
                                    />
                                 </div>
                                 <div className="col-xl-3 tw-p-0">
                                    <input
                                       className="form-control"
                                       onChange={(e) => handleChangeVariantQuantity('d', e.target.value)}
                                       type="text"
                                       placeholder="D"
                                       value={formik.values.variants.d}
                                    />
                                 </div>
                              </div>
                           </div>
                        </Else>
                     </If>
                  </When>
               </div>
            </form>
         </ModalWrapper>
      </>
   );
};

export default AddNewInventory;
