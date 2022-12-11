/* eslint-disable react/no-this-in-sfc */
import Button from 'jsx/components/Button';
import ModalWrapper from 'jsx/components/ModalWrapper';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { get, getV2, patch, post, useAlert, useMutation, useQuery } from 'jsx/helpers';
import PageTItle from 'jsx/layouts/PageTitle';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ButtonGroup, Card, Table } from 'react-bootstrap';
import { AiFillCaretLeft, AiFillSave } from 'react-icons/ai';
import { FaMinusCircle, FaPlusCircle } from 'react-icons/fa';
import { Else, If, Then, When } from 'react-if';
import { useHistory, useLocation } from 'react-router-dom';
import { setProductsData, setProductsVisibility, setSuppliersData, setSuppliersVisibility } from 'store/actions';
import { batch, useDispatch } from 'react-redux';
import cls from 'classnames';
import _ from 'lodash';
import produce from 'immer';
import QueryString from 'qs';
import CreatableSelect from '../../components/CreatableSelect';

const PurchaseActions = () => {
   const history = useHistory();

   const alert = useAlert();
   const dispatch = useDispatch();
   const location = useLocation();
   const [purchaseId, setPurchaseId] = useState(null);

   const [purchase, setPurchase] = useState({
      supplier: null,
      paid: '0',
      products: [{ product: null, sourcePrice: '0', variants: { a: '', b: '', c: '', d: '' }, quantity: '' }],
   });

   const existingPurchase = useQuery(['existing-purchase', purchaseId], () => getV2(`/purchases/id/${purchaseId}`), {
      enabled: false,
      onSuccess: (data) => {
         console.log(data);

         const updatedPurchase = produce(purchase, (draft) => {
            draft.supplier = data.supplier;
            draft.paid = data.paid;

            const processedProducts = data.products.map((p) => {
               const updatedProduct = { ...p };
               const unitValue = updatedProduct.product.unit.value;
               if (updatedProduct.product.type.title.toLowerCase() === 'tile') {
                  Object.entries(updatedProduct.variants).forEach(([key, value]) => {
                     let stringifiedQuantity = value / unitValue;
                     if (!Number.isInteger(stringifiedQuantity)) stringifiedQuantity = `${value}t`;
                     else stringifiedQuantity = `${stringifiedQuantity.toString()}b`;
                     updatedProduct.variants[key] = stringifiedQuantity;
                  });
               } else {
                  let stringifiedQuantity = updatedProduct.quantity / unitValue;
                  if (!Number.isInteger(stringifiedQuantity)) stringifiedQuantity = `${updatedProduct.quantity}t`;
                  else stringifiedQuantity = `${stringifiedQuantity.toString()}b`;
                  updatedProduct.quantity = stringifiedQuantity;
               }

               console.log(updatedProduct);
               return updatedProduct;
            });

            draft.products = processedProducts;
         });

         setPurchase(updatedPurchase);
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to get existing purchcase', err });
      },
   });

   useEffect(() => {
      const pId = location.state?.purchaseId;
      if (pId) setPurchaseId(pId);
   }, []);

   useEffect(() => {
      console.log('purchaseId:%s', purchaseId);
      if (purchaseId) existingPurchase.refetch();
   }, [purchaseId]);

   const suppliers = useQuery('all-suppliers', () =>
      getV2('/suppliers', { page: 1, limit: 1000, search: '', sort: { name: 1 } })
   );
   const unitsQuery = useQuery(['units'], () => get('/units', 1, 10000, ''));
   const products = useQuery('all-products', () =>
      getV2('/products', { page: 1, limit: 1000, search: '', sort: { modelNumber: 1 } })
   );

   const postMutation = useMutation((payload) => post('/purchases', payload), {
      onSuccess: () => {
         history.replace('/purchase');
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to add Purchase', err });
      },
   });

   const patchMutation = useMutation((payload) => patch(`/purchases/id/${purchaseId}`, payload), {
      onSuccess: () => {
         history.replace('/purchase');
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to edit Purchase', err });
      },
   });

   const mutation = useMemo(
      () => (purchaseId ? patchMutation : postMutation),
      [patchMutation, postMutation, purchaseId]
   );

   const handleChangeProduct = (key, value, index) => {
      const updatedPurchase = produce(purchase, (draft) => {
         draft.products[index][key] = value;
      });
      setPurchase(updatedPurchase);
   };

   const handleChangeVariantQuantity = (key, value, index) => {
      const updatedPurchase = produce(purchase, (draft) => {
         draft.products[index].variants[key] = value;
      });
      setPurchase(updatedPurchase);
   };

   const handleAddProduct = () => {
      const updatedPurchase = produce(purchase, (draft) => {
         draft.products.push({
            product: null,
            sourcePrice: '0',
            variants: { a: '', b: '', c: '', d: '' },
            quantity: '',
         });
      });
      setPurchase(updatedPurchase);
   };

   const handleRemoveProduct = (productIndex) => {
      const updatedPurchase = produce(purchase, (draft) => {
         draft.products.splice(productIndex, 1);
      });
      setPurchase(updatedPurchase);
   };

   const handleSubmit = (e) => {
      e.preventDefault();

      let error = '';

      const isValidQuantity = (qty) => qty.includes('t') || qty.includes('T') || qty.includes('b') || qty.includes('B');

      const payload = produce(purchase, (draft) => {
         draft.supplier = draft.supplier?._id;

         const referenceProducts = _.cloneDeep(draft.products);

         const updatedProducts = [];

         referenceProducts.forEach((referenceProduct, index) => {
            // product & price is must
            if (referenceProduct.product && referenceProduct.sourcePrice !== '') {
               const processedProduct = {};
               // send only product _id to backend
               processedProduct.product = referenceProduct.product._id;
               processedProduct.sourcePrice = Number(referenceProduct.sourcePrice);

               if (referenceProduct.quantity) {
                  if (!isValidQuantity(referenceProduct.quantity)) error = true;
                  processedProduct.quantity = referenceProduct.quantity;
               } else if (referenceProduct.variants) {
                  const variants = _.cloneDeep(referenceProduct.variants);

                  // delete empty variants
                  Object.entries(variants).forEach(([key, value]) => {
                     if (!value) return delete variants[key];
                     if (!isValidQuantity(value)) error = true;
                  });

                  if (Object.keys(variants).length > 0) processedProduct.variants = variants;
               }

               if (processedProduct.variants || processedProduct.quantity) updatedProducts.push(processedProduct);
            }
         });

         draft.products = updatedProducts;
      });

      const { supplier, paid } = payload;
      const messages = [];

      if (!supplier) messages.push('Please enter a supplier');
      if (paid === undefined || paid === null) messages.push('Please enter the paid amount');
      if (!payload.products.length) messages.push('Please enter product(s)');
      if (error) messages.push('Please enter valid units with quantity(s)');

      if (messages.length) {
         alert.setErrorAlert({
            messages: 'Unable to add new purchase',
            err: { response: { data: { data: messages } } },
         });
         return;
      }

      mutation.mutate(payload);
   };

   return (
      <>
         <When
            condition={
               mutation.isLoading ||
               unitsQuery.isLoading ||
               products.isLoading ||
               suppliers.isLoading ||
               (purchaseId ? existingPurchase.isLoading : false)
            }
         >
            <SpinnerOverlay />
         </When>
         <PageTItle activeMenu="Add New Purchase" motherMenu="Manage" />
         {alert.getAlert()}
         <form onSubmit={handleSubmit}>
            <Card>
               <Card.Header>
                  <Card.Title>Add New Purchase</Card.Title>
               </Card.Header>
               <Card.Body>
                  <div className="row">
                     <div className="form-group col-xl-2">
                        <label className="col-form-label">Supplier</label>
                        <CreatableSelect
                           value={
                              purchase.supplier ? { label: purchase.supplier.name, value: purchase.supplier } : null
                           }
                           onChange={(supplier) => setPurchase((prev) => ({ ...prev, supplier: supplier.value }))}
                           options={suppliers.data?.docs.map((supplier) => ({ label: supplier.name, value: supplier }))}
                           onCreateOption={(name) =>
                              batch(() => {
                                 dispatch(setSuppliersData({ name }));
                                 dispatch(setSuppliersVisibility(true));
                              })
                           }
                        />
                     </div>
                     <div className="form-group col-xl-2">
                        <label className="col-form-label">Paid</label>
                        <input
                           className="form-control"
                           onChange={(e) => setPurchase((prev) => ({ ...prev, paid: e.target.value }))}
                           type="text"
                           name="paid"
                           value={purchase.paid}
                        />
                     </div>
                     <div className="form-group tw-mt-[38px]">
                        <Button variant="primary" onClick={handleAddProduct}>
                           Add New Product
                        </Button>
                     </div>
                  </div>
               </Card.Body>
            </Card>

            <div className="tw-flex tw-flex-wrap tw-gap-4">
               {purchase.products.map((product, index) => (
                  <Card className="tw-max-w-[350px] tw-min-h-[435px]" key={`product-${index}`}>
                     <Card.Body>
                        <div className="form-group">
                           <label className="col-form-label">Product</label>
                           <CreatableSelect
                              value={
                                 purchase.products[index].product
                                    ? {
                                         label: purchase.products[index].product.modelNumber,
                                         value: purchase.products[index].product,
                                      }
                                    : null
                              }
                              onChange={(p) => handleChangeProduct('product', p.value, index)}
                              options={products.data?.docs.map((p) => ({
                                 label: p.modelNumber,
                                 value: p,
                              }))}
                              onCreateOption={(modelNumber) =>
                                 batch(() => {
                                    dispatch(setProductsData({ modelNumber }));
                                    dispatch(setProductsVisibility(true));
                                 })
                              }
                           />
                        </div>
                        <When condition={purchase.products[index].product}>
                           <If condition={purchase.products[index].product?.type.title.toLowerCase() !== 'tile'}>
                              <Then>
                                 <div className="form-group">
                                    <label className="col-form-label">Quantity</label>
                                    <input
                                       className="form-control"
                                       onChange={(e) => handleChangeProduct('quantity', e.target.value, index)}
                                       type="text"
                                       name="modelNumber"
                                       value={purchase.products[index].quantity}
                                    />
                                 </div>
                              </Then>
                              <Else>
                                 <div className="form-group">
                                    <label className="col-form-label">Quantity</label>
                                    <div className="row tw-px-4">
                                       <div className="col-xl-3 tw-p-0">
                                          <input
                                             className="form-control"
                                             onChange={(e) => handleChangeVariantQuantity('a', e.target.value, index)}
                                             type="text"
                                             name="modelNumber"
                                             placeholder="A"
                                             // disabled={isError}
                                             value={purchase.products[index].variants?.a}
                                          />
                                       </div>
                                       <div className="col-xl-3 tw-p-0">
                                          <input
                                             className="form-control"
                                             onChange={(e) => handleChangeVariantQuantity('b', e.target.value, index)}
                                             type="text"
                                             name="modelNumber"
                                             placeholder="B"
                                             // disabled={isError}
                                             value={purchase.products[index].variants?.b}
                                          />
                                       </div>
                                       <div className="col-xl-3 tw-p-0">
                                          <input
                                             className="form-control"
                                             onChange={(e) => handleChangeVariantQuantity('c', e.target.value, index)}
                                             type="text"
                                             name="modelNumber"
                                             placeholder="C"
                                             // disabled={isError}
                                             value={purchase.products[index].variants?.c}
                                          />
                                       </div>
                                       <div className="col-xl-3 tw-p-0">
                                          <input
                                             className="form-control"
                                             onChange={(e) => handleChangeVariantQuantity('d', e.target.value, index)}
                                             type="text"
                                             name="modelNumber"
                                             placeholder="D"
                                             // disabled={isError}
                                             value={purchase.products[index].variants?.d}
                                          />
                                       </div>
                                    </div>
                                 </div>
                              </Else>
                           </If>
                        </When>
                        <div className={cls('form-group', { 'tw-mt-[126px]': !purchase.products[index].product })}>
                           <label className="col-form-label">Price</label>
                           <input
                              className="form-control"
                              onChange={(e) => handleChangeProduct('sourcePrice', e.target.value, index)}
                              type="number"
                              name="modelNumber"
                              value={purchase.products[index].sourcePrice}
                           />
                        </div>
                        <When condition={index > 0}>
                           <Button
                              variant="danger"
                              className="tw-w-full tw-flex tw-justify-center"
                              onClick={() => handleRemoveProduct(index)}
                           >
                              Remove
                           </Button>
                        </When>
                     </Card.Body>
                  </Card>
               ))}
            </div>

            <Card>
               <Card.Footer>
                  <div className="row">
                     <div className="col-xl-12 tw-justify-center">
                        <ButtonGroup>
                           <Button
                              icon={AiFillCaretLeft}
                              variant="warning light"
                              onClick={() => history.replace('/purchase')}
                              loading={mutation.isLoading}
                           >
                              Back
                           </Button>
                           <Button icon={AiFillSave} variant="primary" type="submit" loading={mutation.isLoading}>
                              Save
                           </Button>
                        </ButtonGroup>
                     </div>
                  </div>
               </Card.Footer>
            </Card>
         </form>
      </>
   );
};

export default PurchaseActions;
