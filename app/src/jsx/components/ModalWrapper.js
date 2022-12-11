import { Form, useFormikContext } from 'formik';
import React, { useEffect } from 'react';

import { Button, Modal, Container, Spinner, ButtonGroup } from 'react-bootstrap';
import { When } from 'react-if';

const ModalWrapper = ({
   show,
   onHide,
   isLoading,
   title,
   submitButtonText = 'Save',
   children,
   isDisabled,
   onShow,
   ...rest
}) => {
   useEffect(() => {
      if (show) onShow?.();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [show]);

   return (
      <Modal
         className="fade"
         show={show}
         onHide={() => {
            if (!isLoading) onHide();
         }}
         size="md"
         {...rest}
      >
         <Form>
            <Modal.Header>
               <Modal.Title>{title}</Modal.Title>
               <Button variant="" className="close" onClick={onHide}>
                  <span>&times;</span>
               </Button>
            </Modal.Header>
            <Modal.Body>
               <Container>{children}</Container>
            </Modal.Body>
            <Modal.Footer>
               <ButtonGroup>
                  <Button variant="warning light" disabled={isLoading} onClick={onHide}>
                     Close
                  </Button>
                  <Button
                     variant="primary"
                     type="submit"
                     // onClick={formikProps?.handleSubmit}
                     disabled={isLoading || isDisabled}
                  >
                     <When condition={isLoading}>
                        <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
                     </When>
                     <span className="ml-1">{submitButtonText}</span>
                  </Button>
               </ButtonGroup>
            </Modal.Footer>
         </Form>
      </Modal>
   );
};

export default ModalWrapper;
