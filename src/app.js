import ResultPage from './components/results-page';

class SpencerAndWilliamsSearch {
  constructor() {
    this._initSearch();
  }

  _initSearch() {
    this.resultPage = new ResultPage();
  }
}

const app = new SpencerAndWilliamsSearch();
