import React, { Component } from 'react';

class Invoice extends Component {
    constructor(props) {
        super(props);
    }
    state = { stock: [] };
    render() {
        return (
            <body
                style={{ fontFamily: 'serif', backgroundColor: 'white', color: 'black', display: this.props.display }}>
                <div>
                    <h1 style={{ fontFamily: 'serif', textAlign: 'left', padding: '10px 120px', color: 'black' }}>
                        Frosty Bites
                    </h1>
                    <h4 style={{ fontFamily: 'serif', textAlign: 'left', padding: '0 0 10px 50px', color: 'black' }}>
                        Basement, Square 5 Plaza, Gate 1, <br /> B-17, Multi Gardens, Islamabad
                    </h4>
                    <hr />
                    <h1 style={{ fontFamily: 'serif', textAlign: 'left', padding: '10px 90px', color: 'black' }}>
                        ** RECEIPT **
                    </h1>
                    <h4
                        style={{
                            fontFamily: 'serif',
                            textAlign: 'left',
                            padding: '10px 40px',
                            color: 'black',
                            display: 'inline-block',
                        }}>
                        ID: 48ef
                    </h4>
                    <h4
                        style={{
                            fontFamily: 'serif',
                            textAlign: 'left',
                            padding: '10px 40px',
                            color: 'black',
                            display: 'inline-block',
                        }}>
                        15/06/2020 - 5:00 AM
                    </h4>
                    <table
                        style={{
                            fontFamily: 'serif',
                            textAlign: 'left',
                            margin: '10px 40px',
                            color: 'black',
                            width: '36%',
                        }}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <tr>
                                    <th>Strawberry</th>
                                    <th>200</th>
                                    <th>2</th>
                                    <th>400</th>
                                </tr>
                            </tr>
                        </tbody>
                    </table>
                    <hr />
                    <h5 style={{ marginLeft: '22%', fontFamily: 'serif', color: 'black' }}>Subtotal: 200</h5>
                    <h5 style={{ marginLeft: '22%', fontFamily: 'serif', color: 'black' }}>Discount: 20</h5>
                    <h5 style={{ marginLeft: '22%', fontFamily: 'serif', color: 'black' }}>Total: 180</h5>
                    <hr />
                    <h2
                        style={{
                            fontFamily: 'serif',
                            textAlign: 'left',
                            padding: '10px 40px',
                            color: 'black',
                        }}>
                        Thank You For Shopping <br /> <span style={{ paddingLeft: '110px' }}>From Us</span>
                    </h2>
                    <h5
                        style={{
                            fontFamily: 'serif',
                            textAlign: 'left',
                            padding: '10px 40px',
                            color: 'black',
                        }}>
                        Developed By Hassan Naveed Contact <br /> At 03415615279
                    </h5>
                </div>
            </body>
        );
    }
}

export default Invoice;
