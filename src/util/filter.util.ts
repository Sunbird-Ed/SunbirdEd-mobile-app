import { SearchType } from 'sunbird-sdk';

export const updateFilterInSearchQuery = (queryParams, appliedFilter, isFilterApplied) => {

  const queryObj = JSON.parse(queryParams);
  const filter = queryObj.request.filters;
  queryObj.request['searchType'] = isFilterApplied ? SearchType.FILTER : SearchType.SEARCH;

  if (appliedFilter) {
    const appliedFilterKey = Object.keys(appliedFilter);

    appliedFilterKey.forEach(key => {
      if (appliedFilter[key].length > 0) {
        if (!filter[key]) {
          filter[key] = [];
        }

        appliedFilter[key].forEach(filterValue => {
          if (!filter[key].includes(filterValue)) {
            filter[key].push(filterValue);
          }
        });
      }
    });
  }

  queryObj.request.filters = filter;
  queryParams = queryObj;

  return queryParams;
};
