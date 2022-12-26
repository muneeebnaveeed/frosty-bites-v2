// @flow
import React from 'react';
import { Row, Col } from 'reactstrap';

import StatisticsChartWidget from '../../components/StatisticsChartWidget';

const Statistics = (props) => {
    return (
        <React.Fragment>
            <Row>
                <Col md={6} xl={6}>
                    <StatisticsChartWidget
                        description="Daily Sales"
                        title={`Rs. ${props.revenue}`}
                        // data={[25, 66, 41, 85, 63, 25, 44, 12, 36, 9, 54, 50, 50, 50, 50]}
                        // trend={{
                        //     textClass: 'text-success',
                        //     icon: 'uil uil-arrow-up',
                        //     value: '10.21%',
                        // }}
                    ></StatisticsChartWidget>
                </Col>

                {/* <Col md={6} xl={4}>
                    <StatisticsChartWidget description="Products Sold" title={props.products}></StatisticsChartWidget>
                </Col> */}

                <Col md={6} xl={6}>
                    <StatisticsChartWidget
                        description="Daily Orders"
                        title={props.orders}
                        colors={['#43d39e']}
                        // data={[25, 66, 41, 85, 63, 25, 44, 12, 36, 9, 54]}
                        // trend={{
                        //     textClass: 'text-success',
                        //     icon: 'uil uil-arrow-up',
                        //     value: '25.16%',
                        // }}
                    ></StatisticsChartWidget>
                </Col>
            </Row>
        </React.Fragment>
    );
};

export default Statistics;
