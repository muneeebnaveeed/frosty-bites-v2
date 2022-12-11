import ModalWrapper from 'jsx/components/ModalWrapper';
import Select from 'jsx/components/Select';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { get, put, useAlert, useQuery } from 'jsx/helpers';
import { isArray } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { When } from 'react-if';
import { useMutation, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';

const initialValues = {
   quantity: '',
   total: '',
   unit: '',
};

const RefundSale = ({ refundSale, toggle, onClose, onOpen, ...props }) => {
   const [isError, setIsError] = useState(false);

   const [quantity, setQuantity] = useState('');
   const [total, setTotal] = useState('');

   const queryClient = useQueryClient();

   const alert = useAlert();

   const handleChangeTotal = (t) => {
      setTotal(t);
   };

   const handleChangeQuantity = (q, i = null) => {
      setQuantity(q);
      console.log('handle', i);
      console.log('q:%s,retailPrice:%s,quantity:%s', q, i?.retailPrice, i?.quantity);
      handleChangeTotal(q * (i?.retailPrice ?? 0 / i?.quantity ?? 0));
   };

   const inventory = useQuery(['sale', refundSale], () => get(`/sales/id/${refundSale}`), {
      enabled: false,
      onSuccess: (data) => {
         handleChangeQuantity(1, data);
      },
   });

   const refundMutation = useMutation((payload) => put(`/sales/${refundSale}/refund/${payload}`), {
      onSuccess: () => {
         onClose();
         handleChangeQuantity(0, inventory.data);
         queryClient.invalidateQueries('sales');
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to refund sale', err });
      },
   });

   useEffect(() => {
      if (refundSale) inventory.refetch();
   }, [refundSale]);

   const alertMarkup = alert.getAlert();

   return (
      <>
         <ModalWrapper
            show={refundSale}
            onHide={() => {
               onClose();
               handleChangeQuantity(0);
            }}
            isLoading={refundMutation.isLoading}
            title="Refund Sale"
            onSubmit={() => {
               refundMutation.mutate(quantity);
            }}
            submitButtonText="Refund"
            size="xl"
            isDisabled={isError}
            {...props}
         >
            <When condition={inventory.isLoading}>
               <SpinnerOverlay />
            </When>
            {alertMarkup ? (
               <Row>
                  <Col lg={12}>{alertMarkup}</Col>
               </Row>
            ) : null}
            <Form>
               <Form.Group>
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                     type="number"
                     value={quantity}
                     onChange={(e) => handleChangeQuantity(e.target.value, inventory.data)}
                  />
               </Form.Group>

               <Form.Group>
                  <Form.Label>Total</Form.Label>
                  <Form.Control type="number" value={total} onChange={(e) => handleChangeTotal(e.target.value)} />
               </Form.Group>
            </Form>
            {/* <PurchaseInvoice printRef={printRef} data={getPrintData} invoiceNum={invoiceNum} /> */}
         </ModalWrapper>
      </>
   );
};

export default RefundSale;
