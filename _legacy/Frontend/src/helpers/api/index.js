import axios from 'axios';
const stock = 'http://localhost:3000/api/stock/';
const product = 'http://localhost:3000/api/product/';
const order = 'http://localhost:3000/api/order/';

export const fetchStock = async () => {
    try {
        const response = await axios.get(stock);
        const data = response.data;
        return data;
    } catch (e) {
        return 'error';
    }
};

export const modifyStock = async (id, name, quantity) => {
    try {
        return await axios
            .put(stock + id, {
                name,
                quantity,
            })
            .then((res) => {
                return res.data;
            });
    } catch (e) {
        return 'error';
    }
};

export const postStock = async (name, quantity) => {
    try {
        return await axios.post(stock, { name, quantity }).then((res) => {
            return res.data;
        });
    } catch (e) {
        return 'error';
    }
};

export const deleteStock = async (id) => {
    try {
        return await axios.delete(stock + id).then((res) => res.data);
    } catch (e) {
        return 'error';
    }
};

export const fetchProducts = async () => {
    try {
        const response = await axios.get(product);
        return response.data;
    } catch (e) {
        return 'error';
    }
};

export const fetchProductById = async (id) => {
    try {
        const response = await axios.get(product + id);
        return response.data;
    } catch (e) {
        return 'error';
    }
};

export const modifyProduct = async (id, name, price, category) => {
    try {
        return await axios
            .put(product + id, {
                name,
                price,
                category,
            })
            .then((res) => {
                return res.data;
            });
    } catch (e) {
        return 'error';
    }
};

export const deleteProduct = async (id) => {
    try {
        return await axios.delete(product + id).then((res) => {
            return res.data;
        });
    } catch (e) {
        return 'error';
    }
};

export const postProduct = async (category, name, price) => {
    try {
        return await axios.post(product, { category, name, price }).then((res) => {
            return res.data;
        });
    } catch (e) {
        return 'error';
    }
};

export const fetchOrders = async () => {
    try {
        const response = await axios.get(order);
        return response.data;
    } catch (e) {
        return 'error';
    }
};

export const postOrder = async (subtotal, discount, products) => {
    try {
        return await axios.post(order, { subtotal, discount, products }).then((res) => {
            return res.data;
        });
    } catch (e) {
        return 'error';
    }
};
