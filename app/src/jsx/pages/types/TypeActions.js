import { useDebounce } from 'ahooks';
import Button from 'jsx/components/Button';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { get, useAlert, useQuery } from 'jsx/helpers';
import PageTItle from 'jsx/layouts/PageTitle';
import React, { useState, useEffect } from 'react';
import { Card, ButtonGroup, Table, OverlayTrigger, Popover } from 'react-bootstrap';
import { When, If, Else, Then } from 'react-if';
import { useHistory, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import {
   AiFillDelete,
   AiFillEdit,
   AiFillEye,
   AiFillPlusCircle,
   AiOutlineQuestionCircle,
   AiFillCaretLeft,
} from 'react-icons/ai';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';

const TypeActions = () => {
   dayjs.extend(relativeTime);

   const history = useHistory();
   const params = useParams();
   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(5);
   const [sort, setSort] = useState({ field: null, order: -1 });
   const [search, setSearch] = useState('');
   const debouncedSearchValue = useDebounce(search, { wait: 500 });
   const alert = useAlert();

   const query = useQuery(
      ['type', params.id, page, limit, sort.field, sort.order, debouncedSearchValue],
      () => get(`/types/id/${params.id}`, page, limit, sort.field, sort.order, debouncedSearchValue),
      {
         onError: (err) => {
            alert.setErrorAlert({
               message: 'Invalid URL!',
               err: { message: ['The page will redirect to manage products.'] },
               callback: () => history.push('/products'),
               duration: 3000,
            });
         },
      }
   );

   const handleOnClickEdit = (obj) => {
      history.push({ pathname: `/products/${obj._id}`, search: `?type=edit` });
   };

   const handleOnClickView = (obj) => {
      history.push({ pathname: `/products/${obj._id}`, search: `?type=view` });
   };
   const handleOnClickAdd = () => {
      history.push('/products/add');
   };

   const handleSort = (key) => {
      setSort((prev) => ({ field: key, order: prev.order * -1 }));
   };

   useEffect(() => {
      if (page > query.data?.totalPages) {
         setPage((prev) => prev - 1);
      }
   }, [page, query.data?.totalPages]);
   return (
      <>
         <div className="row p-0 m-0">
            <div className="col-10">
               <PageTItle activeMenu="Type" motherMenu="Products" />
            </div>
            <div className="col-1">
               <Button
                  icon={AiFillCaretLeft}
                  variant="warning light"
                  onClick={() => history.goBack()}
                  loading={query.isLoading}
               >
                  Back
               </Button>
            </div>
         </div>
         {alert.getAlert()}
         <div className="row mb-3">
            <div className="col-xl-5 my-2">
               <Card className="h-100">
                  <When condition={query.isLoading}>
                     <SpinnerOverlay />
                  </When>

                  <Card.Header>
                     <Card.Title>View Type</Card.Title>
                  </Card.Header>
                  <Card.Body>
                     <div className="row">
                        <div className="form-group col-xl-6">
                           <label className="col-form-label">Title</label>
                           <h4>{query.data?.type?.title ?? 'N/A'}</h4>
                        </div>
                     </div>
                  </Card.Body>
               </Card>
            </div>
            <div className="col-xl-7 my-2">
               <Card className="h-100">
                  <When condition={query.isLoading}>
                     <SpinnerOverlay />
                  </When>

                  <Card.Header>
                     <Card.Title>View Units</Card.Title>
                  </Card.Header>
                  <Card.Body>
                     <Table className="tw-relative" responsive>
                        <thead>
                           <tr>
                              <th className="width80">
                                 <strong>#</strong>
                              </th>
                              <th>
                                 <strong className="tw-cursor-pointer">TITLE</strong>
                              </th>
                              <th>
                                 <strong className="tw-cursor-pointer">VALUE</strong>
                              </th>
                           </tr>
                        </thead>
                        <tbody>
                           {query.data?.units?.map((e, index) => (
                              <tr key={`${e._id}`}>
                                 <td>
                                    <strong>{index + 1}</strong>
                                 </td>
                                 <td>{e.title}</td>
                                 <td>{e.value}</td>
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
                  </Card.Body>
               </Card>
            </div>
         </div>

         {/* VIEW PRODUCTS */}
         <Card>
            <When condition={query.isLoading}>
               <SpinnerOverlay />
            </When>
            <Card.Header>
               <Card.Title>View Products</Card.Title>
               <ButtonGroup className="tw-float-right">
                  <input
                     type="text"
                     className="input-rounded tw-pl-6 tw-shadow-inner tw-ring-1 py-1"
                     placeholder="Search products..."
                     onChange={(e) => setSearch(e.target.value)}
                  />
               </ButtonGroup>
            </Card.Header>
            <Card.Body>
               <If condition={query.data?.products?.totalDocs > 0}>
                  <Then>
                     <Table className="tw-relative" responsive>
                        <thead>
                           <tr>
                              <th className="width80">
                                 <strong>#</strong>
                              </th>
                              <th>
                                 <strong className="tw-cursor-pointer" onClick={() => handleSort('title')}>
                                    TITLE
                                    <span>
                                       <When condition={sort.field !== 'title'}>
                                          <FaSort className="d-inline mx-1" />
                                       </When>
                                       <When condition={sort.field === 'title' && sort.order === -1}>
                                          <FaSortDown className="d-inline mx-1" />
                                       </When>
                                       <When condition={sort.field === 'title' && sort.order === 1}>
                                          <FaSortUp className="d-inline mx-1" />
                                       </When>
                                    </span>
                                 </strong>
                              </th>
                              <th>
                                 <strong className="tw-cursor-pointer" onClick={() => handleSort('modelNumber')}>
                                    MODEL#
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
                                 <strong className="tw-cursor-pointer" onClick={() => handleSort('type')}>
                                    TYPE
                                    <span>
                                       <When condition={sort.field !== 'type'}>
                                          <FaSort className="d-inline mx-1" />
                                       </When>
                                       <When condition={sort.field === 'type' && sort.order === -1}>
                                          <FaSortDown className="d-inline mx-1" />
                                       </When>
                                       <When condition={sort.field === 'type' && sort.order === 1}>
                                          <FaSortUp className="d-inline mx-1" />
                                       </When>
                                    </span>
                                 </strong>
                              </th>
                           </tr>
                        </thead>
                        <tbody>
                           {query.data?.products?.docs.map((e, index) => (
                              <tr key={`${e._id}`}>
                                 <td>
                                    <strong>{query.data?.products?.pagingCounter * (index + 1)}</strong>
                                 </td>
                                 <td>{e.title}</td>
                                 <td>{e.modelNumber}</td>
                                 <td>{(e.type && e.type?.title) ?? 'N/A'}</td>
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
      </>
   );
};

export default TypeActions;
