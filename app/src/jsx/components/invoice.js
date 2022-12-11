/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/button-has-type */
import React from 'react';
import ReactToPrint from 'react-to-print';
import dayjs from 'dayjs';
import { connect } from 'react-redux';
import { When } from 'react-if';

class ComponentToPrint extends React.Component {
   getTotal = () => {
      const { data, type } = this.props;
      if (!data || !data.length) return '';

      const subtotals = [];

      data.forEach((d) => {
         const price = d[type === 'purchase' ? 'sourcePrice' : 'retailPrice'];
         subtotals.push(parseInt(price) * d.quantity);
      });

      const total = subtotals.reduce((a, b) => a + b);

      return total;
   };

   capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();

   render() {
      return (
         <>
            <div className="row">
               <div className="col-lg-12">
                  <div className="card mt-3">
                     <h2 className="px-2 text-center">Invoice</h2>
                     <h3 className="px-2 ml-5">Diamond Tiles</h3>
                     <h4 className="px-2 ml-5">{`Invoice# ${
                        this.props.data.length > 0 ? this.props.data[0]?.inventory.substring(-4, 4) ?? '' : ''
                     }`}</h4>
                     <h4 className="px-2 ml-5">{`${this.capitalizeFirstLetter(this.props.user?.role)}: ${
                        this.props.user?.name
                     }`}</h4>
                     <When condition={this.props.data.length > 0 ? !!this.props.data[0]?.customerName : false}>
                        <h4 className="px-2 ml-5">{`Customer: ${
                           this.props.data.length > 0 ? this.props.data[0]?.customerName ?? '' : ''
                        }`}</h4>
                     </When>
                     <h4 className="px-2 ml-5">{`Date: ${dayjs().format('DD-MMM-YYYY')}`}</h4>
                     <div className="card-body">
                        <div className="table-responsive">
                           <table className="table table-striped">
                              <thead>
                                 <tr>
                                    <th className="center">#</th>
                                    {this.props.columns &&
                                       Object.values(this.props.columns).map((i) => <th className="center">{i}</th>)}
                                 </tr>
                              </thead>
                              <tbody>
                                 {this.props.data &&
                                    this.props.data.map((i, idx) => (
                                       <tr>
                                          <td className="center">{idx + 1}</td>
                                          {Object.keys(this.props.columns).map((y) => (
                                             <td className="center">{i[y]}</td>
                                          ))}
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
                                             <strong>{this.getTotal()}</strong>
                                          </td>
                                       </tr>
                                    </tbody>
                                 </table>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </>
      );
   }
}

class Example extends React.Component {
   render() {
      return (
         <div>
            <ReactToPrint
               trigger={() => <button ref={this.props.printRef} className="tw-invisible" />}
               content={() => this.componentRef}
            />
            <ComponentToPrint
               type={this.props.type}
               ref={(el) => (this.componentRef = el)}
               data={this.props.data}
               columns={this.props.columns}
               user={this.props.user}
            />
         </div>
      );
   }
}

const mapStateToProps = ({ auth }) => ({
   user: auth.user,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Example);
