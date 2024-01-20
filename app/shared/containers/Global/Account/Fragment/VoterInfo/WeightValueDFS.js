// @flow
import { get } from 'dot-prop-immutable';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import compose from 'lodash/fp/compose';

class GlobalAccountFragmentVoterInfoWeightValueDFS extends PureComponent<Props> {
  render() {
    const {
      weight,
    } = this.props;
    if (!weight) {
      return (
        <React.Fragment>
          ~
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        {(weight / 100000000).toFixed(0)}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const account = ownProps.account.replace(/\./g, '\\.');
  let voter = get(state, `accounts.${account}.voter_info`, {});
  // The get call above will return null as a retrieved value, and if so, set to {}
  if (voter === null) {
    voter = {};
  }
  return {
    weight: voter.last_vote_weight
  };
};

export default compose(
  withTranslation('global'),
  connect(mapStateToProps)
)(GlobalAccountFragmentVoterInfoWeightValueDFS);
