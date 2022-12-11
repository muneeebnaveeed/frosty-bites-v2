import useUrlState from '@ahooksjs/use-url-state';
import { useFormik } from 'formik';
import Button from 'jsx/components/Button';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { get, patch, post, useAlert, useMutation, useQuery } from 'jsx/helpers';
import PageTItle from 'jsx/layouts/PageTitle';
import React, { useEffect, useMemo, useState } from 'react';
import { ButtonGroup, Card, OverlayTrigger, Popover, Table } from 'react-bootstrap';
import { AiFillCaretLeft, AiFillSave, AiOutlineQuestionCircle } from 'react-icons/ai';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { Else, If, Then, When } from 'react-if';
import { useHistory, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useDebounce } from 'ahooks';
import Pagination from 'jsx/components/Pagination';
import _ from 'lodash';
import { connect } from 'react-redux';
import { userRoles } from 'jsx/helpers/enums';

const CustomerActions = (props) => {
   dayjs.extend(relativeTime);

   const history = useHistory();
   const params = useParams();
   const [customer, setCustomer] = useState(null);
   const [isError, setIsError] = useState(false);

   const [urlState, setUrlState] = useUrlState({});
   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(5);
   const [sort, setSort] = useState({ field: null, order: 1 });
   const [search, setSearch] = useState('');
   const debouncedSearchValue = useDebounce(search, { wait: 500 });

   const alert = useAlert();
   const isEditing = useMemo(
      () => props.user?.role !== userRoles.CASHIER && urlState?.type === 'edit',
      [urlState.type]
   );
   const isViewCustomer = useMemo(() => urlState?.type === 'view', [urlState.type]);
   const isAddCustomer = useMemo(() => params?.id === 'add', [params.id]);

   const query = useQuery(
      ['customer', params.id, page, limit, sort.field, sort.order, debouncedSearchValue],
      () => get(`/customers/id/${params.id}`, page, limit, sort.field, sort.order, debouncedSearchValue),
      {
         enabled: !isAddCustomer,
         onError: (err) => {
            setIsError(true);
            alert.setErrorAlert({
               message: 'Invalid URL!',
               err: { message: ['The page will redirect to manage customers.'] },
               callback: () => history.push('/customers'),
               duration: 3000,
            });
         },
      }
   );
   const patchMutation = useMutation((payload) => patch(`/customers/id/${params.id}`, payload), {
      onSuccess: () => {
         history.push('/customers');
      },
      onError: (err) => {
         alert.setErrorAlert({
            message: 'Unable to edit customer.',
            err,
         });
      },
   });

   const postMutation = useMutation((payload) => post('/customers', payload), {
      onSuccess: () => {
         history.push('/customers');
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to add customer', err });
      },
   });

   const mutation = useMemo(() => (isEditing ? patchMutation : postMutation), [isEditing, patchMutation, postMutation]);

   if (!isEditing && !isViewCustomer && !isAddCustomer) {
      history.push('/customers');
   }

   const formik = useFormik({
      initialValues: { name: isEditing ? customer?.name : '', phone: isEditing ? customer?.phone : '' },
      validateOnChange: false,
      validateOnBlur: false,
      onSubmit: (values) => {
         mutation.mutate(values);
      },
   });
   const handleSort = (key) => {
      setSort((prev) => ({ field: key, order: prev.order * -1 }));
   };
   useEffect(() => {
      if (isEditing && query.data) {
         formik.setFieldValue('name', query.data?.customer?.name ?? '');
         formik.setFieldValue('phone', query.data?.customer?.phone ?? '');
      }
   }, [isEditing, query.data]);

   useEffect(() => {
      if (page > query.data?.sales?.totalPages) {
         setPage((prev) => prev - 1);
      }
   }, [page, query.data?.sales?.totalPages]);

   return (
      <>
         <PageTItle activeMenu="Customers" motherMenu="Manage" />
         {alert.getAlert()}
         <Card>
            <When condition={patchMutation.isLoading || postMutation.isLoading || query.isLoading}>
               <SpinnerOverlay />
            </When>
            <If condition={isAddCustomer || isEditing}>
               <Then>
                  <form onSubmit={formik.handleSubmit}>
                     <Card.Header>
                        <Card.Title>{isEditing ? 'Edit Customer' : 'Add New Customer'}</Card.Title>
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
                     </Card.Body>
                     <Card.Footer>
                        <div className="row">
                           <div className="col-xl-12 tw-justify-center">
                              <ButtonGroup>
                                 <Button
                                    icon={AiFillCaretLeft}
                                    variant="warning light"
                                    onClick={() => history.replace('/customers')}
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
                     <Card.Title>View Customer</Card.Title>
                  </Card.Header>
                  <Card.Body>
                     <div className="row">
                        <div className="form-group col-xl-6">
                           <label className="col-form-label">Name</label>
                           <h4>{query.data?.customer?.name ?? 'N/A'}</h4>
                        </div>
                     </div>
                     <div className="row">
                        <div className="form-group col-xl-6">
                           <label className="col-form-label">Phone</label>
                           <h4>{query.data?.customer?.phone ?? 'N/A'}</h4>
                        </div>
                     </div>
                  </Card.Body>
                  <Card.Footer>
                     <div className="row">
                        <div className="col-xl-12 tw-justify-center">
                           <Button
                              icon={AiFillCaretLeft}
                              variant="warning light"
                              onClick={() => history.replace('/customers')}
                              loading={mutation.isLoading}
                           >
                              Back
                           </Button>
                        </div>
                     </div>
                  </Card.Footer>
               </Else>
            </If>
         </Card>
         <When condition={isViewCustomer}>
            <Card>
               <When condition={query.isLoading}>
                  <SpinnerOverlay />
               </When>
               <Card.Header>
                  <Card.Title>View Related Sales</Card.Title>
               </Card.Header>
               <Card.Body>
                  <If condition={query.data?.sales?.totalDocs > 0}>
                     <Then>
                        <Table className="tw-relative" responsive>
                           <thead>
                              <tr>
                                 <th className="width80">
                                    <strong>#</strong>
                                 </th>
                                 <th>
                                    <strong className="tw-cursor-pointer" onClick={() => handleSort('customer')}>
                                       Customer
                                       <span>
                                          <When condition={sort.field !== 'customer'}>
                                             <FaSort className="d-inline mx-1" />
                                          </When>
                                          <When condition={sort.field === 'customer' && sort.order === -1}>
                                             <FaSortDown className="d-inline mx-1" />
                                          </When>
                                          <When condition={sort.field === 'customer' && sort.order === 1}>
                                             <FaSortUp className="d-inline mx-1" />
                                          </When>
                                       </span>
                                    </strong>
                                 </th>
                                 <th>
                                    <strong className="tw-cursor-pointer" onClick={() => handleSort('inventory')}>
                                       Model Number
                                       <span>
                                          <When condition={sort.field !== 'inventory'}>
                                             <FaSort className="d-inline mx-1" />
                                          </When>
                                          <When condition={sort.field === 'inventory' && sort.order === -1}>
                                             <FaSortDown className="d-inline mx-1" />
                                          </When>
                                          <When condition={sort.field === 'inventory' && sort.order === 1}>
                                             <FaSortUp className="d-inline mx-1" />
                                          </When>
                                       </span>
                                    </strong>
                                 </th>
                                 <th>
                                    <strong className="tw-cursor-pointer" onClick={() => handleSort('quantity')}>
                                       Qty
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
                                 <th>
                                    <strong className="tw-cursor-pointer" onClick={() => handleSort('retailPrice')}>
                                       Total
                                       <span>
                                          <When condition={sort.field !== 'retailPrice'}>
                                             <FaSort className="d-inline mx-1" />
                                          </When>
                                          <When condition={sort.field === 'retailPrice' && sort.order === -1}>
                                             <FaSortDown className="d-inline mx-1" />
                                          </When>
                                          <When condition={sort.field === 'retailPrice' && sort.order === 1}>
                                             <FaSortUp className="d-inline mx-1" />
                                          </When>
                                       </span>
                                    </strong>
                                 </th>
                                 <th>
                                    <strong className="tw-cursor-pointer" onClick={() => handleSort('paid')}>
                                       Paid
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
                                    <strong>Remaining</strong>
                                 </th>
                              </tr>
                           </thead>
                           <tbody>
                              {query.data?.sales &&
                                 query.data?.sales?.docs.map((e, index) => {
                                    const getRemainig = () => {
                                       if (!e?.sourcePrice || !e?.paid) return null;
                                       if (e.sourcePrice === e.paid) return null;
                                       return e.sourcePrice - e.paid;
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
                                             <strong>{getId()}</strong>
                                          </td>
                                          <td>{e?.customer?.name ?? 'N/A'}</td>
                                          <td>{e?.inventory?.modelNumber ?? 'N/A'}</td>
                                          <td>{e?.quantity ?? 'N/a'}</td>
                                          <td>{e?.retailPrice ?? 'N/A'}</td>
                                          <td>{e?.paid ?? 'N/A'}</td>
                                          <td>{getRemainig()}</td>

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
                           <p className="tw-m-0">No Sales created</p>
                        </When>
                     </Else>
                  </If>
               </Card.Body>
            </Card>
         </When>
         <When condition={limit > 5 ? true : query.data?.sales?.totalPages > 1}>
            <Pagination
               page={page}
               onPageChange={setPage}
               onLimitChange={setLimit}
               {..._.omit(query.data?.sales, ['docs'])}
               isLimitDisabled={query.isLoading}
            />
         </When>
      </>
   );
};

const mapStateToProps = ({ auth }) => ({
   user: auth.user,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(CustomerActions);
