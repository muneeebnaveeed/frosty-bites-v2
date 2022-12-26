import React, { Component } from 'react';
import {
    Row,
    Col,
    Card,
    CardBody,
    Button,
    Input,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Form,
    FormGroup,
    Label,
    Table,
} from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import Toast from 'light-toast';

import PageTitle from '../../../components/PageTitle'; // Breadcrumbs
import calImg from '../../../assets/images/cal.png'; // Stock Illustration
import { fetchStock, modifyStock, postStock, deleteStock } from '../../../helpers/api/index'; // API Utility

import './stock.css';
import { Plus, Minus, X, Underline } from 'react-feather';

// Stock Render Data

// Stock Sort Data
const defaultSorted = [
    {
        dataField: 'quantity',
        order: 'asc',
    },
];

class Stock extends Component {
    state = {
        columns: [
            {
                dataField: 'name',
                text: 'Name',
                sort: true,
            },
            {
                dataField: 'quantity',
                text: 'Quantity',
                sort: true,
            },
            {
                isDummyField: true,
                text: 'Action',
                headerAlign: 'right',
                align: 'right',
                formatter: (cell, row, rowIndex) => {
                    const { _id, name } = row;
                    return (
                        <>
                            <Button
                                color="primary"
                                style={{ padding: '1px' }}
                                onClick={() => this.ModifyStock(_id, name, this.state.quantity, 'add')}>
                                <Plus />
                            </Button>
                            <Button
                                color="secondary"
                                style={{ padding: '1px', marginLeft: '5px' }}
                                onClick={() => this.ModifyStock(_id, name, this.state.quantity, 'consume')}>
                                <Minus />
                            </Button>
                            <Button
                                color="danger"
                                style={{ padding: '1px', marginLeft: '5px' }}
                                onClick={() => this.DeleteStock(_id)}>
                                <X />
                            </Button>
                        </>
                    );
                },
            },
        ],

        stock: [],

        modal: false,
        product: '',
        quantity: 1,
        errors: {
            product: '',
            quantity: '',
        },
    };

    // Stock Pagination Widget
    sizePerPageRenderer = ({ options, currSizePerPage, onSizePerPageChange }) => (
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

    // Utility
    UpdateStock = async (
        failureMessage,
        failCallback = () => Toast.hide(),
        onSuccess = () => {},
        onFailure = () => {}
    ) => {
        Toast.loading('Please Wait3');
        let stock = await fetchStock();
        if (stock === 'error') {
            Toast.fail(failureMessage, 400, failCallback);
            onFailure();
        } else {
            this.setState({ stock });

            console.log(stock);
            Toast.hide();
            onSuccess();
        }
        Toast.hide();
    };

    ModifyStock = async (
        id,
        name,
        quantity,
        mode,
        onSucess = async (failureMessage) => await this.UpdateStock(failureMessage, () => document.location.reload()),
        onFailure = (failureMessage) => Toast.fail(failureMessage, 400, () => Toast.hide())
    ) => {
        Toast.loading('Please Wait');
        let calculatedQuantity = quantity;
        if (mode) {
            if (mode === 'add') calculatedQuantity = 1;
            else if (mode === 'consume') calculatedQuantity = -1;
        }
        let successMessage = mode === 'add' ? 'Stock Addedd Successfully' : 'Stock Consumed Successfully';
        let failureMessage = mode === 'add' ? 'Failed To Add Stock' : 'Failed To Consume Stock';
        let request = await modifyStock(id, name, calculatedQuantity);
        if (request === 'error') onFailure(failureMessage);
        else onSucess(successMessage, failureMessage);

        Toast.hide();
    };

    DeleteStock = async (id) => {
        Toast.loading('Please Wait');
        let request = await deleteStock(id);

        const onFailure = async () => Toast.fail('Unable To Delete Stock', 400, () => Toast.hide());

        const onSuccess = async () => await this.UpdateStock('Failed To Update Stock', () => Toast.hide());

        if (request === 'error') onFailure();
        else onSuccess();

        Toast.hide();
    };

    CreateStock = async () => {
        Toast.loading('Please Wait');
        const { product, quantity } = this.state;
        const regex = new RegExp(`^${product}`, 'i');

        let stockNames = this.state.stock.map((item) => item.name);
        let duplicateNames = stockNames.filter((name) => regex.test(name));

        // if (duplicateNames.length > 0) {
        //     const findIndexByName = (name) => stockNames.findIndex((n) => n === name);

        //     let index = findIndexByName(duplicateNames[0]);
        //     const { _id, name } = this.state.stock[index];

        //     await this.ModifyStock(
        //         _id,
        //         name,
        //         quantity,
        //         '',
        //         () => this.UpdateStock('Failed To Update Stock', () => Toast.hide()),
        //         () => Toast.fail('Unable To Add Stock', 400, () => Toast.hide())
        //     );
        // } else {
        let request = await postStock(product.replace(/\s/g, ''), quantity);

        const resetValues = () => {
            this.setState({
                product: '',
                quantity: 1,
                errors: { ...this.state.errors, product: '' },
            });
        };

        const onFailure = async () => {
            resetValues();
            Toast.fail('Failed To Create New Stock', 400, () => Toast.hide());
        };

        const onSuccess = async () => {
            resetValues();
            await this.UpdateStock('Failed To Update Stock', () => Toast.hide());
        };

        if (request === 'error') onFailure();
        else onSuccess();
        // }

        Toast.hide();
    };

    // Page Components

    PageJumboBar = () => {
        return (
            <Row className="align-items-center">
                <Col>
                    <Card>
                        <CardBody>
                            <Row className="align-items-center">
                                <Col xl={2} lg={3}>
                                    <img src={calImg} className="mr-4 align-self-center img-fluid" alt="cal" />
                                </Col>
                                <Col xl={10} lg={9}>
                                    <div className="mt-4 mt-lg-0">
                                        <h5 className="mt-0 mb-1 font-weight-bold">Manage Stock</h5>
                                        <p className="text-muted mb-2">
                                            Keep track of your inventory easily by creating new stock, editing stock, or
                                            by deleting old stock.
                                        </p>

                                        <Button
                                            onClick={() => this.toggleModal()}
                                            color="primary"
                                            className="mt-2 mr-2">
                                            <i className="uil-plus-circle"></i> Create Stock
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        );
    };

    Table = () => {
        const { ExportCSVButton } = CSVExport;
        const { SearchBar } = Search;

        return (
            <Card>
                <CardBody>
                    <h4 className="header-title mt-0 mb-1">Manage Your Stock</h4>
                    <p className="sub-header">Add, delete, and edit existing stock items.</p>

                    <ToolkitProvider
                        bootstrap4
                        keyField="id"
                        data={this.state.stock}
                        columns={this.state.columns}
                        search
                        exportCSV={{ onlyExportFiltered: true, exportAll: false }}>
                        {(props) => (
                            <React.Fragment>
                                <Row>
                                    <Col>
                                        <SearchBar {...props.searchProps} />
                                    </Col>
                                    <Col className="text-right">
                                        <ExportCSVButton {...props.csvProps} className="btn btn-primary">
                                            Export CSV
                                        </ExportCSVButton>
                                    </Col>
                                </Row>

                                <BootstrapTable
                                    {...props.baseProps}
                                    bordered={false}
                                    defaultSorted={defaultSorted}
                                    pagination={paginationFactory({
                                        sizePerPage: 5,
                                        sizePerPageRenderer: this.sizePerPageRenderer,
                                        sizePerPageList: [
                                            { text: '5', value: 5 },
                                            { text: '10', value: 10 },
                                            { text: '25', value: 25 },
                                            { text: 'All', value: this.state.stock.length },
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

    // Modal

    // Modal Configs
    toggleModal = () => {
        this.setState((prevState) => ({
            modal: !prevState.modal,
        }));
    };

    validateForm = (input) => {
        if (input.length > 2) return 'is-valid';
        return '';
    };

    onChange = (state, value, mode) => {
        if (mode) if (value < 1) value = 1;
        this.setState({ [state]: value });
    };

    onKeyDown = (event) => {
        if (event.keyCode === 13) this.CreateStock();
    };

    async componentDidMount() {
        this.UpdateStock('Failed To Update Stock', () => document.location.reload());
    }

    render() {
        return (
            <React.Fragment>
                {/* Title Breadcrumbs */}
                <Row className="page-title">
                    <Col lg={12}>
                        <PageTitle breadCrumbItems={[{ label: 'Stock', path: '/pages/stock' }]} title={'Stock'} />
                    </Col>
                </Row>

                {/* Stock Header */}
                <this.PageJumboBar />

                {/* Stock Table Populated From API */}
                <Row>
                    <Col sm="12" xl="6">
                        <this.Table />
                    </Col>
                </Row>

                {/* Add Stock Modal */}
                <Modal isOpen={this.state.modal} toggle={this.toggleModal} size="xl">
                    <ModalHeader>Create New Stock</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col className="mx-auto">
                                <Card>
                                    <CardBody>
                                        <Form autoComplete="off" inline>
                                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                                <Label className="mr-sm-2">Product Name</Label>
                                                <Input
                                                    autoComplete="off"
                                                    type="text"
                                                    name="product"
                                                    placeholder="Name"
                                                    required
                                                    value={this.state.product}
                                                    className={this.validateForm(this.state.product.replace(/\s/g, ''))}
                                                    onChange={(event) => this.onChange('product', event.target.value)}
                                                    onKeyDown={this.onKeyDown}
                                                />
                                            </FormGroup>

                                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0 ml-2">
                                                <Label className="mr-sm-2">Qt.</Label>
                                                <Input
                                                    type="number"
                                                    name="quantity"
                                                    required
                                                    value={this.state.quantity}
                                                    className={this.validateForm(this.state.quantity)}
                                                    onChange={(event) =>
                                                        this.onChange('quantity', event.target.value, 'quantity')
                                                    }
                                                    onKeyDown={this.onKeyDown}
                                                />
                                            </FormGroup>
                                        </Form>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.CreateStock}>
                            Add New Stock
                        </Button>
                        <Button color="secondary" className="ml-1" onClick={this.toggleModal}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
            </React.Fragment>
        );
    }
}

export default Stock;
