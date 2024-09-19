// src/pages/result-page.js

import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import {
  searchBox,
  hits,
  pagination,
  refinementList,
  configure,
} from 'instantsearch.js/es/widgets';
import { createInsightsMiddleware } from 'instantsearch.js/es/middlewares';
import resultHit from '../templates/result-hit';
import insightsClient from 'search-insights';

// Initialize Algolia Insights
insightsClient('init', {
  appId: 'A8CT7VGXWC', // Replace with your Algolia App ID
  apiKey: '31df2c77aeccb16428b670bff02cb14c', // Replace with your Search API Key
});

// Sets a consistent user token if not already set
if (!insightsClient('getUserToken')) {
  const userToken = `user-${Math.random().toString(36).substr(2, 9)}`;
  insightsClient('setUserToken', userToken);
}

/**
 * @class ResultPage
 * @description Instant Search class to display content on the main page
 */
class ResultPage {
  constructor() {
    this.eventListenersAdded = false;
    this._registerClient();
    this._registerInsights();
    this._registerWidgets();
    this._startSearch();
  }

  /**
   * @private
   * Initializes Algolia search client
   * @return {void}
   */
  _registerClient() {
    this._searchClient = algoliasearch(
      'A8CT7VGXWC', // Replace with your Algolia App ID
      '31df2c77aeccb16428b670bff02cb14c' // Replace with your Search API Key
    );

    this._searchInstance = instantsearch({
      indexName: 'cameras', // Replace with your index name
      searchClient: this._searchClient,
    });
  }

  /**
   * @private
   * Registers Algolia Insights middleware
   * @return {void}
   */
  _registerInsights() {
    const insightsMiddleware = createInsightsMiddleware({
      insightsClient,
    });
    this._searchInstance.use(insightsMiddleware);
  }

  /**
   * @private
   * Adds widgets to the Algolia InstantSearch instance
   * @return {void}
   */
  _registerWidgets() {
    this._searchInstance.addWidgets([
      configure({
        clickAnalytics: true,
      }),
      searchBox({
        container: '#searchbox',
        placeholder: 'Search for products...',
        inputAttributes: {
          id: 'search-input',
          name: 'search',
        },
      }),
      hits({
        container: '#hits',
        templates: {
          item: resultHit,
        },
        transformItems(items) {
          return items.map((item) => ({
            ...item,
            url: `/products/${item.objectID}`, // Update to match your product URLs
          }));
        },
        afterRender: () => {
          // Prevent adding multiple event listeners
          if (this.eventListenersAdded) return;
          this.eventListenersAdded = true;

          // Handle "Add to Cart" button clicks
          document.querySelectorAll('.result-hit__cart').forEach((button) => {
            button.addEventListener('click', (event) => {
              const objectID =
                event.currentTarget.getAttribute('data-object-id');
              const queryID = event.currentTarget.getAttribute('data-query-id');

              window.handleAddToCart(objectID, queryID);
            });
          });
        },
      }),
      pagination({
        container: '#pagination',
      }),
      refinementList({
        container: '#brand-facet',
        attribute: 'brand',
      }),
      refinementList({
        container: '#categories-facet',
        attribute: 'categories',
      }),
    ]);
  }

  /**
   * @private
   * Starts InstantSearch after widgets are registered
   * @return {void}
   */
  _startSearch() {
    this._searchInstance.start();
  }
}

// Global function to handle 'Add to Cart' events
window.handleAddToCart = (objectID, queryID) => {
  // Ensure objectID and queryID are strings
  objectID = objectID.toString();
  queryID = queryID.toString();

  if (!queryID || queryID.length !== 32) {
    console.error('Invalid queryID:', queryID);
    return;
  }

  const userToken = insightsClient('getUserToken');

  if (!userToken) {
    console.error('User token is not set.');
    return;
  }

  console.log('Add to Cart clicked:', objectID, queryID);

  // Send conversion event to Algolia Insights
  insightsClient('convertedObjectIDsAfterSearch', {
    eventType: 'conversion',
    eventName: 'Product Added to Cart',
    index: 'cameras', // Update this if your index name is different
    objectIDs: [objectID],
    queryID,
    userToken,
  });
};

export default ResultPage;
