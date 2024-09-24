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
  appId: 'A8CT7VGXWC',
  apiKey: '31df2c77aeccb16428b670bff02cb14c',
});

// Sets a consistent user token if not already set
if (!insightsClient('getUserToken')) {
  const userToken = `user-${Math.random().toString(36).substr(2, 9)}`;
  insightsClient('setUserToken', userToken);
}

class ResultPage {
  constructor() {
    this._registerClient();
    this._registerWidgets();
    this._startSearch();
  }

  _registerClient() {
    this._searchClient = algoliasearch(
      'A8CT7VGXWC',
      '31df2c77aeccb16428b670bff02cb14c'
    );

    this._searchInstance = instantsearch({
      indexName: 'products',
      searchClient: this._searchClient,
      insights: true,
    });
  }

  _registerWidgets() {
    this._searchInstance.addWidgets([
      configure({
        clickAnalytics: true,
      }),
      searchBox({
        container: '#searchbox',
        placeholder: 'Search for products...',
      }),
      hits({
        container: '#hits',
        templates: {
          item: resultHit,
        },
        transformItems(items) {
          return items.map((item) => ({
            ...item,
            url: `/products/${item.objectID}`,
          }));
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

    // Add event listener for "Add to Cart" button clicks
    document.addEventListener('click', this._handleAddToCart);
  }

  _startSearch() {
    this._searchInstance.start();
  }

  _handleAddToCart = (event) => {
    if (event.target.classList.contains('result-hit__cart')) {
      const objectID = event.target.getAttribute('data-object-id');
      const queryID = event.target.getAttribute('data-query-id');

      if (!objectID || !queryID) {
        console.error('Missing objectID or queryID');
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
        eventName: 'Product Added to Cart',
        index: 'products',
        objectIDs: [objectID],
        queryID,
        userToken,
      });
    }
  };
}

export default ResultPage;
