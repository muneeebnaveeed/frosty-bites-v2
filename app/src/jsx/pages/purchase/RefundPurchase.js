import produce from 'immer';
import ModalWrapper from 'jsx/components/ModalWrapper';
import Select from 'jsx/components/Select';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { get, getV2, put, useAlert, useQuery } from 'jsx/helpers';
import _, { isArray } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { When } from 'react-if';
import { useMutation, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';

const RefundPurchase = ({ refundPurchase, toggle, onClose, onOpen, ...props }) => {
   const queryClient = useQueryClient();

   const alert = useAlert();

   const [refund, setRefund] = useState([]);

   const purchase = useQuery(
      ['refund-purchase', refundPurchase],
      () => getV2(`/purchases/id/${refundPurchase}`, { page: 1, limit: 1000 }),
      {
         enabled: false,
         onSuccess: (data) => {
            const refunds = data.products.map(({ product }) => {
               const returned = {};
               returned.product = product._id;

               if (product.type.title.toLowerCase() === 'tile') returned.variants = { a: '', b: '', c: '', d: '' };
               else returned.quantity = '';

               return returned;
            });
            if (!refund.length) setRefund(refunds);
         },
      }
   );

   const mutation = useMutation((payload) => put(`/purchases/${refundPurchase}/refund`, payload), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('purchases');
         onClose();
         setRefund([]);
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to refund purchase', err });
      },
   });

   const alertMarkup = alert.getAlert();

   const handleChangeQuantity = (index, q) => {
      const updatedRefund = produce(refund, (draft) => {
         draft[index].quantity = q;
      });
      setRefund(updatedRefund);
   };

   const handleChangeVariantQuantity = (index, variant, q) => {
      const updatedRefund = produce(refund, (draft) => {
         draft[index].variants[variant] = q;
      });
      setRefund(updatedRefund);
   };

   const handleSubmit = (e) => {
      e.preventDefault();

      const referenceRefund = _.cloneDeep(refund);

      const payload = [];

      referenceRefund.forEach((r) => {
         if (r.quantity) payload.push(r);
         if (r.variants) {
            const variants = _.cloneDeep(r.variants);
            Object.entries(variants).forEach(([key, value]) => {
               if (!value) delete variants[key];
            });

            if (Object.keys(variants).length) {
               r.variants = variants;
               payload.push(r);
            }
         }
      });

      mutation.mutate(payload);
   };

   useEffect(() => {
      if (refundPurchase) {
         console.log('hitting get one purchase');
         purchase.refetch();
      }
   }, [refundPurchase]);

   return (
      <>
         <ModalWrapper
            show={refundPurchase}
            onHide={() => {
               if (!mutation.isLoading || !purchase.isLoading) {
                  onClose();
                  setRefund([]);
               }
            }}
            isLoading={mutation.isLoading || purchase.isLoading}
            isDisabled={mutation.isLoading || purchase.isLoading}
            title="Refund Purchase"
            onSubmit={handleSubmit}
            submitButtonText="Refund"
            size="xl"
            {...props}
         >
            {alertMarkup ? (
               <Row>
                  <Col lg={12}>{alertMarkup}</Col>
               </Row>
            ) : null}
            <form onSubmit={handleSubmit}>
               {purchase.data?.products.map((product, index) => {
                  const isVarianted = product.variants;
                  return (
                     <div className="form-group" key={`product-${index}`}>
                        <label className="col-form-label">Product</label>
                        <div className="tw-flex">
                           <input
                              className="form-control"
                              type="text"
                              value={product.product.modelNumber}
                              style={{ flex: isVarianted ? 1 : 2 }}
                              disabled
                           />
                           {isVarianted ? (
                              <div className="tw-flex" style={{ flex: 3 }}>
                                 <input
                                    className="form-control"
                                    type="text"
                                    placeholder="A"
                                    value={refund[index]?.variants.a}
                                    onChange={(e) => handleChangeVariantQuantity(index, 'a', e.target.value)}
                                 />
                                 <input
                                    className="form-control"
                                    type="text"
                                    placeholder="B"
                                    value={refund[index]?.variants.b}
                                    onChange={(e) => handleChangeVariantQuantity(index, 'b', e.target.value)}
                                 />
                                 <input
                                    className="form-control"
                                    type="text"
                                    placeholder="C"
                                    value={refund[index]?.variants.c}
                                    onChange={(e) => handleChangeVariantQuantity(index, 'c', e.target.value)}
                                 />
                                 <input
                                    className="form-control"
                                    type="text"
                                    placeholder="D"
                                    value={refund[index]?.variants.d}
                                    onChange={(e) => handleChangeVariantQuantity(index, 'd', e.target.value)}
                                 />
                              </div>
                           ) : (
                              <input
                                 className="form-control"
                                 style={{ flex: 1 }}
                                 type="text"
                                 name="modelNumber"
                                 placeholder="Quantity"
                                 value={refund[index]?.quantity}
                                 onChange={(e) => handleChangeQuantity(index, e.target.value)}
                              />
                           )}
                        </div>
                     </div>
                  );
               })}
            </form>
         </ModalWrapper>
      </>
   );
};

export default RefundPurchase;
