import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import produce from 'immer';
import Button from 'jsx/components/Button';
import Pagination from 'jsx/components/Pagination';
import SpinnerOverlay from 'jsx/components/SpinnerOverlay';
import { del, get, useAlert, useMutation, useQuery } from 'jsx/helpers';
import { userRoles } from 'jsx/helpers/enums';
import getQuantity from 'jsx/helpers/getQuantity';
import PageTItle from 'jsx/layouts/PageTitle';
import _, { isArray } from 'lodash';
import React, { useEffect, useState } from 'react';
import { ButtonGroup, Card, Col, OverlayTrigger, Popover, Row, Table } from 'react-bootstrap';
import { AiFillDelete, AiFillEdit, AiFillEye, AiFillPlusCircle, AiOutlineQuestionCircle } from 'react-icons/ai';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { Else, If, Then, When } from 'react-if';
import { useQueryClient } from 'react-query';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import swal from 'sweetalert';
import getSortingIcon from 'jsx/helpers/getSortingIcon';
import ReactDatePicker from 'react-datepicker';
import ClearPurchase from './ClearPurchase';
import RefundPurchase from './RefundPurchase';
import ManagePurchase from './ManagePurchase';

dayjs.extend(relativeTime);

const Purchase = () => {
   const history = useHistory();

   const handleOnClickAdd = () => {
      history.push('/purchase/add');
   };

   const [startDate, setStartDate] = useState(new Date());
   const [endDate, setEndDate] = useState(new Date());

   return (
      <>
         <PageTItle activeMenu="purchase" motherMenu="Diamond Tiles" />
         <div className="row tw-mb-8">
            <div className="col-xl-6">
               <Button variant="primary" icon={AiFillPlusCircle} onClick={handleOnClickAdd}>
                  Add New Purchase
               </Button>
            </div>
            <div className="col-xl-6 tw-flex tw-justify-end tw-items-center">
               <ReactDatePicker selected={startDate} onChange={(d) => setStartDate(d)} dateFormat="dd MMMM yyyy" />
               <span className="mx-4">to</span>
               <ReactDatePicker selected={endDate} onChange={(d) => setEndDate(d)} dateFormat="dd MMMM yyyy" />
            </div>
         </div>
         <ManagePurchase startDate={startDate} endDate={endDate} />
      </>
   );
};

const mapStateToProps = ({ auth }) => ({
   user: auth.user,
});

const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(Purchase);
