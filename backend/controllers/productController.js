const Product = require("../models/Product");
// Create Product
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sortBy, search } = req.query;

    // Build query
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Build sort
    let sortObj = {};
    if (sortBy === 'price-low') {
      sortObj.price = 1;
    } else if (sortBy === 'price-high') {
      sortObj.price = -1;
    } else if (sortBy === 'name') {
      sortObj.name = 1;
    } else if (sortBy === 'rating') {
      sortObj.rating = -1;
    } else {
      sortObj.createdAt = -1; // Default
    }

    const products = await Product.find(query).sort(sortObj);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get products by IDs for comparison
const getProductsByIds = async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({ message: 'Product IDs are required' });
    }

    // Convert to array if single ID is passed
    const idArray = Array.isArray(ids) ? ids : ids.split(',');

    // Validate IDs format (basic ObjectId validation)
    const invalidIds = idArray.filter(id => !/^[0-9a-fA-F]{24}$/.test(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ message: `Invalid product IDs: ${invalidIds.join(', ')}` });
    }

    // Fetch products by IDs
    const products = await Product.find({
      _id: { $in: idArray }
    }).select('_id name price rating numreviews stock brand description image category');

    // Return only products that were found
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by IDs:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.name = req.body.name || product.name;
  product.price = req.body.price || product.price;
  product.description = req.body.description || product.description;
  product.stock = req.body.stock || product.stock;

  const updated = await product.save();
  res.json(updated);
};

const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  await product.deleteOne();
  res.json({ message: "Product deleted" });
};
module.exports = { createProduct, getProducts, getProductsByIds, updateProduct, deleteProduct };
