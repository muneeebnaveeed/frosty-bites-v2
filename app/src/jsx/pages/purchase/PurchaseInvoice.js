import React from 'react';
import ReactToPrint from 'react-to-print';
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import logo from '../../../images/diamond-tiles-logo.png';

class PurchaseInvoice extends React.Component {
   render() {
      console.log(this.props.invoiceNum);
      return (
         <div className="m-5">
            <div className="row mb-2">
               <h1 className="col-10 text-center flex-2">INVOICE</h1>
               <img className="col-2 flex-1 text-end" src={logo} style={{ maxWidth: '100px', maxHeight: '100px' }} />
            </div>
            <div className="d-flex flex-row justify-content-between mt-5">
               <div className="">
                  <h4 className="p-0 m-0">Diamond Tiles</h4>
                  <p className="p-0 m-0">Main G. T Road, Bahtr Mor, Wah Cantt</p>
                  <p className="p-0 m-0">0305-2200111</p>
                  <p className="p-0 m-0">diamondtiles.pk</p>
               </div>
               {/* <div className="">
                  <h4 className="p-0 m-0">INVOICE TO</h4>
                  <p className="p-0 m-0">John Doe</p>
                  <p className="p-0 m-0">0305-2200111</p>
               </div> */}
               <div className="">
                  <h4 className="p-0 m-0 text-right">Invoice Number</h4>
                  <p className="p-0 m-0 text-right">{`#${this.props.invoiceNum}`}</p>
                  <h4 className="p-0 m-0 text-right">Date of Invoice</h4>
                  <p className="p-0 m-0 text-right">{dayjs().format('DD-MMM-YYYY')}</p>
               </div>
            </div>
            <table className="table table-striped my-4">
               <thead>
                  <tr>
                     <th className="center">#</th>
                     <th className="center">Model Number</th>
                     <th className="center">Quantity</th>
                     <th className="center">Unit</th>
                     <th className="center">Subtotal</th>
                  </tr>
               </thead>
               <tbody>
                  {this.props?.data().data &&
                     this.props?.data().data.map((e) => (
                        <tr key={e?._id}>
                           <td>{e?.serialNumber ?? ''}</td>
                           <td>{e?.modelNumber ?? ''}</td>
                           <td>{e?.quantity ?? ''}</td>
                           <td>{e?.unit ?? ''}</td>
                           <td>{e?.price ?? ''}</td>
                        </tr>
                     ))}
               </tbody>
            </table>
            <div className="row mt-5">
               <div className="col-lg-4 col-sm-5"> </div>
               <div className="col-lg-4 col-sm-5 ml-auto">
                  <table className="table table-clear">
                     <tbody>
                        <tr>
                           <td className="left">
                              <strong>Total</strong>
                           </td>
                           <td className="right">
                              <strong>{this.props?.data().total}</strong>
                           </td>
                        </tr>
                        <tr>
                           <td className="left">
                              <strong>Paid</strong>
                           </td>
                           <td className="right">
                              <strong>{this.props?.data().paid}</strong>
                           </td>
                        </tr>
                        <tr>
                           <td className="left">
                              <strong>Remaining</strong>
                           </td>
                           <td className="right">
                              <strong>{this.props?.data().remaining}</strong>
                           </td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>
            <div className="d-flex flex-row justify-content-center mt-5">
               <p>POS Developed by Hassan Naveed - 03415615279</p>
            </div>
         </div>
      );
   }
}

class Print extends React.Component {
   render() {
      return (
         <div>
            <ReactToPrint
               // eslint-disable-next-line react/button-has-type
               trigger={() => <button ref={this.props.printRef} className="tw-invisible" />}
               content={() => this.componentRef}
            />
            <PurchaseInvoice
               ref={(el) => (this.componentRef = el)}
               data={this.props.data}
               invoiceNum={this.props.invoiceNum}
            />
         </div>
      );
   }
}

const mapStateToProps = ({ auth }) => ({
   user: auth.user,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Print);
