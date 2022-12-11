import Button from 'jsx/components/Button';
import Pagination from 'jsx/components/Pagination';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { del, get, useAlert, useMutation, useQuery } from 'jsx/helpers';
import PageTItle from 'jsx/layouts/PageTitle';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { ButtonGroup, Card, Col, Row, Table, Popover, OverlayTrigger } from 'react-bootstrap';
import { AiFillDelete, AiFillEdit, AiFillEye, AiFillPlusCircle, AiOutlineQuestionCircle } from 'react-icons/ai';
import { Else, If, Then, When } from 'react-if';
import { useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import swal from 'sweetalert';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { useDebounce } from 'ahooks';
import { batch, connect, useDispatch } from 'react-redux';
import { userRoles } from 'jsx/helpers/enums';
import { setCustomersData, setCustomersVisibility } from 'store/actions';

dayjs.extend(relativeTime);
const Customers = (props) => {
   const history = useHistory();
   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(5);
   const [sort, setSort] = useState({ field: null, order: 1 });
   const [search, setSearch] = useState('');
   const debouncedSearchValue = useDebounce(search, { wait: 500 });
   const dispatch = useDispatch();

   const alert = useAlert();
   const queryClient = useQueryClient();

   const query = useQuery(['customers', page, limit, sort.field, sort.order, debouncedSearchValue], () =>
      get('/customers', page, limit, sort.field, sort.order, debouncedSearchValue)
   );
   const deleteMutation = useMutation((id) => del(`/customers/id/${id}`), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('customers');
         alert.setAlert({
            message: 'Customer deleted successfully',
            variant: 'success',
         });
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to delete customer', err });
      },
   });

   const handleEdit = (customer) => {
      batch(() => {
         dispatch(setCustomersData(customer));
         dispatch(setCustomersVisibility(true));
      });
   };

   const handleOnClickView = (obj) => {
      history.push({ pathname: `/customers/${obj._id}`, search: `?type=view` });
   };
   const handleOnClickAdd = () => {
      history.push('/customers/add');
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
         <PageTItle activeMenu="Customers" motherMenu="Manage" />
         <div className="row tw-mb-8">
            <div className="col-xl-6">
               <Button variant="primary" icon={AiFillPlusCircle} onClick={handleOnClickAdd}>
                  Add New Customer
               </Button>
            </div>

            <div className="col-xl-6">
               <ButtonGroup className="tw-float-right">
                  <input
                     type="text"
                     className="input-rounded tw-rounded-r-none tw-pl-6"
                     placeholder="Search Customers..."
                     disabled={deleteMutation.isLoading}
                     onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button variant="secondary" className="btn btn-secondary tw-pl-6" loading={query.isLoading}>
                     Search
                  </Button>
               </ButtonGroup>
            </div>
         </div>
         {alertMarkup ? (
            <Row>
               <Col lg={12}>{alertMarkup}</Col>
            </Row>
         ) : null}
         <div className="row">
            <Col lg={12}>
               <Card>
                  <When condition={query.isLoading || deleteMutation.isLoading}>
                     <SpinnerOverlay />
                  </When>
                  <Card.Header>
                     <Card.Title>Manage Customers</Card.Title>
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
                                       <strong className="tw-cursor-pointer" onClick={() => handleSort('name')}>
                                          NAME
                                          <span>
                                             <When condition={sort.field !== 'name'}>
                                                <FaSort className="d-inline mx-1" />
                                             </When>
                                             <When condition={sort.field === 'name' && sort.order === -1}>
                                                <FaSortDown className="d-inline mx-1" />
                                             </When>
                                             <When condition={sort.field === 'name' && sort.order === 1}>
                                                <FaSortUp className="d-inline mx-1" />
                                             </When>
                                          </span>
                                       </strong>
                                    </th>
                                    <th>
                                       <strong className="tw-cursor-pointer" onClick={() => handleSort('phone')}>
                                          Phone
                                          <span>
                                             <When condition={sort.field !== 'phone'}>
                                                <FaSort className="d-inline mx-1" />
                                             </When>
                                             <When condition={sort.field === 'phone' && sort.order === -1}>
                                                <FaSortDown className="d-inline mx-1" />
                                             </When>
                                             <When condition={sort.field === 'phone' && sort.order === 1}>
                                                <FaSortUp className="d-inline mx-1" />
                                             </When>
                                          </span>
                                       </strong>
                                    </th>
                                 </tr>
                              </thead>

                              <tbody>
                                 {query.data?.docs.map((e, index) => (
                                    <tr key={`${e._id}`}>
                                       <td>
                                          <strong>{query.data.pagingCounter + index}</strong>
                                       </td>
                                       <td>{e.name}</td>
                                       <td>{e.phone}</td>
                                       <td>
                                          <OverlayTrigger
                                             trigger="hover"
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
                                       <When condition={props.user?.role !== userRoles.CASHIER}>
                                          <td>
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
                                          </td>
                                       </When>
                                    </tr>
                                 ))}
                              </tbody>
                           </Table>
                        </Then>
                        <Else>
                           <When condition={!query.isLoading && !debouncedSearchValue}>
                              <p className="tw-m-0">No customers created</p>
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
               isLimitDisabled={query.isLoading || deleteMutation.isLoading}
            />
         </When>
      </>
   );
};
const mapStateToProps = ({ auth }) => ({
   user: auth.user,
});

const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(Customers);
