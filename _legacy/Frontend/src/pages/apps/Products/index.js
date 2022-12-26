import React, { Component } from 'react';
import {
    Card,
    CardBody,
    Row,
    Col,
    Input,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    Form,
    FormGroup,
    Label,
    ModalFooter,
    ButtonGroup,
} from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import PageTitle from '../../../components/PageTitle';
import calImg from '../../../assets/images/cal-products.png';
import './products.css';
import AutoSuggest from '../../../components/AutoSuggest';

import Toast from 'light-toast';

import { fetchProducts, postProduct, modifyProduct, deleteProduct } from '../../../helpers/api/index';
import * as FeatherIcon from 'react-feather';

// Table Sort Data
const defaultSorted = [
    {
        dataField: 'name',
        order: 'asc',
    },
];

// Table Pagination Widget
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

export default class Products extends Component {
    // Stock Header
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
                                        <h5 className="mt-0 mb-1 font-weight-bold">Manage Products</h5>
                                        <p className="text-muted mb-2">
                                            Keep track of your products easily by creating new categories and update
                                            existing categories by adding or removing products.
                                        </p>

                                        <Button color="primary" className="mt-2 mr-2" onClick={this.toggleModal}>
                                            <i className="uil-plus-circle"></i> Add Product
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

    // Table Component
    DataTable = (category, index) => {
        const { SearchBar } = Search;
        const { ExportCSVButton } = CSVExport;
        // category = category.charAt(0).toUpperCase() + category.slice(1);

        return (
            <Col sm="12" xl="6">
                <Card>
                    <CardBody>
                        <h4 className="header-title mt-0 mb-1">Manage {category}</h4>
                        <p className="sub-header">
                            Edit Or Delete <span className="font-weight-bold">{category}</span> Products
                        </p>

                        <ToolkitProvider
                            bootstrap4
                            keyField="id"
                            data={this.state.data[index].products}
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
                                        id={'table' + index}
                                        bordered={false}
                                        defaultSorted={defaultSorted}
                                        pagination={paginationFactory({
                                            sizePerPage: 5,
                                            sizePerPageRenderer: sizePerPageRenderer,
                                            sizePerPageList: [
                                                { text: '5', value: 5 },
                                                { text: '10', value: 10 },
                                                { text: '25', value: 25 },
                                                {
                                                    text: 'All',
                                                    value: this.state.data[index].products.length,
                                                },
                                            ],
                                        })}
                                        wrapperClasses="table-responsive"
                                    />
                                </React.Fragment>
                            )}
                        </ToolkitProvider>
                    </CardBody>
                </Card>
            </Col>
        );
    };

    state = {
        // Table Render Data
        columns: [
            {
                dataField: 'name',
                text: 'Name',
                sort: true,
            },
            {
                dataField: 'price',
                text: 'Price',
                sort: true,
            },
            {
                text: 'Edit/Delete',
                exportCSV: false,
                isDummyField: true,
                headerAlign: 'right',
                align: 'right',
                formatter: (cell, row, rowIndex) => {
                    const { category, name, price, _id } = row;
                    return (
                        <ButtonGroup>
                            <Button
                                color="warning"
                                onClick={async () => {
                                    // console.log(`Category: ${category}\nName: ${name}\nPrice: ${price}`);
                                    this.setState(() => ({
                                        editId: _id,
                                        editProduct: name,
                                        editPrice: price,
                                        editCategory: category,
                                    }));
                                    this.toggleModalEdit();
                                }}
                                size="sm"
                                className="wdith-xs">
                                <FeatherIcon.Edit style={{ fontSize: '0.25rem' }} />
                            </Button>
                            <Button
                                color="danger"
                                onClick={async () => {
                                    // console.log(`Category: ${category}\nName: ${name}\nPrice: ${price}`);
                                    Toast.loading('Please Wait', () => {});
                                    const request = await deleteProduct(_id);
                                    if (request === 'error') {
                                        Toast.fail("Couldn't Delete Product", 400, () => {});
                                    } else {
                                        this.updateProducts();
                                        Toast.success('Product Has Been Deleted', 400, () => {});
                                    }
                                    Toast.hide();
                                }}
                                size="sm"
                                className="wdith-xs"
                                style={{ marginRight: '-12px' }}>
                                <FeatherIcon.Delete />
                            </Button>
                        </ButtonGroup>
                    );
                },
            },
        ],

        data: [],

        modal: false,
        modalEdit: false,

        categoryName: '',
        categoryNameError: '',
        catSuggestions: [],
        activeCatSuggestion: 0,

        productName: '',
        productNameError: '',

        price: 75,
        priceError: '',

        editProduct: '',
        editProductError: '',

        editPrice: 0,
        editPriceError: '',
        editId: 0,
        editCategory: '',

        showSuggestions: true,
    };

    toggleModal = () => {
        this.setState((prevState) => ({
            modal: !prevState.modal,
        }));
        this.setState(() => ({
            catSuggestions: [],
            categoryName: '',
            categoryNameError: '',
            productName: '',
            productNameError: '',
            price: 75,
            priceError: '',
            showSuggestions: true,
        }));
    };

    toggleModalEdit = () => {
        this.setState((prevState) => ({
            modalEdit: !prevState.modalEdit,
        }));
    };

    renderTables = () => {
        return this.state.data.map((category, index) => {
            return this.DataTable(category._id, index);
        });
    };

    calculateCategories = () => {
        return this.state.data.map((category) => category._id);
    };

    sortActiveClass = (index) => {
        return index === this.state.activeCatSuggestion ? 'dropdownItem dropdownItemActive' : 'dropdownItem';
    };

    findIndexByValue = (name, array, field) => {
        let names = [];
        array.map((item) => {
            let name = item;
            if (field === 'name') name = item.name;
            if (field === 'category') name = item.category;
            names.push(name);
        });
        return names.findIndex((n) => {
            return n === name;
        });
    };

    validateAndFilter = (name, error, value, mode) => {
        switch (name) {
            case mode:
                error = value.length > 3 ? '' : 'minimum 3 characters required';
                break;
        }

        if (mode === 'category') {
            return;
        } else if (mode === 'product') {
            this.setState(() => ({ productNameError: error }));
        }
    };

    updateValidationAndSuggestion = (name, value, formName) => {
        let calculatedError = this.state.categoryNameError;
        let calculatedSuggestions = [];

        switch (name) {
            case formName:
                // calculatedError = value.length < 3 ? props.errorMessage : '';
                if (value.length < 3) calculatedError = 'minimum 3 characters required';
                else calculatedError = '';
                break;
        }

        if (value.length > 0) {
            const regex = new RegExp(`^${value}`, 'i');
            calculatedSuggestions = this.calculateCategories()
                .map((item) => item)
                .sort()
                .filter((v) => regex.test(v));
        }

        this.setState(() => ({ categoryNameError: calculatedError }));
        this.setState(() => ({ catSuggestions: calculatedSuggestions }));
    };

    renderSuggestions = () => {
        if (this.state.catSuggestions.length === 0) return;

        return (
            <div className="dropdownMenu">
                {this.state.catSuggestions.map((item, index) => (
                    <a
                        style={{ cursor: 'pointer' }}
                        className={this.sortActiveClass(index)}
                        onClick={this.handleClick}
                        index={index}
                        name={item}
                        key={index}>
                        {item}
                    </a>
                ))}
            </div>
        );
    };

    handleChange = (event) => {
        const { name } = event.target;
        let value = event.target.value.replace(/[^\w\s]/gi, '');
        this.updateValidationAndSuggestion(name, value, 'category');
        this.setState(() => ({ categoryName: value, showSuggestions: true }));
        this.renderSuggestions();
    };

    handleClick = (event) => {
        const { name } = event.target;
        const currentActiveSuggestion = this.findIndexByValue(name, this.state.catSuggestions);
        console.log(currentActiveSuggestion);

        // this.executeAction(_id, name, this.state.productQuantity);
        this.setState(() => ({
            showSuggestions: false,
            categoryName: name,
            categoryNameError: '',
            activeCatSuggestion: currentActiveSuggestion,
        }));
    };

    handleBlur = (event) => {
        window.setTimeout(() => {
            this.setState(() => ({ showSuggestions: false }));
        }, 250);
    };

    handleProductChange = (event) => {
        const { name, value } = event.target;
        let error = this.state.productNameError;

        switch (name) {
            case 'product':
                error = value.length < 3 ? 'minimum 3 characters required' : '';
                break;
        }

        this.setState({ productNameError: error });
        this.setState({ productName: value });
    };

    handlePriceChange = (event) => {
        const { name, value } = event.target;
        let error = this.state.priceError;

        switch (name) {
            case 'price':
                error = value < 1 ? 'cannot be zero' : '';
                break;
        }

        this.setState({ priceError: error });
        this.setState({ price: value });
    };

    handleKeyEvents = (event) => {
        if (event.target.name === 'price') if (event.keyCode === 13) this.handleSubmit();

        if (event.keyCode === 38) {
            if (this.state.catSuggestions.length > 0) {
                if (this.state.activeCatSuggestion === 0)
                    this.setState(() => ({
                        activeCatSuggestion: this.state.catSuggestions.length - 1,
                    }));
                else
                    this.setState(() => ({
                        activeCatSuggestion: this.state.activeCatSuggestion - 1,
                    }));
                // console.log(this.state.catSuggestions[this.state.activeCatSuggestion]);
                this.setState(() => ({
                    categoryName: this.state.catSuggestions[this.state.activeCatSuggestion],
                }));
                this.setState(() => ({ categoryNameError: '' }));
            }
            console.log('pressed up key');
        }
        if (event.keyCode === 40) {
            if (this.state.catSuggestions.length > 0) {
                if (this.state.activeCatSuggestion === this.state.catSuggestions.length - 1)
                    this.setState(() => ({
                        activeCatSuggestion: 0,
                    }));
                else
                    this.setState(() => ({
                        activeCatSuggestion: this.state.activeCatSuggestion + 1,
                    }));

                // console.log(this.state.catSuggestions[this.state.activeCatSuggestion]);
                this.setState(() => ({
                    categoryName: this.state.catSuggestions[this.state.activeCatSuggestion],
                }));
                this.setState(() => ({ categoryNameError: '' }));
            }
            console.log('pressed down key');
        }
        this.renderSuggestions();
    };

    // handleCategoryChange = (event) => {
    //     // this.setState({ categoryName: event.target.value });
    //     // if (event.target.value.contains(' '))

    //     let value = event.target.value.replace(/[^\w\s]/gi, '');
    //     this.setState({ categoryName: event.target.value.replace(/[^\w\s]/gi, '') });
    //     // const { name, value } = event.target;
    //     let categories = this.calculateCategories();
    //     let error = this.state.categoryNameError;
    //     let calculatedSuggestions = [];

    //     this.validateAndFilter(event.target.name, error, value, 'category');

    //     if (value.length > 0) {
    //         const regex = new RegExp(`^${event.target.value}`, 'i');
    //         calculatedSuggestions = categories
    //             .map((item) => item)
    //             .sort()
    //             .filter((v) => regex.test(v));
    //     }

    //     console.log(calculatedSuggestions);
    //     this.setState(() => ({
    //         catSuggestions: calculatedSuggestions,
    //     }));
    //     this.setState(() => ({ categoryNameError: error }));

    //     this.renderSuggestions();
    // };

    // handleCategoryFocus = (event) => {
    //     const { name, value } = document.getElementById('input_form');
    //     let error = this.state.categoryNameError;
    //     let categories = this.calculateCategories();

    //     this.validateAndFilter(name, error, value, categories, 'category');

    //     this.renderSuggestions();
    // };

    renderFormValidation = (error) => {
        return error === '' ? '' : 'is-invalid';
    };

    renderButtonValidation = () => {
        // return error1 === '' && error2 === '' && error3 === '' ? false : true;
        const { categoryNameError, productNameError, priceError } = this.state;

        if (categoryNameError === '' && productNameError === '' && priceError === 0) return false;
        console.log(categoryNameError, productNameError, priceError);

        return true;
    };

    handleEditProductChange = (event) => {
        this.setState({ productName: event.target.value });
        let error = this.state.productNameError;

        this.validateAndFilter(event.target.name, error, event.target.value, [], 'product');
    };

    // handlePriceChange = (event) => {
    //     const { name, value } = event.target;
    //     this.setState({ price: value });
    //     let priceError = this.state.priceError;
    //     switch (name) {
    //         case 'price':
    //             priceError = value > 0 ? '' : 'must be greated than 0';
    //             // if (value > 0) priceError = '';
    //             // else priceError = 'must be greater than 0';
    //             break;
    //     }
    //     this.setState(() => ({ priceError }));

    //     console.log(this.state.productNameError, this.state.categoryNameError, this.state.priceError);
    // };

    // handleEnterKeyEvent = (event) => {
    //     // console.log('pressing enter');
    //     if (event.keyCode === 13) {
    //         if (this.renderButtonValidation() === true) {
    //             console.log('enter pressed sccessfulky');
    //             this.handleSubmit();
    //         } else {
    //             console.log('submit button is locked');
    //         }
    //         console.log(this.renderButtonValidation());
    //     }
    // };

    updateProducts = async () => {
        Toast.loading('Please Wait1', () => {});
	console.log('calling api');
        const fetchedData = await fetchProducts();
	console.log (`api called: ${fetchedData}`);
        if (fetchedData === 'error') {
            Toast.fail('Failed To Update Products', 400, () => {
                Toast.hide();
            });
        } else {
            this.setState(() => ({ data: fetchedData }));
        }
        Toast.hide();
    };

    handleSubmit = async () => {
        Toast.loading('Please Wait', () => {});
        const { categoryName, productName, price } = this.state;
        const request = await postProduct(categoryName, productName, price);
	
        if (request === 'error') {
            Toast.fail('Unable To Add Product', 400, () => {
                this.setState(() => ({
                    catSuggestions: [],
                    categoryName: '',
                    categoryNameError: '',
                    productName: '',
                    productNameError: '',
                    price: 75,
                    priceError: '',
                }));
            });
        } else {
            await this.updateProducts();
            Toast.success('Product Has Been Added', 400, () => {
                Toast.hide();
            });
        }
    };

    handleEditProduct = (event) => {
        const { name, value } = event.target;
        let error = this.state.editProductError;
        this.setState(() => ({ editProduct: value.replace(/[^\w\s]/gi, '') }));
        switch (name) {
            case 'edit_product':
                error = value.length > 3 ? '' : 'minimum 3 characters required';
                break;
        }
        this.setState(() => ({ editProductError: error }));
        console.log(this.state.editProductError, this.state.editPriceError);
        console.log(this.renderButtonValidation(this.state.editProductError, this.state.editPriceError, ''));
    };

    handleEditPrice = (event) => {
        const { name, value } = event.target;
        let error = this.state.editPriceError;
        this.setState(() => ({ editPrice: value }));
        switch (name) {
            case 'edit_price':
                error = value > 0 ? '' : 'must be greater than 0';
                break;
        }
        this.setState(() => ({ ediPriceError: error }));
        console.log(this.state.editProductError, this.state.editPriceError);
        console.log(this.renderButtonValidation(this.state.editProductError, this.state.editPriceError, ''));
    };

    handleEdit = async (event) => {
        const { editId, editCategory, editProduct, editPrice } = this.state;
        Toast.loading('Please Wait', 400, () => {});
        const request = await modifyProduct(editId, editProduct, editPrice, editCategory);
        if (request === 'error') {
            Toast.fail('Unable To Edit Product', 250, () => {
                Toast.hide();
            });
        } else {
            await this.updateProducts();
            this.toggleModalEdit();
        }
    };

    async componentDidMount() {
        // const categories = this.calculateCategories();
        // console.log(categories);
        this.updateProducts();
    }

    render() {
        return (
            <React.Fragment>
                {<this.PageJumboBar />}
                <Row className="page-title">
                    <Col lg={12}>
                        <PageTitle
                            breadCrumbItems={[{ label: 'Products', path: '/pages/products' }]}
                            title={'Products'}
                        />
                    </Col>
                </Row>
                <Row>{this.renderTables()}</Row>

                <Modal isOpen={this.state.modal} toggle={this.toggleModal} size="xl">
                    <ModalHeader>Add Products</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col className="mx-auto">
                                <Card>
                                    <CardBody>
                                        <Form autoComplete="off" inline>
                                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                                <Label className="mr-sm-2">Category</Label>
                                                <Input
                                                    autoComplete="off"
                                                    // onFocus={this.handleCategoryFocus}
                                                    onKeyDown={this.handleKeyEvents}
                                                    className={this.renderFormValidation(this.state.categoryNameError)}
                                                    required
                                                    onChange={this.handleChange}
                                                    onBlur={this.handleBlur}
                                                    type="text"
                                                    value={this.state.categoryName}
                                                    name="category"
                                                    placeholder="Type Category"
                                                    id="input_form"
                                                    autoFocus
                                                />
                                            </FormGroup>

                                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                                <Label className="mr-sm-2">Name</Label>
                                                <Input
                                                    autoComplete="off"
                                                    className={this.renderFormValidation(this.state.productNameError)}
                                                    required
                                                    onChange={this.handleProductChange}
                                                    type="text"
                                                    value={this.state.productName}
                                                    name="product"
                                                    placeholder="Enter Product Name"
                                                    autoFocus
                                                />
                                            </FormGroup>

                                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                                <Label className="mr-sm-2">Price</Label>
                                                <Input
                                                    autoComplete="off"
                                                    className={this.renderFormValidation(this.state.priceError)}
                                                    required
                                                    onKeyDown={this.handleKeyEvents}
                                                    onChange={this.handlePriceChange}
                                                    type="number"
                                                    value={this.state.price}
                                                    name="price"
                                                    placeholder="Product Price"
                                                    autoFocus
                                                />
                                            </FormGroup>

                                            {/* <FormGroup className="mb-2 mr-sm-2 mb-sm-0 ml-2">
                                                <Label className="mr-sm-2">Qt.</Label>
                                                <Input
                                                    className={this.renderProductQuantityValidation()}
                                                    defaultValue={this.getDefaultProductQuantity()}
                                                    type="number"
                                                    onChange={this.handleQuantityChange}
                                                    onKeyDown={(event) => {
                                                        if (event.keyCode === 13) this.handleEnter();
                                                    }}
                                                    name="productQuantity"
                                                />
                                            </FormGroup> */}
                                        </Form>
                                        {this.state.showSuggestions && this.renderSuggestions()}
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="primary"
                            className="ml-1"
                            // disabled={this.renderButtonValidation(
                            //     this.state.categoryNameError,
                            //     this.state.productNameError,
                            //     this.state.priceError
                            // )}
                            onClick={this.handleSubmit}>
                            Add Product
                        </Button>
                        <Button color="secondary" className="ml-1" onClick={this.toggleModal}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.modalEdit} toggle={this.toggleModalEdit} size="lg">
                    <ModalHeader toggle={this.toggleModalEdit}>Edit Product</ModalHeader>
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
                                                    className={this.renderFormValidation(this.state.editProductError)}
                                                    required
                                                    onChange={this.handleEditProduct}
                                                    type="text"
                                                    value={this.state.editProduct}
                                                    name="edit_product"
                                                    placeholder="Update Product"
                                                    autoFocus
                                                />
                                            </FormGroup>

                                            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                                                <Label className="mr-sm-2">Price</Label>
                                                <Input
                                                    autoComplete="off"
                                                    className={this.renderFormValidation(this.state.editPriceError)}
                                                    required
                                                    onKeyDown={(event) => {
                                                        if (event.keyCode === 13) console.log('enter pressed');
                                                    }}
                                                    onChange={this.handleEditPrice}
                                                    type="number"
                                                    value={this.state.editPrice}
                                                    name="edit_price"
                                                    placeholder="Update Price"
                                                    autoFocus
                                                />
                                            </FormGroup>
                                        </Form>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" className="ml-1" onClick={this.handleEdit}>
                            Edit Product
                        </Button>
                        <Button color="secondary" className="ml-1" onClick={this.toggleModalEdit}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
            </React.Fragment>
        );
    }
}
