// @flow
import { get } from 'dot-prop-immutable';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import compose from 'lodash/fp/compose';

class GlobalAccountFragmentVoterInfoVotesDFS extends PureComponent<Props> {
  render() {
    const {
      votes,
    } = this.props;
    if (!votes) {
      return (
        <React.Fragment>
          ~
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        {votes}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const account = ownProps.account.replace(/\./g, '\\.');
  let votes = get(state, `dfs.votes.${account}`, '0');

  return {
    votes
  };

};

export default compose(
  withTranslation('global'),
  connect(mapStateToProps)
)(GlobalAccountFragmentVoterInfoVotesDFS);
