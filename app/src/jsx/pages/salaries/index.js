import dayjs from 'dayjs';
import Button from 'jsx/components/Button';
import Pagination from 'jsx/components/Pagination';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { del, get, useAlert, useQuery } from 'jsx/helpers';
import getSortingIcon from 'jsx/helpers/getSortingIcon';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { ButtonGroup, Card, OverlayTrigger, Table, Popover } from 'react-bootstrap';
import { AiFillDelete, AiFillPlusCircle, AiOutlineQuestionCircle } from 'react-icons/ai';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { Else, If, Then, When } from 'react-if';
import { useMutation, useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { setSalariesVisibility } from 'store/actions';
import swal from 'sweetalert';

const Salaries = () => {
   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(5);
   const [sort, setSort] = useState({ field: null, order: -1 });

   const queryClient = useQueryClient();

   const alert = useAlert();

   const dispatch = useDispatch();

   const query = useQuery(['salaries', page, limit, sort.field, sort.order], () =>
      get('/salaries', page, limit, sort.field, sort.order)
   );

   const handleSort = (key) => {
      setSort((prev) => ({ field: key, order: prev.order * -1 }));
   };
   useEffect(() => {
      if (page > query.data?.totalPages) {
         setPage((prev) => prev - 1);
      }
   }, [page, query.data?.totalPages]);

   const deleteMutation = useMutation((id) => del(`/salaries/id/${id}`), {
      onSuccess: async () => {
         console.log('updating');
         await queryClient.invalidateQueries('salaries');
         console.log('updated');
         alert.setAlert({
            message: 'Salary deleted successfully',
            variant: 'success',
         });
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to delete salary', err });
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
            deleteMutation.mutate(id);
         }
      });
   };

   return (
      <>
         <Card className="h-100">
            <When condition={query.isLoading || deleteMutation.isLoading}>
               <SpinnerOverlay />
            </When>
            <Card.Header>
               <Card.Title>Salaries</Card.Title>
               <ButtonGroup className="tw-float-right">
                  <input
                     type="text"
                     className="input-rounded tw-rounded-r-none tw-pl-6 tw-shadow-inner tw-ring-1 "
                     placeholder="Search Salaries by Employee..."
                     // disabled={deleteMutation.isLoading}
                     // onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button
                     size="sm"
                     variant="primary"
                     icon={AiFillPlusCircle}
                     onClick={() => dispatch(setSalariesVisibility(true))}
                  >
                     Add New Salary
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
                              <th>{getSortingIcon({ label: 'Employee' })}</th>
                              <th>{getSortingIcon({ label: 'Salary', key: 'amount', onSort: handleSort, sort })}</th>
                              <th>{getSortingIcon({ label: 'Date', key: 'createdAt', onSort: handleSort, sort })}</th>
                           </tr>
                        </thead>
                        <tbody>
                           {query.data?.docs.map((e, index) => (
                              <tr key={`${e._id}`}>
                                 <td>
                                    <strong>{query.data.pagingCounter + index}</strong>
                                 </td>
                                 <td>{e.employee.name}</td>
                                 <td>
                                    {new Intl.NumberFormat('en-IN', {
                                       maximumSignificantDigits: 3,
                                    }).format(e.amount)}{' '}
                                    PKR
                                 </td>
                                 <td>{dayjs(e.createdAt).format('dddd[,] DD MMMM YYYY')}</td>
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
                                       <Button
                                          variant="danger"
                                          size="sm"
                                          icon={AiFillDelete}
                                          onClick={() => handleOnClickDelete(e._id)}
                                       >
                                          Delete
                                       </Button>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </Table>
                  </Then>
                  <Else>
                     <When condition={!query.isLoading}>
                        <p className="tw-m-0">No salaries found</p>
                     </When>
                  </Else>
               </If>
            </Card.Body>
         </Card>
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

export default React.memo(Salaries);
