// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Producers from '../../../../../shared/components/Producers';
import ProducersDFS from '../../../../../shared/components/ProducersDFS';

import * as ProducersActions from '../../../../../shared/actions/producers';
import * as SystemStateActions from '../../../../../shared/actions/system/systemstate';
import * as TableActions from '../../../../../shared/actions/table';
import * as VoteProducerActions from '../../../../../shared/actions/system/voteproducer';
import * as WalletActions from '../../../../../shared/actions/wallet';
import * as DFSActions from '../../../../../shared/actions/dfs';

import makeGetKeysUnlocked from '../../../../../shared/selectors/getKeysUnlocked';

class GovernenceProducersContainer extends Component<Props> {
  render() {
    const {
      connection,
    } = this.props;
    
    return (
      connection.chain === 'DFS'?
      <ProducersDFS
        {...this.props}
      /> : 
      <Producers
        {...this.props}
      />      
    );
  }
}

const makeMapStateToProps = () => {
  const getKeysUnlocked = makeGetKeysUnlocked();
  const mapStateToProps = (state, props) => ({
    accounts: state.accounts,
    allBlockExplorers: state.blockexplorers,
    balances: state.balances,
    blockchains: state.blockchains,
    connection: state.connection,
    globals: state.globals,
    history: state.history,
    producers: state.producers,
    pubkeys: getKeysUnlocked(state, props),
    settings: state.settings,
    system: state.system,
    tables: state.tables,
    transaction: state.transaction,
    validate: state.validate,
    wallet: state.wallet,
    dfs: state.dfs
  });
  return mapStateToProps;
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...ProducersActions,
      ...SystemStateActions,
      ...TableActions,
      ...VoteProducerActions,
      ...WalletActions, 
      ...DFSActions
    }, dispatch)
  };
}

export default withRouter(connect(makeMapStateToProps, mapDispatchToProps)(GovernenceProducersContainer));
