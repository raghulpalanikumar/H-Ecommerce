// Test canceling an order
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testCancelOrder() {
    try {
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: 'john@example.com',
            password: 'password123'
        });
        const token = loginResponse.data.data.token;

        // Get an order
        const ordersResponse = await axios.get(`${API_BASE}/orders`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const orders = ordersResponse.data.data.orders;

        if (orders.length === 0) {
            console.log('No orders to cancel');
            return;
        }

        const orderToCancel = orders[0].id;
        console.log(`Cancelling order ${orderToCancel}`);

        const cancelResponse = await axios.put(`${API_BASE}/orders/${orderToCancel}/status`,
            { status: 'cancelled' },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Result:', cancelResponse.data);
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

testCancelOrder();
