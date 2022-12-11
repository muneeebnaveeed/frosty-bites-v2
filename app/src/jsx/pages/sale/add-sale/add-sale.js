/* eslint-disable react/no-this-in-sfc */
import Button from 'jsx/components/Button';
import ModalWrapper from 'jsx/components/ModalWrapper';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { post, useAlert, useMutation, useQuery } from 'jsx/helpers';
import PageTItle from 'jsx/layouts/PageTitle';
import React, { useRef, useState } from 'react';
import { ButtonGroup, Card } from 'react-bootstrap';
import { AiFillCaretLeft, AiFillSave } from 'react-icons/ai';
import { When } from 'react-if';
import { useHistory } from 'react-router-dom';
import { Form, Formik } from 'formik';
import { toast } from 'react-toastify';
import { handleFormError, handleToastError } from 'jsx/helpers/misc';
import { useQueryClient } from 'react-query';
import { useReactToPrint } from 'react-to-print';
import CartGrid from './cart-grid';
import SaleInfo from './sale-info';
import { createSaleSchema } from '../validations';
import Receipt from './receipt';

const AddSale = () => {
   const history = useHistory();
   const componentToPrintRef = useRef();
   const [generatedSaleId, setGeneratedSaleId] = useState(null);

   const handlePrint = useReactToPrint({
      content: () => componentToPrintRef.current,
      onAfterPrint: () => {
         toast.success('Sale has been made successfully');
         localStorage.removeItem('cartProducts');
         history.push('/sale');
      },
   });

   const queryClient = useQueryClient();

   const mutation = useMutation((payload) => post('/sales', payload));

   const handleSubmit = (values, { setErrors }) => {
      if (!values.discount) values.discount = 0;
      mutation.mutate(values, {
         onSuccess: (generatedSale) => {
            setGeneratedSaleId(generatedSale.saleId);
            handlePrint();
            return queryClient.invalidateQueries('sales');
         },
         onError: handleFormError(setErrors),
      });
   };

   const shouldShowSpinner = mutation.isLoading;

   return (
      <>
         <When condition={shouldShowSpinner}>
            <SpinnerOverlay />
         </When>
         <PageTItle activeMenu="Add New Sale" motherMenu="Frosty Bites" />
         <Formik
            validationSchema={createSaleSchema}
            initialValues={{ discount: 0, products: [], saleType: 'Dine-in' }}
            onSubmit={handleSubmit}
         >
            <Form>
               <Card>
                  <Card.Header>
                     <Card.Title>Add New Sale</Card.Title>
                  </Card.Header>
                  <Card.Body>
                     <SaleInfo />
                  </Card.Body>
                  <Card.Footer>
                     <ButtonGroup>
                        <Button
                           icon={AiFillCaretLeft}
                           variant="warning light"
                           onClick={() => history.push('/sale')}
                           loading={shouldShowSpinner}
                        >
                           Back
                        </Button>
                        <Button icon={AiFillSave} variant="primary" type="submit" loading={shouldShowSpinner}>
                           Save
                        </Button>
                     </ButtonGroup>
                  </Card.Footer>
               </Card>

               <Card>
                  <Card.Header>
                     <Card.Title>Cart</Card.Title>
                  </Card.Header>
                  <Card.Body>
                     <CartGrid generatedSaleId={generatedSaleId} ref={componentToPrintRef} />
                  </Card.Body>
               </Card>
            </Form>
         </Formik>
      </>
   );
};

export default AddSale;
