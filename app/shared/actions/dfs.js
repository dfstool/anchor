import * as types from './typesDFS';
import { map, uniq } from 'lodash';
import BigNumber from 'bn.js';
import { getAccounts } from './accounts';
import { httpClient, httpQueue } from '../utils/http/generic';

import eos from './helpers/eos';

export function getVoter(account) {
  return (dispatch, getState) => {
    dispatch({
      type: types.DFS_GET_VOTER_PENDING
    });
    const { connection } = getState();
    const query = {
      json: true,
      code: 'dfsbpsvoters',
      scope: 'dfsbpsvoters',
      table: 'voters',
      lower_bound: account + '',
      upper_bound: account + ''
    };
    //{"rows":[],"more":false,"next_key":""}
    eos(connection, false, true).rpc.get_table_rows(query).then((results) => dispatch({
      type: types.DFS_GET_VOTER_SUCCESS,
      payload: { account, data: results.rows }
    })).catch((err) => dispatch({
      type: types.DFS_GET_VOTER_FAILURE,
      payload: { account, data: [] }
    }));
  };
}

export function getVoters() {
  return (dispatch, getState) => {
    const { wallets, settings, } = getState();
    const chainAccounts = [].concat(wallets).filter((w) => (w.chainId === settings.chainId));
    const accountNames = uniq(map(chainAccounts, 'account')).sort();
    accountNames.forEach(account => dispatch(getVoter(account)));
  };
}

export function getLiq(account) {
  return (dispatch, getState) => {
    dispatch({
      type: types.DFS_GET_LIQ_PENDING
    });
    const { connection } = getState();
    const query = {
      json: true,
      code: 'loglogloglog',
      scope: account + '',
      table: 'liqs',
    };
    //{"rows":[],"more":false,"next_key":""}
    eos(connection, false, true).rpc.get_table_rows(query).then((results) => dispatch({
      type: types.DFS_GET_LIQ_SUCCESS,
      payload: { account, data: results.rows }
    })).catch((err) => dispatch({
      type: types.DFS_GET_LIQ_FAILURE,
      payload: { account, data: [] }
    }));
  };
}

export function getLiqs() {
  return (dispatch, getState) => {
    const { wallets, settings, } = getState();
    const chainAccounts = [].concat(wallets).filter((w) => (w.chainId === settings.chainId));
    const accountNames = uniq(map(chainAccounts, 'account')).sort();
    accountNames.forEach(account => dispatch(getLiq(account)))
  };
}

export function getMarkets() {
  return (dispatch, getState) => {
    dispatch({
      type: types.DFS_GET_MARKETS_PENDING
    });
    const { connection } = getState();
    const query = {
      json: true,
      code: 'swapswapswap',
      scope: 'swapswapswap',
      table: 'markets',
      limit: 1000
    };
    //{"rows":[],"more":false,"next_key":""}
    eos(connection, false, true).rpc.get_table_rows(query).then((results) => dispatch({
      type: types.DFS_GET_MARKETS_SUCCESS,
      payload: { data: results.rows }
    })).catch((err) => dispatch({
      type: types.DFS_GET_MARKETS_FAILURE,
      payload: { data: [] }
    }));
  };
}

export function getVote(account) {
  const calcVote = (liq, market, index) => {
    let reserve = new BigNumber(0);
    let token = new BigNumber(liq.token);
    let lpToken = new BigNumber(market.liquidity_token);
    if (index === 0) {
      reserve = new BigNumber(market.reserve0.split(" ")[0]);
    } else if (index === 1) {
      reserve = new BigNumber(market.reserve1.split(" ")[0]);
    }
  
    return token.mul(reserve).div(lpToken);  
  }

  return (dispatch, getState) => {
    const { dfs } = getState();
    let sumDFS = new BigNumber(0);
    let liqs = dfs.liqs[account]?  dfs.liqs[account]: [];
    let markets = dfs.markets;
    let market = '';
    let vote = '';

    liqs.forEach(liq => {
      //返回数组中第一个适合条件的元素
      market = markets.find(item => item.mid === liq.mid);
      if (market.contract0 === "eosio.token") {
        sumDFS = sumDFS.add(calcVote(liq, market, 0))
      } else if (market.contract1 === "eosio.token") {
        sumDFS = sumDFS.add(calcVote(liq, market, 1))
      }
    })

    vote = (sumDFS.toNumber() / 1000000000).toFixed(0);

    dispatch({
      type: types.DFS_GET_VOTE_SUCCESS,
      payload: { account, data: vote }
    })    
  };
}

export function getVotes() {
  return (dispatch, getState) => {
    const { wallets, settings, } = getState();
    const chainAccounts = [].concat(wallets).filter((w) => (w.chainId === settings.chainId));
    const accountNames = uniq(map(chainAccounts, 'account')).sort();
    accountNames.forEach(account => dispatch(getVote(account)))
  };
}


export function syncDFS() {
  return (dispatch, getState) => {
    const { connection } = getState();
    if (connection.chain === 'DFS') {
      dispatch(getVoters());
      dispatch(getLiqs());
      dispatch(getMarkets());
      dispatch(getVotes());
    }
  };
}

export function voteProducers(producers = [], proxy = '') {
  return async (dispatch, getState) => {
    const {
      connection,
      settings,
    } = getState();
    dispatch({
      type: 'SYSTEM_VOTEPRODUCER_PENDING',
      payload: { connection }
    });
    const { account, authorization } = settings;
    const actions = [{
      account: 'dfsbpsvoters',
      name: 'vote',
      authorization: [
        {
          actor: account,
          permission: authorization,
        }
      ],
      data: {
        voter: account + '',
        producer: producers[0] + '',
      },
    }];

    return eos(connection, true, true)
      .transact({ actions }, {
        useLastIrreversible: true,
        broadcast: connection.broadcast,
        expireSeconds: connection.expireSeconds,
        sign: connection.sign,
      })
      // .voteproducer(account, proxy, producers)
      .then((tx) => {
        const accounts = [account];
        // If a proxy is set, that account also needs to be loaded
        if (proxy) {
          accounts.push(proxy);
        }
        // Add a short delay for data processing on the node
        setTimeout(() => {
          dispatch(getAccounts(accounts));
        }, 1000);
        return dispatch({
          payload: {
            connection,
            producers,
            proxy,
            tx,
          },
          type: 'SYSTEM_VOTEPRODUCER_SUCCESS'
        });
      })
      .catch((err) => dispatch({
        payload: {
          connection,
          err,
          producers,
          proxy
        },
        type: 'SYSTEM_VOTEPRODUCER_FAILURE'
      }));
  };
}

export function switchSmoothMode(mode) {
  return (dispatch, getState) => {
    dispatch({
      type: types.DFS_SWITCH_SMOOTH_MODE,
      payload: { mode }
    });
  };
}

export default {
  syncDFS,
  getVoter,
  getVoters,
  getLiq,
  getLiqs,
  getVotes,
  voteProducers,
  switchSmoothMode,

};
