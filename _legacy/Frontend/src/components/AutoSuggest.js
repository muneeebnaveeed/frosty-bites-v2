import React, { Component } from 'react';
import { Form, FormGroup, Input, Button } from 'reactstrap';
import Toast from 'light-toast';
import { fetchProducts, fetchProductById } from '../helpers/api/index';

import './autosuggest.css';

// { formName, placeholder, type, label, data, formId, errorMessage }
export default class AutoSuggest extends Component {
    /////////////////////////////////////////////////////////////////////////// CLASS METHODS

    constructor(props) {
        super(props);
        this.state = {
            /////////////////////////////////////////////////////////////////// AUTOSUGGEST PROPERTIES
            products: [],
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
        };
    }

    async componentDidMount() {
        await this.updateProducts();
    }

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
            } else {
                calculatedProducts.push({
                    name,
                    quantity: this.state.quantity,
                    category,
                    price,
                    _id,
                });
            }

            this.props.passData(calculatedProducts);
            this.setState({ addedProducts: calculatedProducts });

            Toast.hide();
        }
        this.setState({ product: '', quantity: 1, suggestions: [], currentId: null });
    };

    /////////////////////////////////////////////////////////////////////////// UTILITY METHODS

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

    async getProductById() {}

    /////////////////////////////////////////////////////////////////////////// PRODUCTS AUTOSUGGEST METHODS

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

    /////////////////////////////////////////////////////////////////////////// QUANTITY INPUT METHODS

    handleQuantityChange = (event) => {
        const { value } = event.target;
        if (value < 1) this.setState({ quantity: 1 });
        else this.setState({ quantity: value });
    };

    render() {
        const { product, quantity, isShowSuggestions } = this.state;
        return (
            <React.Fragment>
                <Form inline style={{ display: 'flex', position: 'relative' }}>
                    <FormGroup style={{ flexGrow: '100' }}>
                        <Input
                            autoComplete="off"
                            value={product}
                            onChange={this.handleProductChange}
                            onFocus={() => this.setState({ product: '', selectedId: null, suggestions: [] })}
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
                    <Button type="button" color="primary" style={{ float: 'right' }} onClick={this.handleSubmit}>
                        Add Product
                    </Button>
                </Form>
                {isShowSuggestions > 0 && this.renderSuggestions()}
            </React.Fragment>
        );
    }
}
