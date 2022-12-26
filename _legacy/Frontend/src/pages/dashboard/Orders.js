import React from 'react';
import { Card, CardBody, Input } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Row, Col } from 'reactstrap';
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit';

const Orders = (props) => {
    const sizePerPageRenderer = ({ options, currSizePerPage, onSizePerPageChange }) => (
        <React.Fragment>
            <label className="d-inline mr-1">Show</label>
            <Input
                type="select"
                name="select"
                id="no-entries"
                className="custom-select custom-select-sm d-inline col-1"
                defaultValue={currSizePerPage}
                onChange={(e) => onSizePerPageChange(e.target.value)}>
                {options.map((option, idx) => {
                    return <option key={idx}>{option.text}</option>;
                })}
            </Input>
            <label className="d-inline ml-1">entries</label>
        </React.Fragment>
    );

    const columns = [
        {
            isDummyField: false,
            text: '#',
            formatter: (cell, row, rowIndex) => rowIndex + 1,
            csvExport: false,
            sort: true,
        },
        {
            isDummyField: false,
            text: 'Date',
            formatter: (cell, row, rowIndex) => row.date.toString().split('T')[0], // row.date.split('T')[0],
            csvExport: false,
        },
        {
            isDummyField: false,

            formatter: (cell, row, rowIndex) =>
                row.products.map((product) => (
                    <React.Fragment>
                        {product.name}
                        <br />
                    </React.Fragment>
                )),

            csvExport: false,

            text: 'Products',
        },
        {
            dataField: 'subtotal',
            text: 'Subtotal',
        },
        {
            dataField: 'discount',
            text: 'Discount',
        },
        {
            isDummyField: false,
            formatter: (cell, row, rowIndex) => row.subtotal - row.discount,
            text: 'Total',
            csvExport: false,
        },
    ];

    const DataTable = () => {
        const { ExportCSVButton } = CSVExport;
        const { SearchBar } = Search;

        return (
            <Card>
                <CardBody>
                    <h4 className="header-title mt-0 mb-1">Recent Orders</h4>

                    <ToolkitProvider
                        bootstrap4
                        keyField="id"
                        data={props.orders}
                        columns={columns}
                        search
                        exportCSV={{ onlyExportFiltered: true, exportAll: false }}>
                        {(props) => (
                            <React.Fragment>
                                <Row>
                                    <Col>
                                        <SearchBar {...props.searchProps} />
                                    </Col>
                                    <Col className="text-right">
                                        {/* <ExportCSVButton {...props.csvProps} className="btn btn-primary">
                                            Export CSV
                                        </ExportCSVButton> */}
                                    </Col>
                                </Row>

                                <BootstrapTable
                                    {...props.baseProps}
                                    bordered={false}
                                    // defaultSorted={defaultSorted}
                                    pagination={paginationFactory({
                                        sizePerPage: 5,
                                        sizePerPageRenderer: sizePerPageRenderer,
                                        sizePerPageList: [
                                            { text: '5', value: 5 },
                                            { text: '10', value: 10 },
                                            { text: '25', value: 25 },
                                            { text: 'All', value: 100 },
                                        ],
                                    })}
                                    wrapperClasses="table-responsive"
                                />
                            </React.Fragment>
                        )}
                    </ToolkitProvider>
                </CardBody>
            </Card>
        );
    };

    if (!props.orders.length) return 'Loading';
    else
        return (
            <Card>
                <CardBody className="pb-0">
                    <DataTable />
                </CardBody>
            </Card>
        );
};

export default Orders;

// const columns = [
//     {
//         isDummyField: true,
//         text: '#',
//         formatter: (cell, row, rowIndex) => rowIndex + 1,
//     },
//     {
//         isDummyField: true,
//         text: 'Date',
//         formatter: (cell, row, rowIndex) => row.date.split('T')[0],
//     },
//     {
//         isDummyField: true,

//         formatter: (cell, row, rowIndex) =>
//             row.products.map((product) => (
//                 <React.Fragment>
//                     {product.name}
//                     <br />
//                 </React.Fragment>
//             )),

//         text: 'Products',
//     },
//     {
//         dataField: 'subtotal',
//         text: 'Subtotal',
//     },
//     {
//         dataField: 'discount',
//         text: 'Discount',
//     },
//     {
//         isDummyField: true,
//         formatter: (cell, row, rowIndex) => row.subtotal - row.discount,
//         text: 'Total',
//     },
// ];
