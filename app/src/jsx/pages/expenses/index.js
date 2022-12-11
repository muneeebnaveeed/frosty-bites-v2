import { useDebounce } from 'ahooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Button from 'jsx/components/Button';
import Pagination from 'jsx/components/Pagination';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { del, get, useAlert, useMutation, useQuery } from 'jsx/helpers';
import { userRoles } from 'jsx/helpers/enums';
import getSortingIcon from 'jsx/helpers/getSortingIcon';
import PageTItle from 'jsx/layouts/PageTitle';
import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import { ButtonGroup, Card, Col, OverlayTrigger, Popover, Row, Table } from 'react-bootstrap';
import { AiFillDelete, AiFillEdit, AiFillEye, AiFillPlusCircle, AiOutlineQuestionCircle } from 'react-icons/ai';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { Else, If, Then, When } from 'react-if';
import { useQueryClient } from 'react-query';
import { connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { setExpensesVisibility } from 'store/actions';
import swal from 'sweetalert';
import ExpenseTypes from '../expenseTypes';
import Salaries from '../salaries';

const Expenses = (props) => {
   dayjs.extend(relativeTime);
   const history = useHistory();
   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(5);
   const [sort, setSort] = useState({ field: null, order: -1 });
   const [search, setSearch] = useState('');
   const debouncedSearchValue = useDebounce(search, { wait: 500 });

   const alert = useAlert();
   const queryClient = useQueryClient();
   const dispatch = useDispatch();

   const query = useQuery(['expenses', page, limit, sort.field, sort.order, debouncedSearchValue], () =>
      get('/expenses', page, limit, sort.field, sort.order, debouncedSearchValue)
   );
   const deleteMutation = useMutation((id) => del(`/expenses/id/${id}`), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('expenses');
         alert.setAlert({
            message: 'Sale deleted successfully',
            variant: 'success',
         });
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to delete sale', err });
      },
   });

   // const handleOnClickView = (obj) => {
   //    history.push({ pathname: `/expenses/${obj._id}`, search: `?type=view` });
   // };
   const handleOnClickAdd = () => {
      history.push('/expenses/add');
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
         <PageTItle activeMenu="Expenses" motherMenu="Diamond Tiles" />

         {alertMarkup ? (
            <Row>
               <Col lg={12}>{alertMarkup}</Col>
            </Row>
         ) : null}
         <div className="row">
            <div className="col-xl-12 mb-4">
               <Salaries />
            </div>
            <Col lg={12}>
               <Card>
                  <When condition={query.isLoading || deleteMutation.isLoading}>
                     <SpinnerOverlay />
                  </When>
                  <Card.Header>
                     <Card.Title>Manage Expenses</Card.Title>
                     <ButtonGroup className="tw-float-right">
                        <input
                           type="text"
                           className="input-rounded tw-rounded-r-none tw-pl-6 tw-shadow-inner tw-ring-1 "
                           placeholder="Search Expenses..."
                           disabled={deleteMutation.isLoading}
                           onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button
                           size="sm"
                           variant="primary"
                           icon={AiFillPlusCircle}
                           onClick={() => dispatch(setExpensesVisibility(true))}
                        >
                           Add New Expense
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
                                    <th>{getSortingIcon({ label: 'Title' })}</th>

                                    <th>
                                       {getSortingIcon({ label: 'Amount', key: 'amount', onSort: handleSort, sort })}
                                    </th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {query.data?.docs.map((e, index) => (
                                    <tr key={`${e._id}`}>
                                       <td>
                                          <strong>{query.data.pagingCounter + index}</strong>
                                       </td>
                                       <td>{e.title}</td>
                                       <td>
                                          {new Intl.NumberFormat('en-IN', {
                                             maximumSignificantDigits: 3,
                                          }).format(e.amount)}{' '}
                                          PKR
                                       </td>
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
                                 ))}
                              </tbody>
                           </Table>
                        </Then>
                        <Else>
                           <When condition={!query.isLoading && !debouncedSearchValue}>
                              <p className="tw-m-0">No Expenses created</p>
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

export default connect(mapStateToProps, mapDispatchToProps)(Expenses);
