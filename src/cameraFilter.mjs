import dotenv from 'dotenv';
dotenv.config();
import algoliasearch from 'algoliasearch';
import products from '../data/products.json' assert { type: 'json' };

// Connect and authenticate with Algolia app
const client = algoliasearch('A8CT7VGXWC', '0de76aca15493b47f2bf45bd3fa8c75a');

// Initialize the index
const index = client.initIndex('products');

// Function to reduce the price of cameras by 20% and round down to the nearest integer
const updatePrices = (objects) => {
  return objects.map((product) => {
    if (
      Array.isArray(product.categories) &&
      product.categories.includes('Cameras & Camcorders')
    ) {
      return {
        ...product,
        price: Math.floor(product.price * 0.8),
      };
    }
    return product;
  });
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
