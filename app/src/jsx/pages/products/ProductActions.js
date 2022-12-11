import useUrlState from '@ahooksjs/use-url-state';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useFormik } from 'formik';
import Button from 'jsx/components/Button';
import Pagination from 'jsx/components/Pagination';
import Select from 'jsx/components/Select';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { get, patch, post, useAlert, useMutation, useQuery } from 'jsx/helpers';
import { userRoles } from 'jsx/helpers/enums';
import PageTItle from 'jsx/layouts/PageTitle';
import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { ButtonGroup, Card, OverlayTrigger, Popover, Table } from 'react-bootstrap';
import { AiFillCaretLeft, AiFillEye, AiFillSave, AiOutlineQuestionCircle } from 'react-icons/ai';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { Else, If, Then, When } from 'react-if';
import { useQueryClient } from 'react-query';
import { connect } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import CreatableSelect from '../../components/CreatableSelect';

const ProductActions = (props) => {
   dayjs.extend(relativeTime);

   const history = useHistory();
   const params = useParams();
   const [isError, setIsError] = useState(false);
   const [salePage, setSalePage] = useState(1);
   const [saleLimit, setSaleLimit] = useState(5);
   const [saleSort, setSaleSort] = useState({ field: 'sourcePrice', order: 1 });
   const [inventoriesPage, setInventoriesPage] = useState(1);
   const [inventoriesLimit, setInventoriesLimit] = useState(5);
   const [inventoriesSort, setInventoriesSort] = useState({ field: 'sourcePrice', order: 1 });

   const [urlState, setUrlState] = useUrlState({});

   const alert = useAlert();
   const getTypes = useQuery('types', () => get('/types'));
   const queryClient = useQueryClient();

   const isEditing = useMemo(
      () => props.user?.role !== userRoles.CASHIER && urlState?.type === 'edit',
      [urlState.type]
   );
   const isViewProduct = useMemo(() => urlState?.type === 'view', [urlState.type]);
   const isAddProduct = useMemo(() => params?.id === 'add', [params.id]);

   const query = useQuery(
      [
         'product',
         params.id,
         salePage,
         saleLimit,
         saleSort.field,
         saleSort.order,
         inventoriesPage,
         inventoriesLimit,
         inventoriesSort.field,
         inventoriesSort.order,
      ],
      () =>
         get(
            `/products/id/${params.id}?salePage=${salePage}&saleLimit=${saleLimit}&saleSort[${saleSort.field}]=${saleSort.order}&inventoriesPage=${inventoriesPage}&inventoriesLimit=${inventoriesLimit}&inventoriesSort[${inventoriesSort.field}]=${inventoriesSort.order}`
         ),
      {
         enabled: !isAddProduct,
         onError: (err) => {
            setIsError(true);
            alert.setErrorAlert({
               message: 'Unable to view product',
               err,
               duration: 3000,
            });
         },
      }
   );

   const patchMutation = useMutation((payload) => patch(`/products/id/${params.id}`, payload), {
      onSuccess: () => {
         history.push('/products');
      },
      onError: (err) => {
         alert.setErrorAlert({
            message: 'Unable to edit product.',
            err,
         });
      },
   });

   const postMutation = useMutation((payload) => post('/products', payload), {
      onSuccess: () => {
         history.push('/products');
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to add product', err });
      },
   });
   const postTypeMutation = useMutation((payload) => post('/types', payload), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('types');
      },
   });

   const mutation = useMemo(() => (isEditing ? patchMutation : postMutation), [isEditing, patchMutation, postMutation]);

   if (!isEditing && !isViewProduct && !isAddProduct) {
      history.push('/products');
   }

   const formik = useFormik({
      initialValues: {
         modelNumber: '',
         retailPrice: '',
         type: '',
         unit: '',
      },
      validateOnChange: false,
      validateOnBlur: false,
      onSubmit: (values) => {
         console.log(values);
         values.unit = values.unit.label;
         mutation.mutate(values);
      },
   });

   const units = useQuery(['units', formik.values.type], () =>
      get(`/units?type=${formik.values.type}`, 1, 1000, null, 1, '')
   );

   const handleCreateType = async (title) => {
      postTypeMutation.mutate({ title });
      // history.push({ pathname: '/types', search: `?action=add&title=${title}&redirect=/products/add` });
   };
   const handleInventoriesSort = (key) => {
      setInventoriesSort((prev) => ({ field: key, order: prev.order * -1 }));
   };

   useEffect(() => {
      if (isEditing && query.data?.product) {
         formik.setFieldValue('modelNumber', query.data?.product?.modelNumber ?? '');
         formik.setFieldValue('retailPrice', query.data?.product?.retailPrice ?? '');
         formik.setFieldValue('type', query.data?.product?.type?._id ?? '');

         const unit = query.data?.product?.unit;

         formik.setFieldValue('unit', unit ? { label: unit, value: unit } : {});
      }
   }, [isEditing, query.data?.product]);

   // console.log(isEditing, units.data, formik.values.unit);

   return (
      <>
         <div className="row p-0 m-0">
            <div className="col-10">
               <PageTItle activeMenu="View" motherMenu="Products" />
            </div>
            <div className="col-1">
               <Button
                  icon={AiFillCaretLeft}
                  variant="warning light"
                  onClick={() => history.replace('/products')}
                  loading={mutation.isLoading}
               >
                  Back
               </Button>
            </div>
         </div>
         {alert.getAlert()}
         <Card>
            <When condition={getTypes.isLoading || postTypeMutation.isLoading || query.isLoading}>
               <SpinnerOverlay />
            </When>
            <If condition={isAddProduct || isEditing}>
               <Then>
                  <form onSubmit={formik.handleSubmit}>
                     <Card.Header>
                        <Card.Title>{isEditing ? 'Edit Product' : 'Add New product'}</Card.Title>
                     </Card.Header>
                     <Card.Body>
                        <div className="row">
                           <div className="form-group col-xl-6">
                              <label className="col-form-label">Model Number</label>
                              <input
                                 className="form-control"
                                 onChange={formik.handleChange}
                                 type="text"
                                 name="modelNumber"
                                 disabled={isError}
                                 value={formik.values.modelNumber}
                              />
                           </div>
                        </div>
                        <div className="row">
                           <div className="form-group col-xl-6">
                              <label className="col-form-label">Type</label>
                              {(query.data?.product || isAddProduct) && (
                                 <CreatableSelect
                                    isClearable
                                    defaultValue={
                                       isEditing && {
                                          _id: query.data?.product?.type?.id,
                                          label: query.data?.product?.type?.title,
                                          value: query.data?.product?.type?.title,
                                       }
                                    }
                                    onChange={(e) => formik.setFieldValue('type', e?._id)}
                                    options={
                                       getTypes.data?.length > 0 &&
                                       getTypes.data.map((e) => ({ ...e, label: e.title, value: e.title }))
                                    }
                                    onCreateOption={handleCreateType}
                                 />
                              )}
                           </div>
                        </div>
                        <div className="row">
                           <div className="form-group col-xl-3">
                              <label className="col-form-label">Retail Price</label>
                              <input
                                 style={{ height: '38px' }}
                                 className="form-control"
                                 onChange={formik.handleChange}
                                 type="text"
                                 name="retailPrice"
                                 disabled={isError}
                                 value={formik.values.retailPrice}
                              />
                           </div>
                           <div className="form-group col-xl-3">
                              <label className="col-form-label">Unit</label>
                              <Select
                                 width="tw-w-full"
                                 onChange={(e) => formik.setFieldValue('unit', { label: e.label, value: e.label })}
                                 value={formik.values.unit}
                                 options={units.data?.map((e) => ({ label: e.title, value: e }))}
                              />
                           </div>
                        </div>
                     </Card.Body>
                     <Card.Footer>
                        <div className="row">
                           <div className="col-xl-12 tw-justify-center">
                              <ButtonGroup>
                                 {/* <Button
                                    icon={AiFillCaretLeft}
                                    variant="warning light"
                                    onClick={() => history.replace('/products')}
                                    loading={mutation.isLoading}
                                 >
                                    Back
                                 </Button> */}
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
                     <Card.Title>View product</Card.Title>
                  </Card.Header>
                  <Card.Body>
                     <div className="row">
                        <div className="form-group col-xl-6">
                           <label className="col-form-label">Model Number</label>
                           <h4>{query.data?.product?.modelNumber ?? 'N/A'}</h4>
                        </div>
                     </div>
                     <div className="row">
                        <div className="form-group col-xl-6">
                           <label className="col-form-label">Retail Price</label>
                           <h4>{query.data?.product?.retailPrice ?? 'N/A'}</h4>
                        </div>
                     </div>
                     <div className="row">
                        <div className="form-group col-xl-6">
                           <label className="col-form-label">Unit</label>
                           <h4>{query.data?.product?.unit ?? 'N/A'}</h4>
                        </div>
                     </div>
                     <div className="row">
                        <div className="form-group col-xl-6">
                           <label className="col-form-label">Type</label>
                           <h4>{query.data?.product?.type?.title ?? 'N/A'}</h4>
                        </div>
                     </div>
                  </Card.Body>
               </Else>
            </If>
         </Card>
         <When condition={isViewProduct}>
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
                                    <strong
                                       className="tw-cursor-pointer"
                                       onClick={() => handleInventoriesSort('supplier')}
                                    >
                                       SUPPLIER
                                       <span>
                                          <When condition={inventoriesSort.field !== 'supplier'}>
                                             <FaSort className="d-inline mx-1" />
                                          </When>
                                          <When
                                             condition={
                                                inventoriesSort.field === 'supplier' && inventoriesSort.order === -1
                                             }
                                          >
                                             <FaSortDown className="d-inline mx-1" />
                                          </When>
                                          <When
                                             condition={
                                                inventoriesSort.field === 'supplier' && inventoriesSort.order === 1
                                             }
                                          >
                                             <FaSortUp className="d-inline mx-1" />
                                          </When>
                                       </span>
                                    </strong>
                                 </th>
                                 <th>
                                    <strong
                                       className="tw-cursor-pointer"
                                       onClick={() => handleInventoriesSort('modelNumber')}
                                    >
                                       MODEL NUMBER
                                       <span>
                                          <When condition={inventoriesSort.field !== 'modelNumber'}>
                                             <FaSort className="d-inline mx-1" />
                                          </When>
                                          <When
                                             condition={
                                                inventoriesSort.field === 'modelNumber' && inventoriesSort.order === -1
                                             }
                                          >
                                             <FaSortDown className="d-inline mx-1" />
                                          </When>
                                          <When
                                             condition={
                                                inventoriesSort.field === 'modelNumber' && inventoriesSort.order === 1
                                             }
                                          >
                                             <FaSortUp className="d-inline mx-1" />
                                          </When>
                                       </span>
                                    </strong>
                                 </th>
                                 <th>
                                    <strong
                                       className="tw-cursor-pointer"
                                       onClick={() => handleInventoriesSort('sourcePrice')}
                                    >
                                       PRICE
                                       <span>
                                          <When condition={inventoriesSort.field !== 'sourcePrice'}>
                                             <FaSort className="d-inline mx-1" />
                                          </When>
                                          <When
                                             condition={
                                                inventoriesSort.field === 'sourcePrice' && inventoriesSort.order === -1
                                             }
                                          >
                                             <FaSortDown className="d-inline mx-1" />
                                          </When>
                                          <When
                                             condition={
                                                inventoriesSort.field === 'sourcePrice' && inventoriesSort.order === 1
                                             }
                                          >
                                             <FaSortUp className="d-inline mx-1" />
                                          </When>
                                       </span>
                                    </strong>
                                 </th>
                                 <th>
                                    <strong className="tw-cursor-pointer" onClick={() => handleInventoriesSort('paid')}>
                                       PAID
                                       <span>
                                          <When condition={inventoriesSort.field !== 'paid'}>
                                             <FaSort className="d-inline mx-1" />
                                          </When>
                                          <When
                                             condition={
                                                inventoriesSort.field === 'paid' && inventoriesSort.order === -1
                                             }
                                          >
                                             <FaSortDown className="d-inline mx-1" />
                                          </When>
                                          <When
                                             condition={inventoriesSort.field === 'paid' && inventoriesSort.order === 1}
                                          >
                                             <FaSortUp className="d-inline mx-1" />
                                          </When>
                                       </span>
                                    </strong>
                                 </th>
                              </tr>
                           </thead>
                           <tbody>
                              {query.data?.inventories?.docs.map((e, index) => (
                                 <tr key={`${e._id}`} className={e.isRemaining && 'tw-bg-red-400 tw-text-gray-50'}>
                                    <td>
                                       <strong className={e.isRemaining && 'tw-text-gray-50'}>
                                          {query.data.inventories?.pagingCounter * (index + 1)}
                                       </strong>
                                    </td>
                                    <td>{e?.supplier?.name ?? 'N/A'}</td>
                                    <td>{e?.product?.modelNumber ?? 'N/A'}</td>
                                    <td>{e?.sourcePrice ?? 'N/a'}</td>
                                    <td>{e?.paid ?? 'N/A'}</td>
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
                              ))}
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
         </When>
         <When condition={inventoriesLimit > 5 ? true : query.data?.inventories?.totalPages > 1}>
            <Pagination
               page={inventoriesPage}
               onPageChange={setInventoriesPage}
               onLimitChange={setInventoriesLimit}
               {..._.omit(query.data, ['docs'])}
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

export default connect(mapStateToProps, mapDispatchToProps)(ProductActions);
