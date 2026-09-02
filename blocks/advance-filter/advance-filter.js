import { renderCategoryFilter, getCategoryFilterValues, resetCategoryFilter } from '../category-filter/category-filter.js';
import { renderFeaturesFilter, getFeaturesFilterValues, resetFeaturesFilter } from '../features-filter/features-filter.js';
import { renderLightFilter, getLightFilterValues, resetLightFilter } from '../light-filter/light-filter.js';
import { renderSizeFilter, getSizeFilterValues, resetSizeFilter } from '../size-filter/size-filter.js';
import { renderPriceFilter, getPriceFilterValues, resetPriceFilter } from '../price-filter/price-filter.js';
import { renderRatingFilter, getRatingFilterValues, resetRatingFilter } from '../rating-filter/rating-filter.js';

function loadCSS() {
  const cssPath = '/blocks/advance-filter/advance-filter.css';
  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.append(link);
  }
}

export function getFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    categories: params.get('categories') ? params.get('categories').split(',') : [],
    features: params.get('features') ? params.get('features').split(',') : [],
    lights: params.get('lights') ? params.get('lights').split(',') : [],
    sizes: params.get('sizes') ? params.get('sizes').split(',') : [],
    priceMin: params.get('priceMin') ? parseInt(params.get('priceMin'), 10) : null,
    priceMax: params.get('priceMax') ? parseInt(params.get('priceMax'), 10) : null,
    ratings: params.get('ratings') ? params.get('ratings').split(',').map(Number) : [],
  };
}

export function applyFilters(data, filters) {
  let filtered = [...data];

  // category filter
  if (filters.categories.length) {
    filtered = filtered.filter((p) => filters.categories.includes(p.categories));
  }

  // features filter (type column)
  if (filters.features.length) {
    filtered = filtered.filter((p) => filters.features.includes(p.type));
  }

  // light filter (store column)
  if (filters.lights.length) {
    filtered = filtered.filter((p) => filters.lights.includes(p.store));
  }

  // size filter
  if (filters.sizes.length) {
    filtered = filtered.filter((p) => filters.sizes.some((size) => p[size] === 'Yes'));
  }

  // price filter
  if (filters.priceMin !== null || filters.priceMax !== null) {
    filtered = filtered.filter((p) => {
      const price = parseInt(p.price.replace(/[^0-9]/g, ''), 10);
      const aboveMin = filters.priceMin === null || price >= filters.priceMin;
      const belowMax = filters.priceMax === null || price <= filters.priceMax;
      return aboveMin && belowMax;
    });
  }

  // rating filter
  if (filters.ratings.length) {
    filtered = filtered.filter((p) => {
      const rating = parseFloat(p.rating);
      return filters.ratings.some((r) => rating >= r);
    });
  }

  return filtered;
}

function updateURLAndNotify(params) {
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    if (value && (Array.isArray(value) ? value.length : value !== '')) {
      url.searchParams.set(key, Array.isArray(value) ? value.join(',') : value);
    } else {
      url.searchParams.delete(key);
    }
  });
  url.searchParams.set('page', '1');
  window.history.pushState({}, '', url);
  window.dispatchEvent(new CustomEvent('filters-changed'));
}

export default async function decorate(block) {
  loadCSS();

  block.textContent = '';

  // fetch all data to build dynamic filters
  let allData = [];
  try {
    const resp = await fetch('/data/plants-listing.json?limit=1000');
    if (resp.ok) {
      const json = await resp.json();
      allData = json.data || [];
    }
  } catch (e) {
    // fail silently
  }

  const wrapper = document.createElement('div');
  wrapper.classList.add('advance-filter-wrapper');

  // filter containers
  const categoryContainer = document.createElement('div');
  const featuresContainer = document.createElement('div');
  const lightContainer = document.createElement('div');
  const sizeContainer = document.createElement('div');
  const priceContainer = document.createElement('div');
  const ratingContainer = document.createElement('div');

  function onFilterChange() {
    updateURLAndNotify({
      categories: getCategoryFilterValues(categoryContainer),
      features: getFeaturesFilterValues(featuresContainer),
      lights: getLightFilterValues(lightContainer),
      sizes: getSizeFilterValues(sizeContainer),
      priceMin: getPriceFilterValues(priceContainer).min || '',
      priceMax: getPriceFilterValues(priceContainer).max || '',
      ratings: getRatingFilterValues(ratingContainer),
    });
  }

  // render all 6 filters dynamically from data
  renderCategoryFilter(categoryContainer, allData, onFilterChange);
  renderFeaturesFilter(featuresContainer, allData, onFilterChange);
  renderLightFilter(lightContainer, allData, onFilterChange);
  renderSizeFilter(sizeContainer, allData, onFilterChange);
  renderPriceFilter(priceContainer, allData, onFilterChange);
  renderRatingFilter(ratingContainer, onFilterChange);

  // reset button at the bottom
  const resetBtn = document.createElement('button');
  resetBtn.classList.add('advance-filter-reset');
  resetBtn.textContent = 'Reset';
  resetBtn.addEventListener('click', () => {
    resetCategoryFilter(categoryContainer);
    resetFeaturesFilter(featuresContainer);
    resetLightFilter(lightContainer);
    resetSizeFilter(sizeContainer);
    resetPriceFilter(priceContainer);
    resetRatingFilter(ratingContainer);
    updateURLAndNotify({
      categories: [],
      features: [],
      lights: [],
      sizes: [],
      priceMin: '',
      priceMax: '',
      ratings: [],
    });
  });

  // append all to wrapper
  wrapper.append(categoryContainer);
  wrapper.append(featuresContainer);
  wrapper.append(lightContainer);
  wrapper.append(sizeContainer);
  wrapper.append(priceContainer);
  wrapper.append(ratingContainer);
  wrapper.append(resetBtn);

  block.append(wrapper);
}
