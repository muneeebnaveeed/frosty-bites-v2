import ModalWrapper from 'jsx/components/ModalWrapper';
import Select from 'jsx/components/Select';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { get, post, put, useAlert, useQuery } from 'jsx/helpers';
import { isArray } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { When } from 'react-if';
import { useMutation, useQueryClient } from 'react-query';

const ClearSale = ({ initialAmount, clearSale, toggle, onClose, onOpen, ...props }) => {
   const [amount, setAmount] = useState(0);

   useEffect(() => setAmount(initialAmount), [initialAmount]);

   const queryClient = useQueryClient();

   const alert = useAlert();

   const clearMutation = useMutation((payload) => post(`/sales/pay/id/${clearSale}/amount/${payload}`), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('sales');
         onClose();
         setAmount(0);
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to clear sale', err });
      },
   });

   const alertMarkup = alert.getAlert();

   return (
      <>
         <ModalWrapper
            show={clearSale}
            onHide={() => {
               onClose();
               setAmount(0);
            }}
            isLoading={clearMutation.isLoading}
            title="Clear Sale"
            onSubmit={() => {
               clearMutation.mutate(amount);
            }}
            submitButtonText="Clear"
            size="xl"
            {...props}
         >
            <When condition={clearMutation.isLoading}>
               <SpinnerOverlay />
            </When>
            {alertMarkup ? (
               <Row>
                  <Col lg={12}>{alertMarkup}</Col>
               </Row>
            ) : null}
            <Form onSubmit={() => clearMutation.mutate(amount)}>
               <Form.Group>
                  <Form.Label>Amount</Form.Label>
                  <Form.Control type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
               </Form.Group>
            </Form>
            {/* <PurchaseInvoice printRef={printRef} data={getPrintData} invoiceNum={invoiceNum} /> */}
         </ModalWrapper>
      </>
   );
};

export default ClearSale;
