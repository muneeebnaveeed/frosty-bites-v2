import useUrlState from '@ahooksjs/use-url-state';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useFormik } from 'formik';
import Button from 'jsx/components/Button';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { get, patch, post, useAlert, useMutation, useQuery } from 'jsx/helpers';
import PageTItle from 'jsx/layouts/PageTitle';
import React, { useEffect, useMemo, useState } from 'react';
import { ButtonGroup, Card, OverlayTrigger, Pagination, Popover, Table } from 'react-bootstrap';
import { AiFillCaretLeft, AiFillSave, AiOutlineQuestionCircle } from 'react-icons/ai';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { Else, If, Then, When } from 'react-if';
import { useHistory, useParams } from 'react-router-dom';

import _, { isArray } from 'lodash';
import { connect } from 'react-redux';
import { userRoles } from 'jsx/helpers/enums';

const SupplierActions = (props) => {
   const history = useHistory();
   const params = useParams();
   const [isError, setIsError] = useState(false);

   const [urlState, setUrlState] = useUrlState({});

   const alert = useAlert();
   const isEditing = useMemo(
      () => props.user?.role !== userRoles.CASHIER && urlState?.type === 'edit',
      [urlState.type]
   );
   const isViewSupplier = useMemo(() => urlState?.type === 'view', [urlState.type]);
   const isAddSupplier = useMemo(() => params?.id === 'add', [params.id]);

   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(5);
   const [sort, setSort] = useState({ field: 'sourcePrice', order: 1 });

   const query = useQuery(['supplier', params.id], () => get(`/suppliers/id/${params.id}`), {
      enabled: !isAddSupplier,
      onError: (err) => {
         setIsError(true);
         alert.setErrorAlert({
            message: 'Unable to view supplier',
            err,
            callback: () => history.push('/suppliers'),
            duration: 3000,
         });
      },
   });
   const patchMutation = useMutation((payload) => patch(`/suppliers/id/${params.id}`, payload), {
      onSuccess: () => {
         history.push('/suppliers');
      },
      onError: (err) => {
         alert.setErrorAlert({
            message: 'Unable to edit supplier.',
            err,
         });
      },
   });

   const postMutation = useMutation((payload) => post('/suppliers', payload), {
      onSuccess: () => {
         history.push('/suppliers');
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to add supplier', err });
      },
   });

   const mutation = useMemo(() => (isEditing ? patchMutation : postMutation), [isEditing, patchMutation, postMutation]);

   if (!isEditing && !isViewSupplier && !isAddSupplier) {
      history.push('/suppliers');
   }

   const formik = useFormik({
      initialValues: {
         name: '',
         phone: '',
         company: '',
      },
      validateOnChange: false,
      validateOnBlur: false,
      onSubmit: (values) => {
         mutation.mutate(values);
      },
   });

   useEffect(() => {
      if (isEditing && query.data) {
         formik.setFieldValue('name', query.data?.supplier?.name ?? '');
         formik.setFieldValue('phone', query.data?.supplier?.phone ?? '');
         formik.setFieldValue('company', query.data?.supplier?.company ?? '');
      }
   }, [isEditing, query.data]);

   const handleSort = (key) => {
      setSort((prev) => ({ field: key, order: prev.order * -1 }));
   };

   return (
      <>
         <PageTItle activeMenu="Suppliers" motherMenu="Manage" />
         {alert.getAlert()}
         <Card>
            <When condition={patchMutation.isLoading || postMutation.isLoading || query.isLoading}>
               <SpinnerOverlay />
            </When>
            <If condition={isAddSupplier || isEditing}>
               <Then>
                  <form onSubmit={formik.handleSubmit}>
                     <Card.Header>
                        <Card.Title>{isEditing ? 'Edit Supplier' : 'Add New Supplier'}</Card.Title>
                     </Card.Header>
                     <Card.Body>
                        <div className="row">
                           <div className="form-group col-xl-6">
                              <label className="col-form-label">Name</label>
                              <input
                                 className="form-control"
                                 onChange={formik.handleChange}
                                 type="text"
                                 name="name"
                                 disabled={isError}
                                 value={formik.values.name}
                              />
                           </div>
                        </div>
                        <div className="row">
                           <div className="form-group col-xl-6">
                              <label className="col-form-label">Phone</label>
                              <input
                                 className="form-control"
                                 onChange={formik.handleChange}
                                 type="text"
                                 name="phone"
                                 disabled={isError}
                                 value={formik.values.phone}
                              />
                           </div>
                        </div>
                        <div className="row">
                           <div className="form-group col-xl-6">
                              <label className="col-form-label">Company</label>
                              <input
                                 className="form-control"
                                 onChange={formik.handleChange}
                                 type="text"
                                 name="company"
                                 disabled={isError}
                                 value={formik.values.company}
                              />
                           </div>
                        </div>
                     </Card.Body>
                     <Card.Footer>
                        <div className="row">
                           <div className="col-xl-12 tw-justify-center">
                              <ButtonGroup>
                                 <Button
                                    icon={AiFillCaretLeft}
                                    variant="warning light"
                                    onClick={() => history.replace('/suppliers')}
                                    loading={mutation.isLoading}
                                 >
                                    Back
                                 </Button>
                                 <Button
                                    icon={AiFillSave}
                                    variant="primary"
                                    type="submit"
                                    loading={mutation.isLoading}
                                    disabled={isError}
                                 >
                                    Save
                                 </Button>
                              </ButtonGroup>
                           </div>
                        </div>
                     </Card.Footer>
                  </form>
               </Then>
               <Else>
                  <Card.Header>
                     <Card.Title>View Supplier</Card.Title>
                  </Card.Header>
                  <Card.Body>
                     <div className="row">
                        <div className="form-group col-xl-6">
                           <label className="col-form-label">Name</label>
                           <h4>{query.data?.supplier?.name ?? 'N/A'}</h4>
                        </div>
                     </div>
                     <div className="row">
                        <div className="form-group col-xl-6">
                           <label className="col-form-label">Phone</label>
                           <h4>{query.data?.supplier?.phone ?? 'N/A'}</h4>
                        </div>
                     </div>
                     <div className="row">
                        <div className="form-group col-xl-6">
                           <label className="col-form-label">Company</label>
                           <h4>{query.data?.supplier?.company ?? 'N/A'}</h4>
                        </div>
                     </div>
                  </Card.Body>
                  <Card>
                     <When condition={query.isLoading}>
                        <SpinnerOverlay />
                     </When>
                     <Card.Header>
                        <Card.Title>View Related Purchases</Card.Title>
                     </Card.Header>
                     <Card.Body>
                        <If condition={query.data?.inventories?.totalDocs > 0}>
                           <Then>
                              <Table className="tw-relative" responsive>
                                 <thead>
                                    <tr>
                                       <th className="width80">
                                          <strong>#</strong>
                                       </th>
                                       <th>
                                          <strong className="tw-cursor-pointer" onClick={() => handleSort('supplier')}>
                                             SUPPLIER
                                             <span>
                                                <When condition={sort.field !== 'supplier'}>
                                                   <FaSort className="d-inline mx-1" />
                                                </When>
                                                <When condition={sort.field === 'supplier' && sort.order === -1}>
                                                   <FaSortDown className="d-inline mx-1" />
                                                </When>
                                                <When condition={sort.field === 'supplier' && sort.order === 1}>
                                                   <FaSortUp className="d-inline mx-1" />
                                                </When>
                                             </span>
                                          </strong>
                                       </th>
                                       <th>
                                          <strong
                                             className="tw-cursor-pointer"
                                             onClick={() => handleSort('modelNumber')}
                                          >
                                             MODEL NUMBER
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
                                          <strong
                                             className="tw-cursor-pointer"
                                             onClick={() => handleSort('sourcePrice')}
                                          >
                                             PRICE
                                             <span>
                                                <When condition={sort.field !== 'sourcePrice'}>
                                                   <FaSort className="d-inline mx-1" />
                                                </When>
                                                <When condition={sort.field === 'sourcePrice' && sort.order === -1}>
                                                   <FaSortDown className="d-inline mx-1" />
                                                </When>
                                                <When condition={sort.field === 'sourcePrice' && sort.order === 1}>
                                                   <FaSortUp className="d-inline mx-1" />
                                                </When>
                                             </span>
                                          </strong>
                                       </th>
                                       <th>
                                          <strong className="tw-cursor-pointer" onClick={() => handleSort('paid')}>
                                             PAID
                                             <span>
                                                <When condition={sort.field !== 'paid'}>
                                                   <FaSort className="d-inline mx-1" />
                                                </When>
                                                <When condition={sort.field === 'paid' && sort.order === -1}>
                                                   <FaSortDown className="d-inline mx-1" />
                                                </When>
                                                <When condition={sort.field === 'paid' && sort.order === 1}>
                                                   <FaSortUp className="d-inline mx-1" />
                                                </When>
                                             </span>
                                          </strong>
                                       </th>
                                       <th>
                                          <strong>REMAINING</strong>
                                       </th>
                                       <th>
                                          <strong>QUANTITY</strong>
                                       </th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    {query.data?.inventories?.docs?.map((e, index) => {
                                       const getQuantity = () => {
                                          let q = e.quantity.single;
                                          // eslint-disable-next-line prefer-destructuring
                                          if (isArray(q)) q = q[0];
                                          return q;
                                       };

                                       const quantity = getQuantity();

                                       const getSourcePrice = () => {
                                          const q = getQuantity();
                                          return e.sourcePrice * q;
                                       };

                                       const sourcePrice = getSourcePrice();

                                       const getRemainig = () => {
                                          if (sourcePrice === e.paid) return null;

                                          return sourcePrice - e.paid;
                                       };

                                       const getId = () => {
                                          const id = e._id;
                                          return id.slice(id.length - 3);
                                       };

                                       return (
                                          <tr
                                             key={`${e._id}`}
                                             className={e.isRemaining && 'tw-bg-red-400 tw-text-gray-50'}
                                          >
                                             <td>
                                                <strong className={e.isRemaining && 'tw-text-gray-50'}>
                                                   {getId()}
                                                </strong>
                                             </td>
                                             <td>{e?.supplier?.name ?? 'N/A'}</td>
                                             <td>{e?.product?.modelNumber ?? 'N/A'}</td>
                                             <td>{sourcePrice}</td>
                                             <td>{e?.paid ?? 'N/A'}</td>
                                             <td>{getRemainig()}</td>
                                             <td>{quantity ? `${quantity} singles` : ''}</td>

                                             <td>
                                                <OverlayTrigger
                                                   trigger={['hover', 'hover']}
                                                   placement="top"
                                                   overlay={
                                                      <Popover className="tw-border-gray-500">
                                                         <Popover.Content>{`Created by ${e.createdBy ?? 'N/A'} ${
                                                            dayjs(e.createdAt).diff(dayjs(), 'day', true) > 7
                                                               ? `at ${dayjs(e.createdAt).format('DD-MMM-YYYY')}`
                                                               : dayjs(e.createdAt).fromNow()
                                                         }.`}</Popover.Content>
                                                      </Popover>
                                                   }
                                                >
                                                   <AiOutlineQuestionCircle className="tw-cursor-pointer" />
                                                </OverlayTrigger>
                                             </td>
                                          </tr>
                                       );
                                    })}
                                 </tbody>
                              </Table>
                           </Then>
                           <Else>
                              <When condition={!query.isLoading}>
                                 <p className="tw-m-0">No Purchases created</p>
                              </When>
                           </Else>
                        </If>
                     </Card.Body>
                  </Card>
                  <When condition={setLimit > 5 ? true : query.data?.inventories?.totalPages > 1}>
                     <Pagination
                        page={page}
                        onPageChange={setPage}
                        onLimitChange={setLimit}
                        {..._.omit(query.data, ['docs'])}
                        isLimitDisabled={query.isLoading}
                     />
                  </When>
               </Else>
            </If>
         </Card>
      </>
   );
};

const mapStateToProps = ({ auth }) => ({
   user: auth.user,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(SupplierActions);
