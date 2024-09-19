// src/templates/result-hit.js

const resultHit = (hit) => `
  <div class="result-hit">
    <div class="result-hit__image-container">
      <img class="result-hit__image" src="${hit.image}" alt="${hit.name}" />
    </div>
    <div class="result-hit__details">
      <h3 class="result-hit__name">${hit._highlightResult.name.value}</h3>
      <p class="result-hit__price">$${hit.price}</p>
    </div>
    <div class="result-hit__controls">
      <button
        class="result-hit__cart"
        data-object-id="${hit.objectID}"
        data-query-id="${hit.__queryID}"
      >
        Add To Cart
      </button>
    </div>
  </div>
`;

export default resultHit;
