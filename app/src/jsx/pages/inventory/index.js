/* eslint-disable prefer-destructuring */
import { useDebounce } from 'ahooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import produce from 'immer';
import Button from 'jsx/components/Button';
import Pagination from 'jsx/components/Pagination';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { del, get, getV2, useAlert, useQuery } from 'jsx/helpers';
import { userRoles } from 'jsx/helpers/enums';
import getQuantity from 'jsx/helpers/getQuantity';
import PageTItle from 'jsx/layouts/PageTitle';
import _, { isArray } from 'lodash';
import React, { useEffect, useState, Fragment } from 'react';

import { ButtonGroup, Card, Col, OverlayTrigger, Popover, Row, Table } from 'react-bootstrap';
import ReactDatePicker from 'react-datepicker';
import { AiFillDelete, AiFillEdit, AiFillPlusCircle, AiOutlineQuestionCircle } from 'react-icons/ai';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { Else, If, Then, When } from 'react-if';
import { useMutation, useQueryClient } from 'react-query';
import { useDispatch, connect, batch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { setInventoriesData, setInventoriesVisibility } from 'store/actions';
import swal from 'sweetalert';

const Khaata = (props) => {
   const history = useHistory();
   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(5);
   const [sort, setSort] = useState({ field: null, order: -1 });
   const [search, setSearch] = useState('');
   const debouncedSearchValue = useDebounce(search, { wait: 500 });

   const alert = useAlert();
   const queryClient = useQueryClient();
   const dispatch = useDispatch();

   const query = useQuery(['inventories', page, limit, sort.field, sort.order, debouncedSearchValue], () =>
      getV2('/inventories', {
         page,
         limit,
         search: debouncedSearchValue,
         sort: { [sort.field]: sort.order },
      })
   );
   const alertMarkup = alert.getAlert();

   const handleSort = (key) => {
      setSort((prev) => ({ field: key, order: prev.order * -1 }));
   };

   useEffect(() => {
      if (page > query.data?.totalPages) {
         setPage((prev) => prev - 1);
      }
   }, [page, query.data?.totalPages]);

   const mutation = useMutation((id) => del(`/inventories/id/${id}`), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('inventories');
         alert.setAlert({
            message: 'Inventory deleted successfully',
            variant: 'success',
         });
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to delete user', err });
      },
   });

   const handleOnClickDelete = (id) => {
      swal({
         title: 'Are you sure?',
         text: 'Once deleted, you will not be able to recover it!',
         icon: 'warning',
         buttons: true,
         dangerMode: true,
      }).then((willDelete) => {
         if (willDelete) {
            mutation.mutate(id);
         }
      });
   };

   const handleOnClickAdd = () => {
      dispatch(setInventoriesVisibility(true));
   };

   const handleEdit = (inventory) => {
      const updatedInventory = produce(inventory, (draft) => {
         if (inventory.product.type.title.toLowerCase() === 'tile') {
            Object.entries(inventory.variants).forEach(([key, value]) => {
               if (value[0] > 0) draft.variants[key] = `${value[0]}b`;
               else draft.variants[key] = `${value[1]}t`;
            });
         } else {
            const quantity = inventory.quantity;
            if (quantity[0] > 0) draft.quantity = `${quantity[0]}b`;
            else draft.variants = `${quantity[1]}t`;
         }
      });

      batch(() => {
         dispatch(setInventoriesData(updatedInventory));
         dispatch(setInventoriesVisibility(true));
      });
   };

   return (
      <>
         <PageTItle activeMenu="Inventory" motherMenu="Diamond Tiles" />
         {alertMarkup ? (
            <Row>
               <Col lg={12}>{alertMarkup}</Col>
            </Row>
         ) : null}

         <div className="row">
            <Col lg={12}>
               <Card>
                  <When condition={query.isLoading || mutation.isLoading}>
                     <SpinnerOverlay />
                  </When>
                  <Card.Header>
                     <Card.Title>Inventory</Card.Title>
                     <ButtonGroup className="tw-float-right">
                        <input
                           type="text"
                           className="input-rounded tw-rounded-r-none tw-pl-6 tw-shadow-inner tw-ring-1 "
                           placeholder="Search Inventory by Product"
                           onChange={(e) => setSearch(e.target.value)}
                           value={search}
                        />
                        <Button size="sm" variant="primary" icon={AiFillPlusCircle} onClick={handleOnClickAdd}>
                           Add Inventory
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
                                       <strong>#</strong>
                                    </th>
                                    <th>
                                       <strong className="tw-cursor-pointer" onClick={() => handleSort('modelNumber')}>
                                          Product
                                          <span>
                                             <When condition={sort.field !== 'modelNumber'}>
                                                <FaSort className="d-inline mx-1" />
                                             </When>
                                             <When condition={sort.field === 'modelNumber' && sort.order === -1}>
                                                <FaSortDown className="d-inline mx-1" />
                                             </When>
                                             <When condition={sort.field === 'modelNumber' && sort.order === 1}>
                                                <FaSortUp className="d-inline mx-1" />
                                             </When>
                                          </span>
                                       </strong>
                                    </th>

                                    <th>
                                       <strong className="tw-cursor-pointer" onClick={() => handleSort('quantity')}>
                                          QUANTITY
                                          <span>
                                             <When condition={sort.field !== 'quantity'}>
                                                <FaSort className="d-inline mx-1" />
                                             </When>
                                             <When condition={sort.field === 'quantity' && sort.order === -1}>
                                                <FaSortDown className="d-inline mx-1" />
                                             </When>
                                             <When condition={sort.field === 'quantity' && sort.order === 1}>
                                                <FaSortUp className="d-inline mx-1" />
                                             </When>
                                          </span>
                                       </strong>
                                    </th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {query.data?.docs.map((e, index) => {
                                    const isVariant = e.variants;
                                    return (
                                       <tr key={`${e._id}`}>
                                          <td>
                                             <strong>{query.data.pagingCounter + index}</strong>
                                          </td>
                                          <td>{e.product.modelNumber ?? 'N/A'}</td>
                                          <td>
                                             {isVariant
                                                ? Object.entries(e.variants).map(([key, value]) => (
                                                     <>
                                                        <span className="tw-mr-4">{`${key.toUpperCase()}: ${getQuantity(
                                                           value
                                                        )}`}</span>
                                                     </>
                                                  ))
                                                : getQuantity(e.quantity)}
                                          </td>
                                          <td>
                                             <When condition={props.user?.role !== userRoles.CASHIER}>
                                                <ButtonGroup>
                                                   <Button
                                                      variant="light"
                                                      size="sm"
                                                      icon={AiFillEdit}
                                                      onClick={() => handleEdit(e)}
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
                                                </ButtonGroup>
                                             </When>
                                          </td>
                                       </tr>
                                    );
                                 })}
                              </tbody>
                           </Table>
                        </Then>
                        <Else>
                           <When condition={!query.isLoading && !debouncedSearchValue}>
                              <p className="tw-m-0">No inventory created</p>
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
               isLimitDisabled={query.isLoading}
            />
         </When>
      </>
   );
};

export default connect((state) => ({ user: state.auth.user }))(Khaata);
