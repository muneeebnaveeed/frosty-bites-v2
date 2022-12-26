import React, { Component } from 'react';
import PageTitle from '../../../components/PageTitle';
import { Card, CardBody, Row, Col, Input, Button, Form, FormGroup, Label, CardTitle, Table } from 'reactstrap';
import Toast from 'light-toast';
import { fetchProducts, fetchProductById, fetchOrders, postOrder } from '../../../helpers/api/';
import './autosuggest.css';
import ReactToPrint, { PrintContextConsumer } from 'react-to-print';

class CustomInvoice extends Component {
    constructor(props) {
        super(props);
    }
    getDate(today) {
        const year = today.getFullYear();
        const monthIndex = today.getMonth().toString().length < 2 ? `0${today.getMonth()}` : today.getMonth();
        const day = today.getDate().toString().length < 2 ? `0${today.getDate()}` : today.getDate();
        const hours = today.getHours();
        let minutes = today.getMinutes();

        let amPm = null;

        if (minutes.toString().length < 2) minutes = `0${minutes}`;

        if (hours <= 11) amPm = 'AM';
        else if (hours >= 12) amPm = 'PM';

        let months = [
            'January',
            'Febuary',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];

        const month = months[parseInt(monthIndex)];

        return {
            day,
            month,
            year,
            hours,
            minutes,
            amPm,
        };
    }
    render() {
        const { day, month, year, hours, minutes, amPm } = this.getDate(new Date());

        return (
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
                    ID: {this.props.invoiceId}
                </h4>
                <h4
                    style={{
                        fontFamily: 'serif',
                        textAlign: 'left',
                        padding: '10px 10px',
                        color: 'black',
                        display: 'inline-block',
                    }}>
                    {`${day} ${month}, ${year} - ${hours}:${minutes} ${amPm}`}
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
                            <th>#</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.products.map((product, index) => (
                            <tr>
                                <td>{index + 1}</td>
                                <td>{product.name}</td>
                                <td>{product.price}</td>
                                <td>{product.quantity}</td>
                                <td>{product.price * product.quantity}</td>
                            </tr>
                        ))}
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
        );
    }
}

class Orders extends Component {
    /////////////////////////////////////////////////////////////////////////// CLASS METHODS
    constructor(props) {
        super(props);
        this.state = {
            /////////////////////////////////////////////////////////////////// ORDERS STATES
            products: [],
            showCart: true,

            /////////////////////////////////////////////////////////////////// AUTOSUGGEST PROPERTIES
            product: '',
            quantity: 1,
            errors: {
                product: '',
                quantity: '',
            },
            isShowSuggestions: false,
            suggestions: [],
            currentId: null,
            prevId: null,
            prevQuantity: null,

            /////////////////////////////////////////////////////////////////// CART TABLE PROPERTIES
            addedProducts: [],
            subtotal: 0,
            discount: 0,
            total: 0,
            receiptId: null,
        };
    }

    /////////////////////////////////////////////////////////////////////////// UTILITY METHODS

    async componentDidMount() {
        await this.updateProducts();
    }

    /////////////////////////////////////////////////////////////////////////// AUTOSUGGEST METHODS

    handleKeyEvents = (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            this.handleSubmit();
        }
    };

    handleSubmit = async (event) => {
        const { currentId, quantity, prevQuantity } = this.state;
        Toast.loading('Please Wait', () => {});
        if (event) event.preventDefault();
        this.setState({ isShowSuggestions: false });

        const response = await fetchProductById(currentId);
        if (response === 'error') {
            Toast.fail('Unable To Get Product', 400, () => {
                this.setState({ prevQuantity: 1 });
                Toast.hide();
            });
        } else {
            const { name, category, price, _id } = response;
            let calculatedProducts = this.state.addedProducts;

            let duplicateIds = calculatedProducts.map((product) => product._id).filter((id) => id === currentId);

            if (duplicateIds.length > 0) {
                let index = calculatedProducts.findIndex((product) => product._id === currentId);
                let calculatedQuantity = parseInt(calculatedProducts[index].quantity) + parseInt(quantity);
                calculatedProducts[index].quantity = calculatedQuantity;
                calculatedProducts[index].totalPrice = calculatedQuantity * calculatedProducts[index].price;
            } else {
                calculatedProducts.push({
                    name,
                    quantity: this.state.quantity,
                    category,
                    price,
                    _id,
                    totalPrice: this.state.quantity * price,
                });
            }

            let subtotal = calculatedProducts.map((product) => product.totalPrice).reduce((a, b) => a + b, 0);
            let total = null;
            if (this.state.discount !== 0) total = this.state.subtotal - (subtotal * this.state.discount) / 100;
            else total = subtotal;

            this.setState({ addedProducts: calculatedProducts, subtotal, total });

            Toast.hide();
        }
        this.setState({ product: '', quantity: 1, suggestions: [], currentId: null });
    };

    async updateProducts() {
        Toast.loading('Please Wait', () => {});
        const request = await fetchProducts();
        if (request === 'error') {
            Toast.fail('Unable To Get Products', 400, () => {
                window.location.reload();
            });
        } else {
            let products = [];
            request.map((category) => {
                category.products.map((product) => {
                    products.push({
                        category: category._id,
                        name: product.name,
                        price: product.price,
                        id: product._id,
                    });
                });
            });
            this.setState(() => ({ products }));
            Toast.hide();
        }
    }

    sortInvalidClass(error) {
        return error === '' ? '' : 'is-invalid';
    }

    handleProductChange = (event) => {
        const value = event.target.value.replace(/[^\w\s]/gi, '');
        let error = this.state.error;
        let suggestions = [];
        event.preventDefault();

        if (value.length > 2 || value.length === 0) error = '';
        else error = 'minimum three characters required';

        if (value.length > 0) {
            const regex = new RegExp(`^${value}`, 'i');

            suggestions = this.state.products
                .map(({ name, category, id }) => ({ name, category, id }))
                .sort()
                .filter(({ name }) => regex.test(name));

            if (suggestions.length > 0) this.setState({ isShowSuggestions: true });
        }

        this.setState({ product: value, error, suggestions });
    };

    renderSuggestions() {
        return (
            <ul className="dropdown dropdownMenu">
                {this.state.suggestions.map((suggestion, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            this.setState((prevState) => ({
                                isShowSuggestions: false,
                                errors: { ...prevState.errors, product: '' },
                                product: `${suggestion.name} (${suggestion.category})`,
                                currentId: suggestion.id,
                            }));
                        }}>
                        <li key={index} className="dropdownItem">
                            {suggestion.name} from {suggestion.category}
                        </li>
                    </div>
                ))}
            </ul>
        );
    }

    handleQuantityChange = (event) => {
        const { value } = event.target;
        if (value < 1) this.setState({ quantity: 1 });
        else this.setState({ quantity: value });
    };

    /////////////////////////////////////////////////////////////////////////// CART METHODS

    renderProducts = () => {
        const { addedProducts } = this.state;
        if (addedProducts.length) {
            return (
                <React.Fragment>
                    {addedProducts.map((product, index) => (
                        <tr key={index}>
                            <td>{product.name}</td>
                            <td>{product.price}</td>
                            <td>{product.quantity}</td>
                            {/* <td>{Math.imul(product.quantity, product.price)}</td> */}
                            <td>{product.totalPrice}</td>
                            <td>
                                <Button
                                    color="danger"
                                    size="xs"
                                    onClick={() => {
                                        let updatedProducts = this.state.addedProducts.filter(
                                            (product) => product._id !== this.state.addedProducts[index]._id
                                        );
                                        let subtotal = this.state.subtotal - this.state.addedProducts[index].price;
                                        let total = subtotal - this.state.subtotal * (this.state.discount / 100);
                                        this.setState({ addedProducts: updatedProducts, subtotal, total });
                                    }}>
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td></td>
                        <td></td>
                        <th>Subtotal:</th>
                        <td>{this.state.subtotal}</td>
                    </tr>
                    <tr>
                        <td></td>
                        <td></td>
                        <th>Discount:</th>
                        <td>{`${this.state.discount}%`}</td>
                    </tr>
                    <tr>
                        <td></td>
                        <td></td>
                        <th>Total:</th>
                        <td>{this.state.total}</td>
                    </tr>
                </React.Fragment>
            );
        } else
            return (
                <tr>
                    <td className="mt-8">Cart is empty</td>
                </tr>
            );
    };

    /////////////////////////////////////////////////////////////////////////// ACTION METHODS

    //********************************************* DISCOUNT METHODS

    handleDiscountChange = (event) => {
        const { value } = event.target;
        let calculatedValue = value;
        if (value > 100) calculatedValue = 100;
        else if (value < 0 || value === null) calculatedValue = 0;

        let total = this.state.subtotal - this.state.subtotal * (value / 100);
        this.setState({ discount: calculatedValue, total });
    };

    render() {
        const { products, product, quantity, isShowSuggestions } = this.state;
        return (
            <React.Fragment>
                <Row className="page-title">
                    <Col lg={12}>
                        <PageTitle breadCrumbItems={[{ label: 'Orders', path: '/pages/orders' }]} title={'Orders'} />
                    </Col>
                </Row>
                <Row>
                    <Col xl="4" lg="6">
                        <Card style={{ minHeight: '40vh' }}>
                            <CardBody>
                                <CardTitle>Search Products</CardTitle>

                                <Form inline style={{ display: 'flex', position: 'relative' }}>
                                    <FormGroup style={{ flexGrow: '100' }}>
                                        <Input
                                            autoComplete="off"
                                            value={product}
                                            onChange={this.handleProductChange}
                                            onFocus={() =>
                                                this.setState({ product: '', selectedId: null, suggestions: [] })
                                            }
                                            onKeyDown={this.handleKeyEvents}
                                            required
                                            type="text"
                                            name="product"
                                            placeholder="Search Product"
                                            style={{ width: '100%' }}
                                        />
                                    </FormGroup>
                                    <FormGroup style={{ flexGrow: '100' }}>
                                        <Input
                                            autoComplete="off"
                                            value={quantity}
                                            onChange={this.handleQuantityChange}
                                            onKeyDown={this.handleKeyEvents}
                                            placeholder="Qt."
                                            required
                                            type="number"
                                            name="quantity"
                                            style={{ width: '100%' }}
                                        />
                                    </FormGroup>
                                    <Button
                                        type="button"
                                        color="primary"
                                        style={{ float: 'right' }}
                                        onClick={this.handleSubmit}>
                                        Add Product
                                    </Button>
                                </Form>
                                {isShowSuggestions > 0 && this.renderSuggestions()}
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl="4" lg="6">
                        <Card style={{ minHeight: '70vh' }}>
                            <CardBody>
                                <CardTitle>Active Cart</CardTitle>

                                <Table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Price</th>
                                            <th>Qt.</th>
                                            <th>Total</th>
                                            <th>Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>{this.renderProducts()}</tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl="4" lg="6" style={{ minHeight: '100%' }}>
                        <Row style={{ height: '50%' }}>
                            <Card style={{ width: '100%', minHeight: '50%' }}>
                                <CardBody>
                                    <FormGroup
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginTop: '6.5vw',
                                        }}>
                                        <Label className="mr-sm-2">Discount: </Label>
                                        <Input
                                            autoComplete="off"
                                            value={this.state.discount}
                                            onChange={this.handleDiscountChange}
                                            // onKeyDown={this.handleKeyEvents}
                                            onBlur={(event) => {
                                                if (event.target.value === '') {
                                                    let total = this.state.subtotal;
                                                    this.setState({ discount: 0, total });
                                                }
                                            }}
                                            required
                                            type="number"
                                            name="discountt"
                                            style={{ width: '20%' }}
                                        />
                                    </FormGroup>
                                </CardBody>
                            </Card>
                        </Row>
                        <Row style={{ height: '50%' }}>
                            <Card style={{ width: '100%', minHeight: '50%' }}>
                                <CardBody>
                                    <FormGroup
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginTop: '6.5vw',
                                        }}>
                                        {/* <Button
                                            color="primary"
                                            onClick={async () => {
                                                const { subtotal, discount, addedProducts } = this.state;
                                                if (addedProducts.length) {
                                                    Toast.loading('Please Wait');

                                                    const request = await postOrder(subtotal, discount, addedProducts);
                                                    if (request === 'error') {
                                                        Toast.fail('Unable To Register Product', 400, () =>
                                                            Toast.hide()
                                                        );
                                                    } else {
                                                        const receiptId = request._id.substr(request._id.length - 5);
                                                        console.log(receiptId);

                                                        this.setState({ subtotal: 0, discount: 0, addedProducts: [] });
                                                        Toast.hide();
                                                    }
                                                } else {
                                                    Toast.fail('Please Add Products To Cart', 400, () => Toast.hide());
                                                }
                                            }}>
                                            Complete Order
                                        </Button> */}
                                        <ReactToPrint
                                            content={() => this.componentRef}
                                            onAfterPrint={() =>
                                                this.setState({
                                                    subtotal: 0,
                                                    discount: 0,
                                                    addedProducts: [],
                                                    receiptId: null,
                                                    display: 'none',
                                                })
                                            }>
                                            <PrintContextConsumer>
                                                {({ handlePrint }) => (
                                                    <Button
                                                        color="primary"
                                                        onClick={async () => {
                                                            const { subtotal, discount, addedProducts } = this.state;
                                                            if (addedProducts.length) {
                                                                Toast.loading('Please Wait');

                                                                const request = await postOrder(
                                                                    subtotal,
                                                                    discount,
                                                                    addedProducts
                                                                );
                                                                if (request === 'error') {
                                                                    Toast.fail('Unable To Register Product', 400, () =>
                                                                        Toast.hide()
                                                                    );
                                                                } else {
                                                                    const receiptId = request._id.substr(
                                                                        request._id.length - 3
                                                                    );
                                                                    this.setState({ receiptId }, () => handlePrint());
                                                                    Toast.hide();
                                                                }
                                                            } else {
                                                                Toast.fail('Please Add Products To Cart', 400, () =>
                                                                    Toast.hide()
                                                                );
                                                            }
                                                        }}>
                                                        Make Order
                                                    </Button>
                                                )}
                                            </PrintContextConsumer>
                                        </ReactToPrint>
                                    </FormGroup>
                                </CardBody>
                            </Card>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col style={{ marginLeft: '-999px' }}>
                        <CustomInvoice
                            subtotal={this.state.subtotal}
                            discount={this.state.discount}
                            products={this.state.addedProducts}
                            invoiceId={this.state.receiptId}
                            price={this.state.price}
                            ref={(el) => (this.componentRef = el)}
                        />
                    </Col>
                </Row>
            </React.Fragment>
        );
    }
}

export default Orders;
