const mongoose = require('mongoose');
const Order = require('./backend/models/Order');
const Product = require('./backend/models/Product');

mongoose.connect('mongodb://127.0.0.1:27017/ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    const topProductsAgg = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: '$products' },
        {
            $group: {
                _id: '$products.product',
                totalSales: { $sum: '$products.quantity' }
            }
        },
        { $sort: { totalSales: -1 } },
        { $limit: 6 }
    ]);
    console.log("AGG OUTPUT:", topProductsAgg);

    let topProducts = [];
    if (topProductsAgg.length > 0) {
        const prodIds = topProductsAgg.map(x => x._id);
        const prods = await Product.find({ _id: { $in: prodIds } });
        console.log("PRODS:", prods.map(p => p.name));
        topProducts = topProductsAgg.map(agg => {
            const p = prods.find(pr => pr._id.toString() === agg._id.toString());
            return {
                _id: agg._id,
                name: p ? p.name : 'Unknown Product',
                price: p ? p.price : 0,
                totalSales: agg.totalSales
            };
        }).filter(x => x.name !== 'Unknown Product');
    }
    console.log("FINAL OUTPUT:", topProducts);
    process.exit(0);
});
