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
import insightsClient from 'search-insights';
import resultHit from '../templates/result-hit';

const ALGOLIA_APP_ID = 'A8CT7VGXWC';
const ALGOLIA_API_KEY = '31df2c77aeccb16428b670bff02cb14c';
const ALGOLIA_INDEX_NAME = 'products';

// Initialize Algolia Insights
insightsClient('init', { appId: ALGOLIA_APP_ID, apiKey: ALGOLIA_API_KEY });

class ResultPage {
  constructor() {
    this._initSearch();
    this._registerWidgets();
    this._startSearch();
  }

  _initSearch() {
    this._searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
    this._searchInstance = instantsearch({
      indexName: ALGOLIA_INDEX_NAME,
      searchClient: this._searchClient,
      insights: true, // Enable insights
    });

    const insightsMiddleware = createInsightsMiddleware({ insightsClient });
    this._searchInstance.use(insightsMiddleware);
  }

  _registerWidgets() {
    this._searchInstance.addWidgets([
      configure({ clickAnalytics: true }),
      searchBox({ container: '#searchbox' }),
      hits({
        container: '#hits',
        templates: { item: resultHit },
        transformItems: (items) =>
          items.map((item) => ({ ...item, url: `/products/${item.objectID}` })),
      }),
      pagination({ container: '#pagination' }),
      refinementList({ container: '#brand-facet', attribute: 'brand' }),
      refinementList({
        container: '#categories-facet',
        attribute: 'categories',
      }),
    ]);

    // Add event listeners after render
    this._searchInstance.on('render', () => {
      document.querySelectorAll('.result-hit__cart').forEach((button) => {
        button.addEventListener('click', this._handleAddToCart);
      });

      // Add click event listener for product clicks
      document.querySelectorAll('.result-hit').forEach((hit) => {
        hit.addEventListener('click', this._handleProductClick);
      });
    });
  }

  _startSearch() {
    this._searchInstance.start();
  }

  _handleAddToCart = (event) => {
    const objectID = event.currentTarget.getAttribute('data-object-id');
    const queryID = event.currentTarget.getAttribute('data-query-id');

    insightsClient('convertedObjectIDsAfterSearch', {
      eventName: 'Product Added to Cart',
      index: ALGOLIA_INDEX_NAME,
      objectIDs: [objectID],
      queryID,
    });
  };

  _handleProductClick = (event) => {
    const objectID = event.currentTarget.getAttribute('data-object-id');
    const queryID = event.currentTarget.getAttribute('data-query-id');
    const position = parseInt(
      event.currentTarget.getAttribute('data-position'),
      10
    );

    insightsClient('clickedObjectIDsAfterSearch', {
      eventName: 'Product Clicked',
      index: ALGOLIA_INDEX_NAME,
      objectIDs: [objectID],
      positions: [position],
      queryID,
    });
  };
}

export default ResultPage;
