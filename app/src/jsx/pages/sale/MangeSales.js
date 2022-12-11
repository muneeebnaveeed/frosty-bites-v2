import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import produce from 'immer';
import Button from 'jsx/components/Button';
import Pagination from 'jsx/components/Pagination';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { del, get, getV2, useAlert, useMutation, useQuery } from 'jsx/helpers';
import { userRoles } from 'jsx/helpers/enums';
import getSortingIcon from 'jsx/helpers/getSortingIcon';
import PageTItle from 'jsx/layouts/PageTitle';
import _, { isArray } from 'lodash';
import React, { useEffect, useState } from 'react';
import { ButtonGroup, Card, Col, OverlayTrigger, Popover, Row, Table } from 'react-bootstrap';
import ReactDatePicker from 'react-datepicker';
import { AiFillDelete, AiFillEdit, AiFillEye, AiFillPlusCircle, AiOutlineQuestionCircle } from 'react-icons/ai';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { Else, If, Then, When } from 'react-if';
import { useQueryClient } from 'react-query';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import swal from 'sweetalert';
import ClearSale from './ClearSale';
import RefundSale from './RefundSale';

dayjs.extend(relativeTime);

const getQuantity = (array) => {
   if (array[0] > 0) return `${array[0]} Units`;
   return `${array[1]} ${array[1] > 0 ? 'Singles' : ''}`;
};

const MangeSales = ({ startDate, endDate, ...props }) => {
   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(5);
   const [sort, setSort] = useState({ field: null, order: -1 });

   const [refundPurchase, setRefundPurchase] = useState(null);

   const [clearSale, setClearSale] = useState({ id: null, amount: null });

   const queryClient = useQueryClient();

   const history = useHistory();

   const alert = useAlert();

   const query = useQuery(['sales', page, limit, sort.field, sort.order, startDate, endDate], () =>
      getV2('/sales', { page, limit, sort: { [sort.field]: sort.order }, startDate, endDate })
   );

   const deleteMutation = useMutation((id) => del(`/sales/id/${id}`), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('sales');
         alert.setAlert({
            message: 'Sale deleted successfully',
            variant: 'success',
         });
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to delete sale', err });
      },
   });

   const handleSort = (key) => {
      setSort((prev) => ({ field: key, order: prev.order * -1 }));
   };
   const handleOnClickDelete = (id) => {
      swal({
         title: 'Are you sure?',
         text: 'Once deleted, you will not be able to recover it!',
         icon: 'warning',
         buttons: true,
         dangerMode: true,
      }).then((willDelete) => {
         if (willDelete) {
            deleteMutation.mutate(id);
         }
      });
   };

   const handleEdit = (id) => {
      history.push({ pathname: `/sale/add`, state: { saleId: id } });
   };

   useEffect(() => {
      if (page > query.data?.totalPages) {
         setPage((prev) => prev - 1);
      }
   }, [page, query.data?.totalPages]);

   return (
      <>
         <Card>
            <When condition={query.isLoading || deleteMutation.isLoading}>
               <SpinnerOverlay />
            </When>
            <Card.Header>
               <Card.Title>Manage Sale</Card.Title>
            </Card.Header>
            <Card.Body>
               <If condition={query.data?.totalDocs > 0}>
                  <Then>
                     <Table className="tw-relative" responsive>
                        <thead>
                           <tr>
                              <th className="width80">
                                 <strong>#</strong>
                              </th>
                              <th>
                                 <strong>Supplier</strong>
                              </th>
                              <th>
                                 <strong>Products</strong>
                              </th>
                              <th>
                                 {getSortingIcon({
                                    label: 'Price',
                                    key: 'totalRetailPrice',
                                    onSort: handleSort,
                                    sort,
                                 })}
                              </th>
                              <th>
                                 {getSortingIcon({
                                    label: 'Paid',
                                    key: 'paid',
                                    onSort: handleSort,
                                    sort,
                                 })}
                              </th>
                           </tr>
                        </thead>
                        <tbody>
                           {query.data?.docs.map((e, index) => {
                              const getId = () => {
                                 const id = e._id;
                                 return id.slice(id.length - 4);
                              };

                              const getProducts = () => {
                                 const products = [];

                                 e.products.forEach((d, i) => {
                                    products.push(
                                       <>
                                          <b>{`${d.product.modelNumber}`}</b>
                                          <br />
                                          <span className="tw-mr-4">{`BUY: ${d.sourcePrice} PKR`}</span>
                                          <span>{`SELL: ${d.retailPrice} PKR`}</span>

                                          {d.variants ? (
                                             <>
                                                <br />
                                                {Object.entries(d.variants).map(([key, value]) => (
                                                   <span className="tw-mr-4">{`${key.toUpperCase()}: ${getQuantity(
                                                      value
                                                   )}`}</span>
                                                ))}
                                             </>
                                          ) : (
                                             <>
                                                <br />
                                                {getQuantity(d.quantity)}
                                             </>
                                          )}
                                       </>
                                    );
                                    if (i < e.products.length - 1) products.push(<br />);
                                 });

                                 return products;
                              };

                              // getProducts();

                              return (
                                 <tr key={`${e._id}`} className={e.isRemaining && 'tw-bg-red-400 tw-text-gray-50'}>
                                    <td>
                                       <strong className={e.isRemaining && 'tw-text-gray-50'}>{getId()}</strong>
                                    </td>
                                    <td>{e.customer?.name}</td>
                                    <td>{getProducts()}</td>
                                    <td>{`${new Intl.NumberFormat('en-IN', {
                                       maximumSignificantDigits: 3,
                                    }).format(e.totalRetailPrice)} PKR`}</td>
                                    <td>{`${new Intl.NumberFormat('en-IN', {
                                       maximumSignificantDigits: 3,
                                    }).format(e.paid)} PKR`}</td>

                                    <td>
                                       <div className="tw-flex tw-items-center tw-gap-4">
                                          <OverlayTrigger
                                             trigger={['hover', 'hover']}
                                             placement="top"
                                             overlay={
                                                <Popover className="tw-border-gray-500">
                                                   <Popover.Content>
                                                      {dayjs(e.createdAt).format('dddd[,] DD MMMM YYYY')}
                                                   </Popover.Content>
                                                </Popover>
                                             }
                                          >
                                             <AiOutlineQuestionCircle className="tw-cursor-pointer" />
                                          </OverlayTrigger>
                                          <ButtonGroup>
                                             <When condition={props.user?.role !== userRoles.CASHIER}>
                                                <Button
                                                   variant="light"
                                                   size="sm"
                                                   icon={AiFillEdit}
                                                   onClick={() => handleEdit(e._id)}
                                                >
                                                   Edit
                                                </Button>
                                                <Button
                                                   variant="danger"
                                                   size="sm"
                                                   icon={AiFillDelete}
                                                   onClick={() => handleOnClickDelete(e._id)}
                                                >
                                                   Delete
                                                </Button>
                                             </When>
                                          </ButtonGroup>
                                       </div>
                                    </td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </Table>
                  </Then>
                  <Else>
                     <When condition={!query.isLoading}>
                        <p className="tw-m-0">No sales created</p>
                     </When>
                  </Else>
               </If>
            </Card.Body>
         </Card>
         <When condition={limit > 5 ? true : query.data?.totalPages > 1}>
            <Pagination
               page={page}
               onPageChange={setPage}
               onLimitChange={setLimit}
               {..._.omit(query.data, ['docs'])}
               isLimitDisabled={query.isLoading || deleteMutation.isLoading}
            />
         </When>
         <RefundSale refundPurchase={refundPurchase} onClose={() => setRefundPurchase(null)} size="md" />
         <ClearSale
            clearSale={clearSale.id}
            initialAmount={clearSale.amount}
            onClose={() => setClearSale((prev) => ({ ...prev, id: null }))}
            size="md"
         />
      </>
   );
};

export default MangeSales;
