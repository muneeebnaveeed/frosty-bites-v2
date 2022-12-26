import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';

import { getLoggedInUser } from '../../helpers/authUtils';
import Loader from '../../components/Loader';

import Statistics from './Statistics';
import SalesChart from './SalesChart';
import Orders from './Orders';
import { fetchOrders } from '../../helpers/api/index';

class Dashboard extends Component {
    constructor(props) {
        super(props);

        var oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 15);

        this.state = {
            user: getLoggedInUser(),
            filterDate: [oneWeekAgo, new Date()],
            isLoading: true,
            revenue: 0,
            productsSold: 0,
            ordersMade: 0,
            orders: [
                {
                    _id: 123456,
                    date: new Date(),
                    subtotal: 99,
                    discount: 99,
                    products: [],
                },
            ],
        };
    }

    getDateTime(today) {
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().length < 2 ? `0${today.getMonth() + 1}` : today.getMonth() + 1;
        const day = today.getDate().toString().length < 2 ? `0${today.getDate()}` : today.getDate();
        const date = `${year}-${month}-${day}`;

        //const date = today.split('T')[0];
        // let time = [];
        // time.push(today.split('T')[1].split(':')[0]);

        return date;
    }

    async componentDidMount() {
        const orders = await fetchOrders();

        let currentDate = this.getDateTime(new Date());

        let filter = orders
            .map(({ date, _id, subtotal, discount, products }) => ({
                date,
                _id,
                subtotal,
                discount,
                products,
            }))
            .filter(({ date }) => date.split('T')[0] === currentDate)
            .reverse();

        let prices = [];
        filter.map((order) => order.products.map((product) => prices.push(product.price)));
        let revenue = prices.reduce((a, b) => a + b, 0);

        let productsSold = 0;
        filter.map((order) => order.products.map((product) => productsSold++));

        let ordersMade = 0;
        filter.map((order) => ordersMade++);

        this.setState({ isLoading: false, revenue, productsSold, ordersMade, orders: filter }, () =>
            console.log(this.state.orders)
        );
    }

    render() {
        return (
            <React.Fragment>
                <div className="">
                    {this.props.loading && this.state.isLoading && <Loader />}

                    <Row className="page-title align-items-center">
                        <Col sm={4} xl={6}>
                            <h4 className="mb-1 mt-0">Dashboard</h4>
                        </Col>
                    </Row>

                    <Statistics
                        revenue={this.state.revenue}
                        products={this.state.productsSold}
                        orders={this.state.ordersMade}></Statistics>

                    <Row>
                        {/* <Col xl={5}>
                            <SalesChart />
                        </Col> */}
                        <Col xl={7}>{this.state.orders.length ? <Orders orders={this.state.orders} /> : ''}</Col>
                    </Row>
                </div>
            </React.Fragment>
        );
    }
}

export default Dashboard;
