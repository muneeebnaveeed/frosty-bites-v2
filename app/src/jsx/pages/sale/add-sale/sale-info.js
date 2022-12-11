import FormField from 'jsx/components/FormField';
import React, { useEffect } from 'react';
import { defaultSelectStyles } from 'jsx/components/Select';
import Select from 'react-select';

import { api, useQuery } from 'jsx/helpers';
import { useFormikContext } from 'formik';
import _cloneDeep from 'lodash/cloneDeep';
import { Col, Row } from 'react-bootstrap';
import { GET_ALL_PRODUCTS } from '../queries';
import { createSelectProductOption } from '../utils';

const selectTypeOptions = ['Dine-in', 'Takeaway', 'Delivery'].map((_type) => ({ label: _type, value: _type }));

const SaleInfo = () => {
   const products = useQuery('ALL-PRODUCTS', GET_ALL_PRODUCTS);
   const { values, setFieldValue } = useFormikContext();
   const selectedProducts = values.products;

   useEffect(() => {
      if (values.discount > 100) setFieldValue('discount', 100);
   }, [values.discount]);

   const handleSelectProduct = (product) => {
      const productId = product._id;

      const _selectedProducts = _cloneDeep(selectedProducts);

      const existingProductIndexInCart = _selectedProducts.findIndex((_product) => _product._id === productId);
      if (existingProductIndexInCart !== -1) _selectedProducts[existingProductIndexInCart].quantity++;
      else _selectedProducts.push({ _id: productId, quantity: 1 });

      localStorage.setItem('cartProducts', JSON.stringify(_selectedProducts));
      setFieldValue('products', _selectedProducts);
   };

   const handleSelectSaleType = (opt) => {
      const _isDelivery = opt.value === 'Delivery';
      if (_isDelivery) setFieldValue('deliveryCharges', 100);
      else if (values.deliveryCharges) setFieldValue('deliveryCharges', undefined);
      setFieldValue('saleType', opt.value);
   };

   const isDelivery = values.saleType === 'Delivery';

   return (
      <>
         <Row>
            <FormField column={6} name="saleType" label="Type">
               {() => (
                  <Select
                     styles={defaultSelectStyles}
                     value={selectTypeOptions.find((opt) => opt.value === values.saleType)}
                     onChange={handleSelectSaleType}
                     options={selectTypeOptions}
                  />
               )}
            </FormField>
            {isDelivery && (
               <FormField type="number" column={6} name="deliveryCharges" label="Delivery Charges" isRequired />
            )}
         </Row>
         <Row>
            <FormField column={6} name="products" label="Search Products" isRequired>
               {() => (
                  <Select
                     styles={defaultSelectStyles}
                     value={null}
                     onChange={handleSelectProduct}
                     options={products.data?.docs || []}
                     getOptionLabel={(_product) => _product.name}
                     getOptionValue={(_product) => _product._id}
                  />
               )}
            </FormField>
            <FormField type="number" min={0} max={100} column={6} name="discount" label="Discount" isRequired />
         </Row>
      </>
   );
};

export default SaleInfo;
