import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useFormik } from 'formik';
import Button from 'jsx/components/Button';
import ModalWrapper from 'jsx/components/ModalWrapper';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { del, get, post, useAlert, useMutation, useQuery } from 'jsx/helpers';
import { userRoles } from 'jsx/helpers/enums';
import React, { useState } from 'react';
import { ButtonGroup, Card, Col, OverlayTrigger, Popover, Row, Table } from 'react-bootstrap';
import { AiFillDelete, AiFillPlusCircle, AiOutlineQuestionCircle } from 'react-icons/ai';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { Else, If, Then, When } from 'react-if';
import { useQueryClient } from 'react-query';
import { connect } from 'react-redux';
import swal from 'sweetalert';

const ExpenseTypes = (props) => {
   dayjs.extend(relativeTime);
   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(5);
   const [sort, setSort] = useState({ field: null, order: -1 });

   const [showModal, setShowModal] = useState(false);

   const alert = useAlert();

   const queryClient = useQueryClient();

   const query = useQuery(['expenses/types', page, limit, sort.field, sort.order], () =>
      get('/expenses/types', page, limit, sort.field, sort.order)
   );
   const deleteMutation = useMutation((id) => del(`/expenses/types/id/${id}`), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('expenses/types');
         alert.setAlert({
            message: 'Expense type deleted successfully.',
            variant: 'success',
         });
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to delete Expense type.', err });
      },
   });

   const postMutation = useMutation((payload) => post('/expenses/types', payload), {
      onSuccess: () => {
         setShowModal(false);
         query.refetch();
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to add Expense type.', err });
      },
   });

   const formik = useFormik({
      initialValues: {
         title: '',
      },
      validateOnChange: false,
      validateOnBlur: false,
      onSubmit: (values) => {
         postMutation.mutate(values);
      },
   });

   const handleOnClickAdd = () => {
      setShowModal(true);
      formik.setFieldValue('title', '');
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

   const handleSort = (key) => {
      setSort((prev) => ({ field: key, order: prev.order * -1 }));
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
               <Card.Title>Manage Types</Card.Title>
               <Button size="sm" variant="primary" icon={AiFillPlusCircle} onClick={handleOnClickAdd}>
                  Add New Expense Type
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
                              <th className="tw-cursor-pointer" onClick={() => handleSort('title')}>
                                 <strong className="tw-cursor-pointer">
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
                           </tr>
                        </thead>
                        <tbody>
                           {query.data?.map((e, index) => (
                              <tr key={`${e._id}`}>
                                 <td>
                                    <strong>{index + 1}</strong>
                                 </td>
                                 <td>{e.title}</td>
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
                                 <When condition={props.user?.role !== userRoles.CASHIER}>
                                    <td>
                                       <ButtonGroup>
                                          <Button
                                             variant="danger"
                                             size="sm"
                                             icon={AiFillDelete}
                                             onClick={() => handleOnClickDelete(e._id)}
                                          />
                                       </ButtonGroup>
                                    </td>
                                 </When>
                              </tr>
                           ))}
                        </tbody>
                     </Table>
                  </Then>
                  <Else>
                     <When condition={!query.isLoading}>
                        <p className="tw-m-0">No types found</p>
                     </When>
                  </Else>
               </If>
            </Card.Body>
         </Card>

         {/* ADD Modal */}
         <ModalWrapper
            show={showModal}
            onHide={() => {
               setShowModal(false);
            }}
            title="Add New Expense Type"
            isLoading={query.isLoading || postMutation.isLoading}
            size="md"
            onSubmit={formik.handleSubmit}
            submitButtonText="Confirm"
         >
            <form onSubmit={formik.handleSubmit}>
               <div className="row">
                  <div className="form-group col-xl-6">
                     <label className="col-form-label">Title</label>
                     <input
                        className="form-control"
                        onChange={formik.handleChange}
                        type="text"
                        name="title"
                        value={formik.values.title}
                     />
                  </div>
               </div>
            </form>
         </ModalWrapper>
      </>
   );
};

const mapStateToProps = ({ auth }) => ({
   user: auth.user,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(ExpenseTypes));
