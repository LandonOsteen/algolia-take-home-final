import dotenv from 'dotenv';
dotenv.config();
import algoliasearch from 'algoliasearch';
import products from '../data/products.json' assert { type: 'json' };

// Connect and authenticate with your Algolia app
const client = algoliasearch('A8CT7VGXWC', '31df2c77aeccb16428b670bff02cb14c');

// Initialize the index
const index = client.initIndex('cameras'); // Update 'cameras' to your actual index name

// Function to reduce the price of cameras by 20% and round down to the nearest integer
const updatePrices = (objects) => {
  return objects
    .filter(
      (product) =>
        Array.isArray(product.categories) &&
        product.categories.includes('Cameras & Camcorders')
    )
    .map((product) => ({
      ...product,
      price: Math.floor(product.price * 0.8),
    }));
};

// Fetch and index objects in Algolia
const processRecords = async () => {
  try {
    const updatedProducts = updatePrices(products);
    const response = await index.saveObjects(updatedProducts, {
      autoGenerateObjectIDIfNotExist: true,
    });
    console.log('Successfully indexed objects!', response);
  } catch (error) {
    console.error('Error indexing objects:', error);
  }
};

processRecords();
