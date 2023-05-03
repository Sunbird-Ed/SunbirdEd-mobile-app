import { SearchType } from '@project-sunbird/sunbird-sdk';
import { AppGlobalService } from '../services/app-global-service.service';

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

export const applyProfileFilter = (appGlobalService: AppGlobalService,
                                   profileFilter: Array<any>,
                                   assembleFilter: Array<any>,
                                   categoryKey?: string) => {
  if (categoryKey) {
    const nameArray = [];
    profileFilter.forEach(filterCode => {
      let nameForCode = appGlobalService.getNameForCodeInFramework(categoryKey, filterCode);

      if (!nameForCode) {
        nameForCode = filterCode;
      }

      nameArray.push(nameForCode);
    });

    profileFilter = nameArray;
  }


  if (!assembleFilter) {
    assembleFilter = [];
  }
  assembleFilter = assembleFilter.concat(profileFilter);

  const uniqueArray = [];

  for (let i = 0; i < assembleFilter.length; i++) {
    if (uniqueArray.indexOf(assembleFilter[i]) === -1 && assembleFilter[i].length > 0) {
      uniqueArray.push(assembleFilter[i]);
    }
  }

  assembleFilter = uniqueArray;

  if (assembleFilter.length === 0) {
    return undefined;
  }

  return assembleFilter;
};
