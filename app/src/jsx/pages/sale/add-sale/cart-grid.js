import { useFormikContext } from 'formik';
import Button from 'jsx/components/Button';
import { useQuery } from 'jsx/helpers';
import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { ButtonGroup, Table } from 'react-bootstrap';
import { When } from 'react-if';
import _cloneDeep from 'lodash/cloneDeep';
import { currencyFormatter } from 'jsx/helpers/misc';
import { GET_ALL_PRODUCTS } from '../queries';
import Receipt from './receipt';

const ResultRow = ({ subtotal, isDelivery, deliveryCharges, discountPercentage, absoluteDiscount, total }) => {
   const getDiscount = () => {
      if (!discountPercentage) return 'NONE';
      if (discountPercentage >= 100) return 'FULL';
      return `${discountPercentage}% - ${currencyFormatter.format(absoluteDiscount)}`;
   };
   const getTotal = () => {
      if (discountPercentage >= 100) return 'FREE';
      return currencyFormatter.format(total);
   };
   const getDeliveryCharges = () => {
      if (!deliveryCharges) return 'NONE';
      return currencyFormatter.format(deliveryCharges);
   };
   return (
      <>
         <tr>
            <td />
            <td />
            <td />
            <td>
               <strong>SUBTOTAL</strong>
            </td>
            <td>
               <strong>{currencyFormatter.format(subtotal)}</strong>
            </td>
            <td />
         </tr>
         <tr>
            <td />
            <td />
            <td />
            <td>
               <strong>DISCOUNT</strong>
            </td>
            <td>
               <strong>{getDiscount()}</strong>
            </td>
            <td />
         </tr>
         {isDelivery && (
            <tr>
               <td />
               <td />
               <td />
               <td>
                  <strong>DELIVERY CHARGES</strong>
               </td>
               <td>
                  <strong>{getDeliveryCharges()}</strong>
               </td>
               <td />
            </tr>
         )}
         <tr>
            <td />
            <td />
            <td />
            <td>
               <strong>TOTAL</strong>
            </td>
            <td>
               <strong>{getTotal()}</strong>
            </td>
            <td />
         </tr>
      </>
   );
};

const _CartGrid = ({ generatedSaleId }, ref) => {
   const { values, setFieldValue } = useFormikContext();

   const products = useQuery('ALL-PRODUCTS', GET_ALL_PRODUCTS);

   const selectedProducts = useMemo(() => {
      const cartProducts = values.products;
      return cartProducts.map((elm) => {
         const _cartProduct = _cloneDeep(elm);
         const populatedProduct = (products.data?.docs || []).find((_product) => _product._id === _cartProduct._id);
         if (!populatedProduct) return undefined;

         delete _cartProduct._id;

         // eslint-disable-next-line no-shadow
         const subtotal = _cartProduct.quantity * populatedProduct.price;
         return { ..._cartProduct, product: populatedProduct, subtotal };
      });
   }, [products.data?.docs, values.products]);

   const { subtotal, absoluteDiscount, total } = useMemo(() => {
      const subtotals = [0, 0, ...selectedProducts.filter(Boolean).map((_product) => _product.subtotal)];
      // eslint-disable-next-line no-shadow
      const subtotal = subtotals.reduce((a, b) => a + b, 0);
      const discountPercentage = values.discount;

      const deliveryCharges = values.deliveryCharges || 0;

      // eslint-disable-next-line no-shadow
      let total = subtotal + deliveryCharges;
      // eslint-disable-next-line no-shadow
      let absoluteDiscount = 0;
      if (discountPercentage) {
         absoluteDiscount = Math.floor(subtotal * (discountPercentage / 100));
         total -= absoluteDiscount;
      }
      return { subtotal, absoluteDiscount, total: Math.floor(total) };
   }, [selectedProducts, values.deliveryCharges, values.discount]);

   const draftAndSave = (productId, callback) => {
      const _cartProducts = _cloneDeep(values.products);
      const productIndex = _cartProducts.findIndex((_product) => _product._id === productId);
      if (productIndex === -1) return;
      callback(_cartProducts, { productIndex });

      localStorage.setItem('cartProducts', JSON.stringify(_cartProducts));
      setFieldValue('products', _cartProducts);
   };

   const deleteProduct = (_products, index) => _products.splice(index, 1);

   const handleDecrement = (productId) => {
      draftAndSave(productId, (_cartProducts, { productIndex }) => {
         const product = _cartProducts[productIndex];
         if (product.quantity <= 1) return deleteProduct(_cartProducts, productIndex);
         product.quantity--;
      });
   };

   const handleIncrement = (productId) => {
      draftAndSave(productId, (_cartProducts, { productIndex }) => {
         const product = _cartProducts[productIndex];
         product.quantity++;
      });
   };

   const handleDiscard = (productId) => {
      draftAndSave(productId, (_cartProducts, { productIndex }) => deleteProduct(_cartProducts, productIndex));
   };

   useEffect(() => {
      const existingCartProducts = JSON.parse(localStorage.getItem('cartProducts') || '[]');
      if (existingCartProducts.length > 0) setFieldValue('products', existingCartProducts);
   }, []);

   const isCartEmpty = selectedProducts.filter(Boolean).length <= 0;

   return (
      <>
         <Table className="tw-relative" responsive>
            <thead>
               <tr>
                  <th className="width80">
                     <strong>#</strong>
                  </th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>
                     <strong>Actions</strong>
                  </th>
               </tr>
            </thead>
            <tbody>
               {(selectedProducts || []).filter(Boolean).map((e, index) => (
                  <tr key={`selected-product-${e.product._id}`}>
                     <td>
                        <strong>{index + 1}</strong>
                     </td>
                     <td>{e.product.name}</td>
                     <td>{currencyFormatter.format(e.product.price)}</td>
                     <td>{e.quantity}</td>
                     <td>{currencyFormatter.format(e.subtotal)}</td>
                     <td>
                        <div className="tw-flex tw-gap-3">
                           <ButtonGroup>
                              <Button size="sm" variant="light" onClick={() => handleDecrement(e.product._id)}>
                                 -
                              </Button>
                              <Button size="sm" variant="light" onClick={() => handleIncrement(e.product._id)}>
                                 +
                              </Button>
                           </ButtonGroup>
                           <Button size="sm" variant="danger" onClick={() => handleDiscard(e.product._id)}>
                              Discard
                           </Button>
                        </div>
                     </td>
                  </tr>
               ))}
               <When condition={!isCartEmpty}>
                  <ResultRow
                     subtotal={subtotal}
                     discountPercentage={values.discount}
                     absoluteDiscount={absoluteDiscount}
                     isDelivery={values.saleType === 'Delivery'}
                     deliveryCharges={values.deliveryCharges}
                     total={total}
                  />
               </When>
            </tbody>
         </Table>
         <When condition={isCartEmpty}>
            <p className="tw-m-0">Cart is empty</p>
         </When>
         <Receipt
            saleId={generatedSaleId}
            saleType={values.saleType}
            subtotal={subtotal}
            discountPercentage={values.discount}
            absoluteDiscount={absoluteDiscount}
            deliveryCharges={values.deliveryCharges}
            total={total}
            products={(selectedProducts || []).filter(Boolean)}
            ref={ref}
         />
      </>
   );
};

const CartGrid = forwardRef(_CartGrid);

export default CartGrid;
