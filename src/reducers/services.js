// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import {
  SERVICES_DATA_FETCH,
  SERVICES_DATA_RECEIVED,
  SERVICES_DATA_ERROR,
  AUTH_AUTHENTICATED,
} from '../actions/types';

const defaultState = {
  loading: false,
  error: null,
  Services: [],
};

function domainsReducer(state = defaultState, action) {
  switch (action.type) {
    case SERVICES_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case SERVICES_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Services: action.data.services,
      };
    
    case SERVICES_DATA_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error,
      };

    case AUTH_AUTHENTICATED:
      return action.authenticated ? {
        ...state,
      } : {
        ...defaultState,
      };

    default:
      return state;
  }
}

export default domainsReducer;
