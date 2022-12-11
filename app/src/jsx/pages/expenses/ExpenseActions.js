import useUrlState from '@ahooksjs/use-url-state';
import { useDebounce } from 'ahooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useFormik } from 'formik';
import Button from 'jsx/components/Button';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { get, post, useAlert, useMutation, useQuery } from 'jsx/helpers';
import PageTItle from 'jsx/layouts/PageTitle';
import React, { useMemo, useState } from 'react';
import { ButtonGroup, Card } from 'react-bootstrap';
import { AiFillCaretLeft, AiFillSave } from 'react-icons/ai';
import { Else, If, Then, When } from 'react-if';
import { useQueryClient } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import CreatableSelect from '../../components/CreatableSelect';

const ExpenseActions = () => {
   dayjs.extend(relativeTime);

   const history = useHistory();
   const params = useParams();
   const [isError, setIsError] = useState(false);
   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(5);
   const [sort, setSort] = useState({ field: null, order: -1 });
   const [search, setSearch] = useState('');
   const debouncedSearchValue = useDebounce(search, { wait: 500 });

   const [urlState, setUrlState] = useUrlState({});

   const alert = useAlert();
   const getTypes = useQuery('expenses/types', () => get('/expenses/types', 1, 999));
   const queryClient = useQueryClient();

   const isView = useMemo(() => urlState?.type === 'view', [urlState.type]);
   const isAdd = useMemo(() => params?.id === 'add', [params.id]);

   const query = useQuery(
      ['expenses', params.id, page, limit, sort.field, sort.order, debouncedSearchValue],
      () => get(`/expenses/id/${params.id}`, page, limit, sort.field, sort.order, debouncedSearchValue),
      {
         enabled: !isAdd,
         onError: (err) => {
            setIsError(true);
            alert.setErrorAlert({
               message: 'Invalid URL!',
               err: { message: ['The page will redirect to manage expenses.'] },
               callback: () => history.push('/expenses'),
               duration: 3000,
            });
         },
      }
   );

   const postMutation = useMutation((payload) => post('/expenses', payload), {
      onSuccess: () => {
         history.push('/expenses');
      },
      onError: (err) => {
         alert.setErrorAlert({ message: 'Unable to add product', err });
      },
   });
   const postTypeMutation = useMutation((payload) => post('/expenses/types', payload), {
      onSuccess: async () => {
         await queryClient.invalidateQueries('expenses/types');
      },
   });

   const mutation = useMemo(() => postMutation, [postMutation]);

   if (!isView && !isAdd) {
      history.push('/expenses');
   }

   const formik = useFormik({
      initialValues: {
         title: '',
         amount: '',
         type: '',
         comments: '',
      },
      validateOnChange: false,
      validateOnBlur: false,
      onSubmit: (values) => {
         mutation.mutate(values);
      },
   });

   const handleCreateType = async (title) => {
      postTypeMutation.mutate({ title });
      // history.push({ pathname: '/types', search: `?action=add&title=${title}&redirect=/products/add` });
   };
   return (
      <>
         <div className="row p-0 m-0">
            <div className="col-10">
               <PageTItle activeMenu="View" motherMenu="Products" />
            </div>
            <div className="col-1">
               <Button
                  icon={AiFillCaretLeft}
                  variant="warning light"
                  onClick={() => history.goBack()}
                  loading={mutation.isLoading}
               >
                  Back
               </Button>
            </div>
         </div>
         {alert.getAlert()}
         <Card>
            <When condition={getTypes.isLoading || postTypeMutation.isLoading || query.isLoading}>
               <SpinnerOverlay />
            </When>
            <If condition={isAdd}>
               <Then>
                  <form onSubmit={formik.handleSubmit}>
                     <Card.Header>
                        <Card.Title>Add New Expense</Card.Title>
                     </Card.Header>
                     <Card.Body>
                        <div className="row">
                           <div className="form-group col-xl-6">
                              <label className="col-form-label">Title</label>
                              <input
                                 className="form-control"
                                 onChange={formik.handleChange}
                                 type="text"
                                 name="title"
                                 disabled={isError}
                                 value={formik.values.title}
                              />
                           </div>
                        </div>
                        <div className="row">
                           <div className="form-group col-xl-6">
                              <label className="col-form-label">Amount</label>
                              <input
                                 className="form-control"
                                 onChange={formik.handleChange}
                                 type="text"
                                 name="amount"
                                 disabled={isError}
                                 value={formik.values.amount}
                              />
                           </div>
                        </div>
                        <div className="row">
                           <div className="form-group col-xl-6">
                              <label className="col-form-label">Comments</label>
                              <input
                                 className="form-control"
                                 onChange={formik.handleChange}
                                 type="text"
                                 name="comments"
                                 disabled={isError}
                                 value={formik.values.comments}
                              />
                           </div>
                        </div>
                        <div className="row">
                           <div className="form-group col-xl-6">
                              <label className="col-form-label">Type</label>
                              {isAdd && (
                                 <CreatableSelect
                                    isClearable
                                    onChange={(e) => formik.setFieldValue('type', e?._id)}
                                    options={
                                       getTypes.data?.length > 0 &&
                                       getTypes.data.map((e) => ({ ...e, label: e.title, value: e.title }))
                                    }
                                    onCreateOption={handleCreateType}
                                 />
                              )}
                           </div>
                        </div>
                     </Card.Body>
                     <Card.Footer>
                        <div className="row">
                           <div className="col-xl-12 tw-justify-center">
                              <ButtonGroup>
                                 {/* <Button
                                    icon={AiFillCaretLeft}
                                    variant="warning light"
                                    onClick={() => history.replace('/products')}
                                    loading={mutation.isLoading}
                                 >
                                    Back
                                 </Button> */}
                                 <Button
                                    icon={AiFillSave}
                                    variant="primary"
                                    type="submit"
                                    loading={mutation.isLoading}
                                    disabled={isError}
                                 >
                                    Save
                                 </Button>
                              </ButtonGroup>
                           </div>
                        </div>
                     </Card.Footer>
                  </form>
               </Then>
               <Else>
                  <Card.Header>
                     <Card.Title>View product</Card.Title>
                  </Card.Header>
                  <Card.Body>
                     <div className="row">
                        <div className="form-group col-xl-6">
                           <label className="col-form-label">Title</label>
                           <h4>{query.data?.title ?? 'N/A'}</h4>
                        </div>
                     </div>
                     <div className="row">
                        <div className="form-group col-xl-6">
                           <label className="col-form-label">Amount</label>
                           <h4>{query.data?.amount ?? 'N/A'}</h4>
                        </div>
                     </div>
                     <div className="row">
                        <div className="form-group col-xl-6">
                           <label className="col-form-label">Type</label>
                           <h4>{query.data?.type?.title ?? 'N/A'}</h4>
                        </div>
                     </div>
                     <div className="row">
                        <div className="form-group col-xl-6">
                           <label className="col-form-label">Comments</label>
                           <h4>{query.data?.comments ?? 'N/A'}</h4>
                        </div>
                     </div>
                  </Card.Body>
               </Else>
            </If>
         </Card>
      </>
   );
};

export default ExpenseActions;
