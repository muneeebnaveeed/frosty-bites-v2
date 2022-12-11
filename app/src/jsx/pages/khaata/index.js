import { useDebounce } from 'ahooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getActiveElement } from 'formik';
import Button from 'jsx/components/Button';
import Pagination from 'jsx/components/Pagination';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { get, useAlert, useQuery } from 'jsx/helpers';
import { userRoles } from 'jsx/helpers/enums';
import PageTItle from 'jsx/layouts/PageTitle';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { ButtonGroup, Card, Col, OverlayTrigger, Popover, Row, Table } from 'react-bootstrap';
import {
   AiFillDelete,
   AiFillEdit,
   AiFillEye,
   AiFillPlusCircle,
   AiOutlineClear,
   AiOutlineQuestionCircle,
} from 'react-icons/ai';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { Else, If, Then, When } from 'react-if';
import { useQueryClient } from 'react-query';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

const Khaata = (props) => {
   dayjs.extend(relativeTime);
   const history = useHistory();
   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(5);
   const [sort, setSort] = useState({ field: null, order: -1 });
   const [search, setSearch] = useState('');
   const debouncedSearchValue = useDebounce(search, { wait: 500 });

   const alert = useAlert();
   const queryClient = useQueryClient();

   const query = useQuery(['expenses/khaata', page, limit, sort.field, sort.order], () =>
      get('/expenses/khaata', page, limit, sort.field, sort.order)
   );

   // const handleOnClickView = (obj) => {
   //    history.push({ pathname: `/expenses/khaata/${obj._id}`, search: `?type=view` });
   // };

   const alertMarkup = alert.getAlert();

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
         <PageTItle activeMenu="khaata" motherMenu="Diamond Tiles" />
         {alertMarkup ? (
            <Row>
               <Col lg={12}>{alertMarkup}</Col>
            </Row>
         ) : null}
         <div className="row">
            <Col lg={12}>
               <Card>
                  <When condition={query.isLoading}>
                     <SpinnerOverlay />
                  </When>
                  <Card.Header>
                     <Card.Title>Khaata</Card.Title>
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
                                          Product
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
                                 </tr>
                              </thead>
                              <tbody>
                                 {query.data &&
                                    query.data?.docs.map((e, index) => {
                                       const getId = () => {
                                          const id = e._id;
                                          return id.slice(id.length - 3);
                                       };
                                       const getTotal = () => {
                                          const price = e.type === 'inventory' ? e.sourcePrice : e.retailPrice;
                                          if (!price) return null;
                                          return price * e.quantity;
                                       };
                                       return (
                                          <tr key={`${e._id}`}>
                                             <td>
                                                <strong>{getId()}</strong>
                                             </td>
                                             <td>{e[e.type === 'sale' ? 'customer' : 'supplier']?.name ?? 'N/A'}</td>
                                             <td>
                                                {e[e.type === 'sale' ? 'inventory' : 'product']?.modelNumber ?? 'N/A'}
                                             </td>
                                             <td>{e?.quantity ?? 'N/a'}</td>
                                             <td>{getTotal()}</td>
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
                                             {/* <When condition={props.user?.role !== userRoles.CASHIER}>
                                                <td>
                                                   <Button
                                                      variant="danger"
                                                      size="sm"
                                                      icon={AiOutlineClear}
                                                      onClick={() => {}}
                                                   >
                                                      Clear
                                                   </Button>
                                                </td>
                                             </When> */}
                                          </tr>
                                       );
                                    })}
                              </tbody>
                           </Table>
                        </Then>
                        <Else>
                           <When condition={!query.isLoading && !debouncedSearchValue}>
                              <p className="tw-m-0">No sales created</p>
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

const mapStateToProps = ({ auth }) => ({
   user: auth.user,
});

const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(Khaata);
