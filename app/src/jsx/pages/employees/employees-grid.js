import { useDebounce } from 'ahooks';
import Button from 'jsx/components/Button';
import Pagination from 'jsx/components/Pagination';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { useMutation, useQuery } from 'jsx/helpers';
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
import { setEmployeesData, setEmployeesVisibility } from 'store/actions';
import TableSearch from 'jsx/components/TableSearch';
import GenericTableHeadingSorter from 'jsx/components/GenericTableHeadingSorter';
import DeleteButton from 'jsx/components/DeleteButton';
import EditButton from 'jsx/components/EditButton';
import { toast } from 'react-toastify';
import { handleToastError, initialSort } from 'jsx/helpers/misc';
import { GET_EMPLOYEES } from './queries';
import { DELETE_ENTITY } from '../../../queries';

const EmployeesGrid = (props) => {
   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(5);
   const [sort, setSort] = useState(initialSort);

   const [search, setSearch] = useState('');

   const dispatch = useDispatch();
   const debouncedSearchValue = useDebounce(search, { wait: 500 });

   const queryClient = useQueryClient();

   const query = useQuery(['employees', { page, sort, limit, search: debouncedSearchValue }], GET_EMPLOYEES, {
      onSuccess: (data) => {
         if (page > data.totalPages) setPage((prev) => prev - 1);
      },
   });

   const deleteMutation = useMutation(DELETE_ENTITY('Employee'));

   const handleOnClickAdd = () => {
      dispatch(setEmployeesVisibility(true));
   };

   const handleOnClickDelete = (id) => {
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
                  toast.success('Employee deleted successfully');
                  return queryClient.invalidateQueries('employees');
               },
               onError: handleToastError,
            });
      });
   };

   const handleSort = (field) => {
      setSort((prev) => {
         if (prev.field && prev.order === -1) return initialSort;
         return { field, order: prev.order * -1 };
      });
   };

   const TableHeadingSorter = useCallback(
      ({ field, children }) => (
         <GenericTableHeadingSorter sort={sort} field={field} onClick={() => handleSort(field)}>
            {children}
         </GenericTableHeadingSorter>
      ),
      [sort]
   );

   const handleEdit = (row) => {
      batch(() => {
         dispatch(setEmployeesData(row));
         dispatch(setEmployeesVisibility(true));
      });
   };

   // eslint-disable-next-line react/destructuring-assignment
   const isCashier = props.user?.role === userRoles.CASHIER;

   const shouldShowSpinner = query.isLoading || deleteMutation.isLoading;

   return (
      <>
         <PageTItle activeMenu="Employees" motherMenu="Manage" />

         <div className="row">
            <Col lg={12}>
               <Card>
                  <When condition={shouldShowSpinner}>
                     <SpinnerOverlay />
                  </When>
                  <Card.Header>
                     <Card.Title>Manage Employees</Card.Title>
                     <ButtonGroup className="tw-float-right">
                        <TableSearch
                           placeholder="Search employee name"
                           disabled={shouldShowSpinner}
                           changeHandler={setSearch}
                        />
                        <Button size="sm" variant="primary" icon={AiFillPlusCircle} onClick={handleOnClickAdd}>
                           Add New Employee
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
                                       <TableHeadingSorter field="name">Name</TableHeadingSorter>
                                    </th>
                                    <th>
                                       <TableHeadingSorter field="phone">Phone</TableHeadingSorter>
                                    </th>
                                    <th>
                                       <TableHeadingSorter field="salary">Salary</TableHeadingSorter>
                                    </th>
                                    <When condition={!isCashier}>
                                       <th>
                                          <strong>Actions</strong>
                                       </th>
                                    </When>
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
                                       <td>{e.salary}</td>
                                       <When condition={!isCashier}>
                                          <td>
                                             <ButtonGroup>
                                                <EditButton onClick={() => handleEdit(e)} />
                                                <DeleteButton onClick={() => handleOnClickDelete(e._id)} />
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
                              <p className="tw-m-0">No employees added</p>
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

export default connect(mapStateToProps, {})(EmployeesGrid);
