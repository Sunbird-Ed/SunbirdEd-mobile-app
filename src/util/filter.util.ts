import {AppGlobalService} from '../service/app-global.service';
import {SearchType} from "sunbird-sdk";

const applyProfileFilter = (profileFilter: Array<any>, assembleFilter: Array<any>,
                            categoryKey: string, appGlobalService: AppGlobalService) => {
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

  const unique_array = [];

  for (let i = 0; i < assembleFilter.length; i++) {
    if (unique_array.indexOf(assembleFilter[i]) === -1 && assembleFilter[i].length > 0) {
      unique_array.push(assembleFilter[i]);
    }
  }

  return unique_array;
};

export const updateFilterInSearchQuery = (queryParams, appliedFilter, profile, mode, isFilterApplied,
                                          appGlobalService: AppGlobalService) => {

  const queryObj = JSON.parse(queryParams);
  const filter = queryObj.request.filters;
  queryObj.request['searchType'] = isFilterApplied ? SearchType.FILTER : SearchType.SEARCH;

  if (mode === 'soft') {
    queryObj.request.mode = mode;
  }

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

  if (profile && !isFilterApplied) {
    if (profile.board && profile.board.length) {
      filter['board'] = applyProfileFilter(profile.board, filter['board'], 'board', appGlobalService);
    }

    if (profile.medium && profile.medium.length) {
      filter['medium'] = applyProfileFilter(profile.medium, filter['medium'], 'medium', appGlobalService);
    }

    if (profile.grade && profile.grade.length) {
      filter['gradeLevel'] = applyProfileFilter(profile.grade, filter['gradeLevel'], 'gradeLevel', appGlobalService);
    }

    if (profile.subject && profile.subject.length) {
      filter['subject'] = applyProfileFilter(profile.subject, filter['subject'], 'subject', appGlobalService);
    }
  }

  queryObj.request.filters = filter;
  queryParams = queryObj;


  return queryParams;
};
