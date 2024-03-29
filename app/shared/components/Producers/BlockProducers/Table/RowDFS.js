// @flow
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { Button, Header, Icon, Popup, Progress, Responsive, Table } from 'semantic-ui-react';
import { isEqual } from 'lodash';

import DangerLink from '../../../Global/Modal/DangerLink';
import ProducersVoteWeight from '../Vote/Weight';
import BigNumber from 'bn.js';

const nf = new Intl.NumberFormat();

class ProducersTableRow extends Component<Props> {
  shouldComponentUpdate = (nextProps) =>
    !isEqual(this.props.producer.key, nextProps.producer.key)
    || !isEqual(this.props.isValidUser, nextProps.isValidUser)
    || !isEqual(this.props.isSelected, nextProps.isSelected);

  render() {
    const {
      addProducer,
      connection,
      getProducerInfo,
      hasInfo,
      isMainnet,
      isSelected,
      producer,
      position,
      isProxying,
      isValidUser,
      removeProducer,
      settings,
      t,
      totalVoteWeight,
      totalVotes
    } = this.props;

    const epoch = 946684800000;
    const lastProduced = (producer.last_produced_block_time * 500) + epoch;
    const isActive = (Date.now() - lastProduced) < 1000;
    //为什么这里除以6个零而是8个或者9个？因为不清楚最小票数的单位是多少，所以除6安全一些，防止票数太低时显示0
    const votesTmp = (new BigNumber(producer.votes)).div(new BigNumber(1000000)).toNumber();
    const totalVotesTmp = totalVotes.div(new BigNumber(1000000)).toNumber();
    let votePercent = votesTmp / totalVotesTmp;
    if (votePercent) {
      votePercent = (votePercent * 100).toFixed(2)
    } else {
      votePercent = 0;
    }

    const voteFormatted = (producer.votes > 0)
      ? (
        <ProducersVoteWeight
          weight={producer.votes}
        />
      )
      : 'None';
    const shouldDisplayInfoButton = connection.supportedContracts && connection.supportedContracts.includes('producerinfo');
    const producersVotedIn = connection.chainId !== '73647cde120091e0a4b85bced2f3cfdb3041e266cbbe95cee59b73235a1b3b6f';

    return (
      <Table.Row positive={isActive} key={producer.key}>
        <Table.Cell
          singleLine
          textAlign="center"
        >
          {(producersVotedIn) && (
            <Popup
              content={t('producer_vote_description', { chainSymbol: connection.chainSymbol })}
              header={t('producer_vote_header', { producer: (producer.address || producer.owner) })}
              hoverable
              position="right center"
              trigger={(
                <Button
                  color={isSelected ? 'blue' : 'grey'}
                  disabled={!isValidUser}
                  icon={isSelected ? 'checkmark box' : 'minus square outline'}
                  onClick={
                    (isSelected)
                      ? () => removeProducer(producer.address || producer.owner)
                      : () => addProducer(producer.address || producer.owner)
                  }
                  size="small"
                />
              )}
            />
          )}
        </Table.Cell>
        <Table.Cell
          singleLine
          textAlign="center"
        >
          <b>{ position }</b>
        </Table.Cell>
        <Table.Cell
          singleLine
        >
          <Header size="small">
            <span styles={{ fontFamily: '"Courier New", Courier, "Lucida Sans Typewriter", "Lucida Typewriter", monospace' }}>
              {producer.address || producer.owner}
            </span>
            <Header.Subheader>
              <DangerLink
                content={producer.url.substring(0, 30).replace(/(^\w+:|^)\/\//, '')}
                link={producer.url}
                settings={settings}
              />
            </Header.Subheader>
          </Header>
        </Table.Cell>
        <Table.Cell
          singleLine
          textAlign="center"
        >
          {(producersVotedIn) && (
            <Header size="tiny">
              {(producer.votes / 100000000).toFixed(0)} {connection.chainSymbol || 'DFS'}
              <Header.Subheader>
                {votePercent}%
              </Header.Subheader>
            </Header>
          )}
        </Table.Cell>
        <Table.Cell collapsing textAlign="center">
          {(shouldDisplayInfoButton) && (
            <span>
              {(hasInfo)
                ? (
                  <Button
                    basic
                    color="purple"
                    icon="magnify"
                    onClick={() => getProducerInfo(producer.owner)}
                    size="small"
                  />
                ) : (
                  <Popup
                    content={t('producer_json_unavailable_content')}
                    header={t('producer_json_unavailable_header')}
                    hoverable
                    inverted
                    position="left center"
                    trigger={
                      (isMainnet)
                      ? <Button basic icon="magnify" size="small" />
                      : false
                    }
                  />
                )
              }
            </span>
          )}
        </Table.Cell>
      </Table.Row>
    );
  }
}

export default withTranslation('producers')(ProducersTableRow);
