import React, { useState } from 'react';
import { Dropdown, Table, ButtonGroup, Card } from 'react-bootstrap';
import Button from 'jsx/components/Button';

import { AiFillEye, AiOutlinePlus } from 'react-icons/ai';
import { connect } from 'formik';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import DatePicker from 'react-datepicker';

import '../../../css/react-datepicker.css';
import { useHistory } from 'react-router-dom';
import { getV2, useQuery } from 'jsx/helpers';
import { currencyFormatter } from 'jsx/helpers/misc';
import ManagePurchase from '../purchase/ManagePurchase';
import ManageSales from '../sale/MangeSales';
import SaleGrid from '../sale/sale-grid';

const today = new Date();

const Dashboard = () => {
   const [startDate, setStartDate] = useState(new Date());
   const [endDate, setEndDate] = useState(new Date());
   const history = useHistory();

   const user = useSelector((s) => s.auth.user);

   // const purchase = useQuery(['dashboard-purchases', startDate, endDate], () =>
   //    getV2('/dashboard/purchases', { startDate, endDate })
   // );
   const sale = useQuery(['dashboard-sales', startDate, endDate], () =>
      getV2('/dashboard/sales', { startDate, endDate })
   );
   // const revenue = useQuery(['dashboard-revenue', startDate, endDate], () =>
   //    getV2('/dashboard/revenue', { startDate, endDate })
   // );
   // const expense = useQuery(['dashboard-expenses', startDate, endDate], () =>
   //    getV2('/dashboard/expenses', { startDate, endDate })
   // );
   // const profit = useQuery(['dashboard-profit', startDate, endDate], () =>
   //    getV2('/dashboard/profit', { startDate, endDate })
   // );

   return (
      <>
         <div className="row tw-mb-[30px]">
            <div className="col-xl-12 tw-flex tw-justify-end tw-items-center">
               <DatePicker selected={startDate} onChange={(d) => setStartDate(d)} dateFormat="dd MMMM yyyy" />
               <span className="mx-4">to</span>
               <DatePicker selected={endDate} onChange={(d) => setEndDate(d)} dateFormat="dd MMMM yyyy" />
            </div>
         </div>
         <div className="row">
            <div className="col-lg-4 col-md-12">
               <Card className="tw-h-[205px]">
                  <Card.Body>
                     <h3 className="tw-font-bold">
                        Hey <span className="tw-capitalize">{user.name?.toLowerCase() ?? 'Loading...'}</span>!
                     </h3>
                     <h4>{dayjs(today).format('dddd[,] DD MMMM YYYY')}</h4>
                  </Card.Body>
               </Card>
            </div>
            {/* <div className="col-lg-4 col-md-6">
               <Card className="">
                  <Card.Body>
                     <h3 className="tw-font-bold">Purchase</h3>
                     <h4>
                        {purchase.data
                           ? `${purchase.data.count} - ${new Intl.NumberFormat('en-IN', {
                                maximumSignificantDigits: 3,
                             }).format(purchase.data.sum)} PKR`
                           : '...'}
                     </h4>
                     <h6 className="tw-text-xs">Total purchases made</h6>
                     <Button
                        variant="secondary"
                        className="btn-block"
                        icon={AiOutlinePlus}
                        onClick={() => history.push('/purchase/add')}
                     >
                        New Purchase
                     </Button>
                  </Card.Body>
               </Card>
            </div> */}
            <div className="col-lg-8 col-md-12">
               <Card className="">
                  <Card.Body>
                     <h3 className="tw-font-bold">Sale</h3>
                     <h4>{sale.data ? `${sale.data.count} - ${currencyFormatter.format(sale.data.sum)}` : '...'}</h4>
                     <h6 className="tw-text-xs">Total sale made</h6>
                     <Button
                        variant="primary"
                        className="btn-block"
                        icon={AiOutlinePlus}
                        onClick={() => history.push('/sale/add')}
                     >
                        New Sale
                     </Button>
                  </Card.Body>
               </Card>
            </div>
            {/* <div className="col-lg-4 col-md-6">
               <Card className="tw-h-[205px]">
                  <Card.Body>
                     <h3 className="tw-font-bold">Revenue</h3>
                     <h4>
                        {revenue.data !== undefined && revenue.data !== null
                           ? `${new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(
                                revenue.data
                             )} PKR`
                           : '...'}
                     </h4>
                     <h6 className="tw-text-xs">Profit made from the sales</h6>
                  </Card.Body>
               </Card>
            </div> */}
            {/* <div className="col-lg-4 col-md-6">
               <Card className="tw-h-[205px]">
                  <Card.Body>
                     <h3 className="tw-font-bold">Expenses</h3>
                     <h4>
                        {expense.data !== undefined && expense.data !== null
                           ? `${new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(
                                expense.data
                             )} PKR`
                           : '...'}
                     </h4>

                     <h6 className="tw-text-xs">Salaries and expenses</h6>
                     <Button
                        variant="secondary"
                        className="btn-block"
                        icon={AiOutlinePlus}
                        onClick={() => history.push('/expenses/add')}
                     >
                        New Expense
                     </Button>
                  </Card.Body>
               </Card>
            </div> */}
            {/* <div className="col-lg-4 col-md-6">
               <Card className="tw-h-[205px]">
                  <Card.Body>
                     <h3 className="tw-font-bold">Profit</h3>
                     <h4>
                        {profit.data !== undefined && profit.data !== null
                           ? `${new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(
                                profit.data.profit
                             )} PKR`
                           : '...'}
                     </h4>
                     <h6 className="tw-text-xs">Take home money</h6>
                  </Card.Body>
               </Card>
            </div> */}
            <div className="col-12">
               <SaleGrid startDate={startDate} endDate={endDate} />
            </div>
            {/* <div className="col-12">
               <ManagePurchase />
            </div> */}
         </div>
      </>
   );
};

export default Dashboard;
