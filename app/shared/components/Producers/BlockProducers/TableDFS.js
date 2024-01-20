// @flow
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { debounce, filter, findIndex } from 'lodash';
import { Grid, Header, Input, Segment, Transition, Table } from 'semantic-ui-react';
import { get } from 'dot-prop-immutable';

import ProducersModalInfo from './Modal/Info';
import ProducersTableRowDFS from './Table/RowDFS';
import ProducersVoteWeight from './Vote/Weight';
import BigNumber from 'bn.js';

import compose from 'lodash/fp/compose';
import { connect } from 'react-redux';

class ProducersTable extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      query: false,
      viewing: false
    };
  }

  onSearchChange = debounce((e, { value }) => {
    const { isQuerying } = this.props;
    const query = String(value).toLowerCase();
    this.setState({ query }, () => {
      isQuerying((query && query.length > 0));
    });
    this.props.resetDisplayAmount();
  }, 400);

  querying() {
    const {
      query
    } = this.state;
    return (query && query.length > 0);
  }

  clearProducerInfo = () => this.setState({ viewing: false });
  getProducerInfo = (producer) => this.setState({ viewing: producer });

  render() {
    const {
      amount,
      connection,
      globals,
      isMainnet,
      isProxying,
      isValidUser,
      producers,
      selected,
      settings,
      system,
      t, 
      wallet,
      dfs,
      accounts
    } = this.props;
    const {
      query,
      viewing,
    } = this.state;
    const {
      current
    } = globals;
    const activatedStake = (current.total_activated_stake)
      ? parseInt(current.total_activated_stake / 10000, 10)
      : 0;
    const activatedStakePercent = parseFloat((activatedStake / 1000000000) * 100, 10).toFixed(2);
    const totalVoteWeight = (current.total_producer_vote_weight)
      ? parseInt(current.total_producer_vote_weight, 10)
      : 0;
    const loading = (producers.list.length < 1);
    const querying = this.querying();
    //没有提供LP的情况下，没有voter_info字段
    let voter = get(accounts, `${wallet.account}.voter_info`, {});
    let lastVote = 0;
    if (voter.hasOwnProperty('last_vote_weight')) {
      lastVote = (voter.last_vote_weight / 100000000).toFixed(0)
    }
    let totalVotes = new BigNumber(0)
    producers.list.forEach(item => {
      totalVotes = totalVotes.add(new BigNumber(item.votes))
    })
    let baseTable = <Table.Body />;
    let searchTable = (
      <Table.Body>
        <Table.Row>
          <Table.Cell colSpan={5}>
            {t('producer_none_match')}
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    );
    if (!loading) {
      const fullResults = producers.list.slice(0, amount);
      baseTable = (
        <Table.Body key="FullResults">
          {fullResults.map((producer, idx) => {
            const isSelected = (selected.indexOf(producer.address || producer.owner) !== -1);
            const contracts = get(connection, 'supportedContracts', []);
            const hasInfo = contracts && contracts.includes('producerinfo') && !!(get(producers.producersInfo, producer.owner));
            return (
              <ProducersTableRowDFS
                addProducer={this.props.addProducer}
                connection={connection}
                getProducerInfo={this.getProducerInfo}
                hasInfo={hasInfo}
                key={`${isProxying}-${producer.key}-${hasInfo}`}
                isMainnet={isMainnet}
                isProxying={isProxying}
                isSelected={isSelected}
                isValidUser={isValidUser}
                position={idx + 1}
                producer={producer}
                removeProducer={this.props.removeProducer}
                system={system}
                settings={settings}
                totalVoteWeight={totalVoteWeight}
                totalVotes={totalVotes}
              />
            );
          })}
        </Table.Body>
      );

      if (querying) {
        const partResults = filter(producers.list, (producer) => {
          return producer.owner.indexOf(query) > -1 ||
            producer.address && producer.address.indexOf(query) > -1;
        }).slice(0, amount);
        if (partResults.length > 0) {
          searchTable = (
            <Table.Body key="PartResults">
              {partResults.map((producer) => {
                const isSelected = (selected.indexOf(producer.address || producer.owner) !== -1);

                const hasInfo = !!(get(producers.producersInfo, producer.owner));
                return (
                  <ProducersTableRowDFS
                    addProducer={this.props.addProducer}
                    connection={connection}
                    getProducerInfo={this.getProducerInfo}
                    hasInfo={hasInfo}
                    key={producer.key}
                    is={isMainnet}
                    isProxying={isProxying}
                    isSelected={isSelected}
                    isValidUser={isValidUser}
                    position={findIndex(producers.list, { owner: producer.owner }) + 1}
                    producer={producer}
                    removeProducer={this.props.removeProducer}
                    settings={settings}
                    totalVoteWeight={totalVoteWeight}
                  />
                );
              })}
            </Table.Body>
          );
        }
      }
    }
    const producersVotedIn = connection.chainId !== '73647cde120091e0a4b85bced2f3cfdb3041e266cbbe95cee59b73235a1b3b6f';
    return (
      <React.Fragment>
        <Segment attached="top" color="purple" piled loading={loading}>
          <ProducersModalInfo
            producerInfo={producers.producersInfo[viewing]}
            onClose={this.clearProducerInfo}
            settings={settings}
            viewing={viewing}
          />
          <Grid>
            <Grid.Column width={8}>
              {(activatedStakePercent < 15 && producersVotedIn && connection.stakedResources)
                ? (
                  <Header size="small">
                    Your votes: {dfs.votes[wallet.account]}
                    <Header.Subheader>
                      You last voted: {lastVote}
                      {/* <ProducersVoteWeight
                        weight={totalVoteWeight}
                      />
                      {' '}
                      {t('block_producer_total_weight')} */}
                    </Header.Subheader>
                  </Header>
                ) : (producersVotedIn && connection.stakedResources) ? (
                  <Header size="small">
                    {t('producers_block_producers')}
                    <Header.Subheader>
                      <ProducersVoteWeight
                        weight={totalVoteWeight}
                      />
                      {' '}
                      {t('block_producer_total_weight')}
                    </Header.Subheader>
                  </Header>
                ) : ''}
            </Grid.Column>
            <Grid.Column width={8} key="ProducersVotingPreview" textAlign="right">
              <Input
                icon="search"
                onChange={this.onSearchChange}
                placeholder={t('search')}
              />
            </Grid.Column>
          </Grid>
        </Segment>
        <Table
          attached="bottom"
          color="grey"
          size="small"
          striped
          style={{ borderRadius: 0 }}

        >
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell collapsing />
              <Table.HeaderCell collapsing />
              <Table.HeaderCell>
                {t('block_producer')}
              </Table.HeaderCell>
              <Table.HeaderCell textAlign="center" width={5}>
                {producersVotedIn ? t('block_producer_total_votes') : ''}
              </Table.HeaderCell>
              <Table.HeaderCell collapsing />
            </Table.Row>
          </Table.Header>
          <Transition visible={querying} animation="slide down" duration={200}>
            {searchTable}
          </Transition>
          <Transition visible={!querying} animation="slide down" duration={200}>
            {baseTable}
          </Transition>
        </Table>
      </React.Fragment>
    );
  }
}

// export default withTranslation('producers')(ProducersTable);

const makeMapStateToProps = () => {
  const mapStateToProps = (state, props) => ({
    dfs: state.dfs,
    wallet: state.wallet,
    accounts: state.accounts
  });
  return mapStateToProps;
};

export default compose(
  withTranslation('producers'),
  connect(makeMapStateToProps)
)(ProducersTable);
