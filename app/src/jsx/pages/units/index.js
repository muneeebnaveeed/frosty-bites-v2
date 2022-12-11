import useUrlState from '@ahooksjs/use-url-state';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Button from 'jsx/components/Button';
import ModalWrapper from 'jsx/components/ModalWrapper';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { del, get, post, useAlert, useMutation, useQuery } from 'jsx/helpers';
import PageTItle from 'jsx/layouts/PageTitle';
import React, { useEffect, useMemo, useState } from 'react';
import { ButtonGroup, Card, Col, OverlayTrigger, Popover, Row, Table } from 'react-bootstrap';
import { AiFillDelete, AiFillPlusCircle, AiOutlineQuestionCircle, AiFillEye } from 'react-icons/ai';
import { Else, If, Then, When } from 'react-if';
import { useQueryClient } from 'react-query';
import swal from 'sweetalert';
import { useHistory } from 'react-router-dom';
import { useFormik } from 'formik';
import { connect, useDispatch } from 'react-redux';
import { userRoles } from 'jsx/helpers/enums';
import { setUnitsData, setUnitsVisibility } from 'store/actions';
import CreatableSelect from '../../components/CreatableSelect';

const Units = (props) => {
   const history = useHistory();
   dayjs.extend(relativeTime);
   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(5);
   const [urlState, setUrlState] = useUrlState({});
   const [search, setSearch] = useState('');

   const [showModal, setShowModal] = useState(false);
   const [selectedRow, setSelectedRow] = useState(null);

   const alert = useAlert();

   const queryClient = useQueryClient();

   const dispatch = useDispatch();

   const query = useQuery(['units', page, limit, search], () => get('/units', page, limit, '', '', search));
   const getTypes = useQuery('types', () => get('/types'));
   const deleteMutation = useMutation((id) => del(`/units/id/${id}`), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('units');
         alert.setAlert({
            message: 'Unit deleted successfully',
            variant: 'success',
         });
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to delete Unit', err });
      },
   });

   const postMutation = useMutation((payload) => post('/units', payload), {
      onSuccess: () => {
         setShowModal(false);
         setUrlState({});
         query.refetch();
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to add unit', err });
      },
   });
   const postTypeMutation = useMutation((payload) => post('/types', payload), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('types');
      },
   });

   const isAdd = useMemo(() => urlState?.action === 'add', [urlState.action]);
   const mutation = useMemo(() => postMutation, [postMutation]);

   const handleOnClickAdd = () => {
      dispatch(setUnitsVisibility(true));
      dispatch(setUnitsData({}));
      // setUrlState({ action: 'add' });
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

   return (
      <>
         {alertMarkup ? (
            <Row>
               <Col lg={12}>{alertMarkup}</Col>
            </Row>
         ) : null}
         <Card className="h-100">
            <When condition={query.isLoading || deleteMutation.isLoading}>
               <SpinnerOverlay />
            </When>
            <Card.Header>
               <Card.Title>Manage units</Card.Title>
               <Button size="sm" variant="primary" icon={AiFillPlusCircle} onClick={handleOnClickAdd}>
                  Add New Unit
               </Button>
            </Card.Header>
            <Card.Body>
               <If condition={query.data?.length > 0}>
                  <Then>
                     <Table className="tw-relative" responsive>
                        <thead>
                           <tr>
                              <th className="width80">
                                 <strong>#</strong>
                              </th>
                              <th>
                                 <strong className="tw-cursor-pointer">Title</strong>
                              </th>
                              <th>
                                 <strong className="tw-cursor-pointer">Value</strong>
                              </th>
                              <th>
                                 <strong className="tw-cursor-pointer">Type</strong>
                              </th>
                           </tr>
                        </thead>
                        <tbody>
                           {query.data?.map((e, index) => (
                              <tr key={`${e._id}`}>
                                 <td>
                                    <strong>{index + 1}</strong>
                                 </td>
                                 <td>{e.title}</td>
                                 <td>{e.value}</td>
                                 <td>{e.type.title}</td>

                                 <When condition={props.user?.role !== userRoles.CASHIER}>
                                    <td>
                                       <Button
                                          variant="danger"
                                          size="sm"
                                          icon={AiFillDelete}
                                          onClick={() => handleOnClickDelete(e._id)}
                                       >
                                          Delete
                                       </Button>
                                    </td>
                                 </When>
                              </tr>
                           ))}
                        </tbody>
                     </Table>
                  </Then>
                  <Else>
                     <When condition={!query.isLoading}>
                        <p className="tw-m-0">No units created</p>
                     </When>
                  </Else>
               </If>
            </Card.Body>
         </Card>
      </>
   );
};
const mapStateToProps = ({ auth }) => ({
   user: auth.user,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Units));
