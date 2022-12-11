import useUrlState from '@ahooksjs/use-url-state';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Button from 'jsx/components/Button';
import ModalWrapper from 'jsx/components/ModalWrapper';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { del, get, post, useAlert, useMutation, useQuery } from 'jsx/helpers';
import React, { useMemo, useState } from 'react';
import { ButtonGroup, Card, Col, OverlayTrigger, Popover, Row, Table } from 'react-bootstrap';
import { AiFillDelete, AiFillEye, AiFillPlusCircle, AiOutlineQuestionCircle } from 'react-icons/ai';
import { Else, If, Then, When } from 'react-if';
import { useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import swal from 'sweetalert';
import { connect, useDispatch } from 'react-redux';
import { userRoles } from 'jsx/helpers/enums';
import { setTypesData, setTypesVisibility } from 'store/actions';

const Types = (props) => {
   const history = useHistory();
   dayjs.extend(relativeTime);
   const [urlState, setUrlState] = useUrlState({});

   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(5);
   const [search, setSearch] = useState('');
   const [showModal, setShowModal] = useState(false);
   const [title, setTitle] = useState('');

   const alert = useAlert();
   const queryClient = useQueryClient();

   const dispatch = useDispatch();

   const query = useQuery('types', () => get('/types', page, limit, '', '', search));
   const postMutation = useMutation((payload) => post('/types', payload), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('units');
         if (urlState.redirect) {
            history.replace(urlState.redirect);
         }
         setShowModal(false);
         query.refetch();
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to add unit', err });
      },
   });
   const deleteMutation = useMutation((id) => del(`/types/id/${id}`), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('types');
         alert.setAlert({
            message: 'Type deleted successfully',
            variant: 'success',
         });
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to delete Type', err });
      },
   });

   const mutation = useMemo(() => postMutation, [postMutation]);

   const handleOnClickAdd = () => {
      // setUrlState({ action: 'add' });
      dispatch(setTypesVisibility(true));
      dispatch(setTypesData({}));
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
   const handleOnClickView = (id) => {
      history.push(`/products/types/${id}`);
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      mutation.mutate({ title });
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
               <Card.Title>Manage types</Card.Title>
               <Button size="sm" variant="primary" icon={AiFillPlusCircle} onClick={handleOnClickAdd}>
                  Add New Type
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
                                 <strong>TITLE</strong>
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
                        <p className="tw-m-0">No types created</p>
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

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Types));
