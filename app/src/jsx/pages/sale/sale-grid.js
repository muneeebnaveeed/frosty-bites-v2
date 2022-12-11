import { useDebounce } from 'ahooks';
import Button from 'jsx/components/Button';
import Pagination from 'jsx/components/Pagination';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { api, del, useMutation, useQuery } from 'jsx/helpers';
import PageTItle from 'jsx/layouts/PageTitle';
import _ from 'lodash';
import React, { useCallback, useState } from 'react';
import { Badge, ButtonGroup, Card, Col, Table } from 'react-bootstrap';
import { AiFillPlusCircle } from 'react-icons/ai';
import { Else, If, Then, When } from 'react-if';
import { useQueryClient } from 'react-query';
import swal from 'sweetalert';
import { batch, connect, useDispatch } from 'react-redux';
import { userRoles } from 'jsx/helpers/enums';
import { setProductsData, setProductsVisibility } from 'store/actions';
import TableSearch from 'jsx/components/TableSearch';
import GenericTableHeadingSorter from 'jsx/components/GenericTableHeadingSorter';
import DeleteButton from 'jsx/components/DeleteButton';
import EditButton from 'jsx/components/EditButton';
import { toast } from 'react-toastify';
import { currencyFormatter, handleToastError, initialSort } from 'jsx/helpers/misc';
import { useHistory } from 'react-router-dom';
import { DELETE_ENTITY } from '../../../queries';
import { GET_SALE } from './queries';

const SaleGrid = ({ startDate, endDate, ...props }) => {
   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(5);
   const [sort, setSort] = useState(initialSort);

   const [search, setSearch] = useState('');

   const dispatch = useDispatch();
   const history = useHistory();
   const debouncedSearchValue = useDebounce(search, { wait: 500 });

   const queryClient = useQueryClient();

   const query = useQuery(['sale', { page, sort, limit, search: debouncedSearchValue, startDate, endDate }], GET_SALE, {
      onSuccess: (data) => {
         if (page > data.totalPages) setPage((prev) => prev - 1);
      },
   });

   const deleteMutation = useMutation(DELETE_ENTITY('Sale'));

   const handleDelete = (id) => {
      swal({
         title: 'Are you sure?',
         text: 'Once deleted, you will not be able to recover it!',
         icon: 'warning',
         buttons: true,
         dangerMode: true,
      }).then((willDelete) => {
         if (willDelete)
            deleteMutation.mutate(id, {
               onSuccess: async () => {
                  toast.success('Sale deleted successfully');
                  return queryClient.invalidateQueries('sale');
               },
               onError: handleToastError,
            });
      });
   };

   const handleOnClickAdd = () => history.push('/sale/add');

   // eslint-disable-next-line react/destructuring-assignment
   const isCashier = props.user?.role === userRoles.CASHIER;

   const shouldShowSpinner = query.isLoading || deleteMutation.isLoading;

   return (
      <>
         <PageTItle activeMenu="Products" motherMenu="Manage" />

         <div className="row">
            <Col lg={12}>
               <Card>
                  <When condition={shouldShowSpinner}>
                     <SpinnerOverlay />
                  </When>
                  <Card.Header>
                     <Card.Title>Manage Sale</Card.Title>
                     <ButtonGroup className="tw-float-right">
                        <TableSearch
                           placeholder="Search by Sale ID"
                           disabled={shouldShowSpinner}
                           changeHandler={setSearch}
                        />
                        <Button size="sm" variant="primary" icon={AiFillPlusCircle} onClick={handleOnClickAdd}>
                           Add New Sale
                        </Button>
                     </ButtonGroup>
                  </Card.Header>
                  <Card.Body>
                     <If condition={query.data?.totalDocs > 0}>
                        <Then>
                           <Table className="tw-relative" responsive>
                              <thead>
                                 <tr>
                                    <th className="width80">
                                       <strong>ID</strong>
                                    </th>
                                    <th>
                                       <strong>Products</strong>
                                    </th>
                                    <th>
                                       <strong>Subtotal</strong>
                                    </th>
                                    <th>
                                       <strong>Discount</strong>
                                    </th>
                                    <th>
                                       <strong>Total</strong>
                                    </th>
                                    <When condition={!isCashier}>
                                       <th>
                                          <strong>Actions</strong>
                                       </th>
                                    </When>
                                 </tr>
                              </thead>
                              <tbody>
                                 {query.data?.docs.map((e) => (
                                    <tr key={`${e._id}`}>
                                       <td>
                                          <strong>{e.saleId}</strong>
                                       </td>
                                       <td>
                                          {e.products.map((_cartRow, i, _array) => {
                                             const isLastIteration = i >= _array.length - 1;
                                             return (
                                                <>
                                                   <div key={`${e._id}-product-${i}`}>
                                                      <span>{`${_cartRow.product.name}`}</span>
                                                      <br />
                                                      <span>{`${_cartRow.quantity}x ${currencyFormatter.format(
                                                         _cartRow.product.price
                                                      )} = `}</span>
                                                      <strong>{currencyFormatter.format(_cartRow.subtotal)}</strong>
                                                   </div>
                                                   {!isLastIteration && <br />}
                                                </>
                                             );
                                          })}
                                          {e.saleType === 'Delivery' && e.deliveryCharges > 0 && (
                                             <div className="text-primary">
                                                <br />
                                                <span>
                                                   Delivery charges ={' '}
                                                   <b>{currencyFormatter.format(e.deliveryCharges)}</b>
                                                </span>
                                             </div>
                                          )}
                                       </td>
                                       <td>
                                          {(e.saleType === 'Delivery' || e.discount > 0) &&
                                             currencyFormatter.format(e.subtotal)}
                                       </td>
                                       <td>{e.discount > 0 && `${e.discount}%`}</td>
                                       <td>{e.total > 0 && currencyFormatter.format(e.total)}</td>
                                       <When condition={!isCashier}>
                                          <td>
                                             <DeleteButton onClick={() => handleDelete(e._id)} />
                                          </td>
                                       </When>
                                    </tr>
                                 ))}
                              </tbody>
                           </Table>
                        </Then>
                        <Else>
                           <When condition={!query.isLoading && !debouncedSearchValue}>
                              <p className="tw-m-0">No products created</p>
                           </When>
                           <When condition={!query.isLoading && debouncedSearchValue}>
                              <p className="tw-m-0">No result found!</p>
                           </When>
                        </Else>
                     </If>
                  </Card.Body>
               </Card>
            </Col>
         </div>
         <When condition={limit > 5 ? true : query.data?.totalPages > 1}>
            <Pagination
               page={page}
               onPageChange={setPage}
               onLimitChange={setLimit}
               {..._.omit(query.data, ['docs'])}
               isLimitDisabled={shouldShowSpinner}
            />
         </When>
      </>
   );
};

const mapStateToProps = ({ auth }) => ({
   user: auth.user,
});

export default connect(mapStateToProps, {})(SaleGrid);
