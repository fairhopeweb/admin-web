// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import {
  TASK_DATA_RECEIVED,
  TASK_STATUS_RECEIVED,
} from '../actions/types';

const defaultState = {
  loading: false,
  error: null,
  count: 0,
  Tasks: [],
  running: false,
  queued: 0,
  workers: 0,
};

function taskqReducer(state = defaultState, action) {
  switch (action.type) {

    case TASK_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Tasks: action.data.data,
        count: action.data.count,
      };

    case TASK_STATUS_RECEIVED:
      return {
        ...state,
        ...action.data,
      };


    default:
      return state;
  }
}

export default taskqReducer;
