import Button from 'jsx/components/Button';
import Pagination from 'jsx/components/Pagination';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { del, get, getV2, put, useAlert, useMutation, useQuery } from 'jsx/helpers';
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
import { connect } from 'react-redux';
import { userRoles } from 'jsx/helpers/enums';
import cls from 'classnames';
import Select from 'jsx/components/Select';
import ClearSale from '../sale/ClearSale';

dayjs.extend(relativeTime);
const Users = (props) => {
   const history = useHistory();
   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(5);
   const [sort, setSort] = useState({ field: null, order: 1 });
   const [search, setSearch] = useState('');
   const debouncedSearchValue = useDebounce(search, { wait: 500 });
   const [roles, setRoles] = useState({});

   const alert = useAlert();
   const queryClient = useQueryClient();

   const query = useQuery(['auth', page, limit, sort.field, sort.order, debouncedSearchValue], () =>
      getV2('/auth', { page, limit, search: debouncedSearchValue })
   );
   const rejectMutation = useMutation((id) => del(`/auth/id/${id}`), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('auth');
         alert.setAlert({
            message: 'User rejected successfully',
            variant: 'success',
         });
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to reject user', err });
      },
   });

   const acceptMutation = useMutation(({ id, role }) => put(`/auth/confirm/${id}/${role}`), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('auth');
         alert.setAlert({
            message: 'User accepted successfully',
            variant: 'success',
         });
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to accepted user', err });
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
            rejectMutation.mutate(id);
         }
      });
   };

   const alertMarkup = alert.getAlert();

   const handleAcceptUser = (id) => {
      console.log(id, roles, roles[id]);
      acceptMutation.mutate({ id, role: roles[id] });
   };

   useEffect(() => {
      if (page > query.data?.totalPages) {
         setPage((prev) => prev - 1);
      }
   }, [page, query.data?.totalPages]);

   return (
      <>
         <PageTItle activeMenu="Users" motherMenu="Manage" />
         <div className="row tw-mb-8">
            <div className="col-xl-6" />

            <div className="col-xl-6">
               <ButtonGroup className="tw-float-right">
                  <input
                     type="text"
                     className="input-rounded tw-rounded-r-none tw-pl-6"
                     placeholder="Search Users..."
                     disabled={rejectMutation.isLoading}
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
                  <When condition={query.isLoading || rejectMutation.isLoading || acceptMutation.isLoading}>
                     <SpinnerOverlay />
                  </When>
                  <Card.Header>
                     <Card.Title>Manage Users</Card.Title>
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
                                       <strong className="tw-cursor-pointer">Name</strong>
                                    </th>
                                    <th>
                                       <strong className="tw-cursor-pointer">Role</strong>
                                    </th>
                                    <th />
                                 </tr>
                              </thead>

                              <tbody>
                                 {query.data?.docs.map((e, index) => {
                                    if (e.name === 'dev') return null;

                                    const DeleteButton = (p) => (
                                       <Button
                                          variant="danger"
                                          size="sm"
                                          icon={AiFillDelete}
                                          onClick={() => handleOnClickDelete(e._id)}
                                       >
                                          {p.children}
                                       </Button>
                                    );
                                    return (
                                       <tr key={`${e._id}`}>
                                          <td>
                                             <b>{query.data.pagingCounter + index}</b>
                                          </td>
                                          <td className="tw-capitalize">{e.name}</td>
                                          <td className="tw-capitalize">{e.role?.toLowerCase()}</td>
                                          <td className="tw-flex tw-items-center tw-gap-4">
                                             <If condition={!e.isConfirmed}>
                                                <Then>
                                                   <Select
                                                      width="tw-w-[200px]"
                                                      placeholder="Assign Role"
                                                      options={[
                                                         { label: 'Administrator', value: 'Administrator' },
                                                         { label: 'Cashier', value: 'Cashier' },
                                                      ]}
                                                      onChange={(role) =>
                                                         setRoles((prev) => ({ ...prev, [e._id]: role.value }))
                                                      }
                                                   />
                                                   <ButtonGroup>
                                                      <DeleteButton>Reject</DeleteButton>
                                                      <Button
                                                         variant="secondary"
                                                         size="sm"
                                                         icon={AiFillEdit}
                                                         disabled={!roles[e._id]}
                                                         onClick={() => handleAcceptUser(e._id)}
                                                      >
                                                         Accept
                                                      </Button>
                                                   </ButtonGroup>
                                                </Then>
                                                <Else>
                                                   <When condition={props.user._id !== e._id}>
                                                      <DeleteButton>Delete</DeleteButton>
                                                   </When>
                                                </Else>
                                             </If>
                                          </td>
                                       </tr>
                                    );
                                 })}
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
               isLimitDisabled={query.isLoading || rejectMutation.isLoading}
            />
         </When>
      </>
   );
};
const mapStateToProps = ({ auth }) => ({
   user: auth.user,
});

const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(Users);
