import * as types from '../actions/typesDFS';
import { set } from 'dot-prop-immutable';

const initialState = {
  voters: {},
  liqs: {},
  markets: [],
  votes: {},
  smoothMode: true
};

export default function dfs(state = initialState, action) {
  switch (action.type) {
    case types.DFS_GET_VOTER_FAILURE: {
      //有数据的情况下，报错时不更新
      if (state.voters.hasOwnProperty(action.payload.account) && state.voters[account].length) {
        return state
      }
    }
    case types.DFS_GET_VOTER_SUCCESS: {
      return set(state, `voters.${action.payload.account}`, action.payload.data)
    }

    case types.DFS_GET_LIQ_FAILURE: {
      //有数据的情况下，报错时不更新
      if (state.liqs.hasOwnProperty(action.payload.account) && state.liqs[account].length) {
        return state
      }
    }
    case types.DFS_GET_LIQ_SUCCESS: {
      return set(state, `liqs.${action.payload.account}`, action.payload.data)
    }

    case types.DFS_GET_MARKETS_FAILURE: {
      //有数据的情况下，报错时不更新
      if (state.markets.length) {
        return state
      }
    }
    case types.DFS_GET_MARKETS_SUCCESS: {
      return set(state, `markets`, action.payload.data)
    }

    case types.DFS_GET_VOTE_SUCCESS: {
      return set(state, `votes.${action.payload.account}`, action.payload.data)
    }

    case types.DFS_SWITCH_SMOOTH_MODE: {
      return set(state, `smoothMode`, action.payload.mode)
    }


    default: {
      return state;
    }
  }
}
