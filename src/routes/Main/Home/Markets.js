import React, { PureComponent, Fragment } from 'react';
import { Tabs, Input, Table, Icon } from 'antd';
import classnames from 'classnames';
import withMarkets from 'components/withMarkets';
import { Loading, Empty } from 'components/Placeholder';

import styles from './index.less';

const TabPane = Tabs.TabPane;
const Search = Input.Search;

@withMarkets
class Market extends PureComponent {
  // 跳转到交易中心
  handleGoToExchange = pair => {
    if (!pair.title) {
      const { handleSelectPair, history } = this.props;
      handleSelectPair(pair);
      history.push('/exchange');
    }
  };

  render() {
    let {
      sorter,
      viewport,
      handleSort,
      marketName,
      marketKeys,
      marketList,
      searchValue,
      localization,
      favoriteCoins,
      handleCollect,
      handleSearch,
      transferToCNY,
      marketsLoading,
      handleSwitchMarkets
    } = this.props;

    const columns = [
      {
        title: (
          <Fragment>
            {localization['币种']}
            <TableSorter {...{ sorter, sorterKey: 'coinOther' }} />
          </Fragment>
        ),
        dataIndex: 'coinOther',
        key: 'coinOther',
        onHeaderCell: column => ({
          className: styles.sorter,
          onClick: handleSort.bind(this, 'coinOther')
        }),
        render: (text, record) =>
          record.title ? (
            {
              children: <strong>{localization[record.title]}</strong>,
              props: { colSpan: 6, className: styles.areaTitle }
            }
          ) : (
            <span
              className={classnames({
                'name-wrap': true
              })}
            >
              <Icon
                type="star"
                onClick={handleCollect.bind(this, record)}
                className={favoriteCoins.includes(record.key) ? 'collected' : ''}
                theme={favoriteCoins.includes(record.key) ? 'filled' : 'outlined'}
              />
              {text}/{record.coinMain}
            </span>
          )
      },
      {
        title: (
          <Fragment>
            {`${localization['最新价']}${
              marketName !== 'Favorites' && viewport.width > 767 ? `(${marketName})` : ''
            }`}
            <TableSorter {...{ sorter, sorterKey: 'latestPrice' }} />
          </Fragment>
        ),
        dataIndex: 'latestPrice',
        key: 'latestPrice',
        onHeaderCell: column => ({
          className: styles.sorter,
          onClick: handleSort.bind(this, 'latestPrice')
        }),
        render: (latestPrice, record) =>
          record.title ? (
            { props: { colSpan: 0 } }
          ) : (
            <Fragment>
              {latestPrice.toFixed(record.pricePrecision)}
              <div
                style={{ color: '#bdbdbd', fontSize: 12, lineHeight: 1 }}
                dangerouslySetInnerHTML={{
                  __html: `&asymp;￥${transferToCNY(latestPrice, record.coinMain)}`
                }}
              />
            </Fragment>
          )
      },
      {
        title: (
          <Fragment>
            {localization['涨跌幅']}
            <TableSorter {...{ sorter, sorterKey: 'rise' }} />
          </Fragment>
        ),
        dataIndex: 'rise',
        key: 'rise',
        align: 'right',
        onHeaderCell: column => ({
          className: styles.sorter,
          onClick: handleSort.bind(this, 'rise')
        }),
        render: (text, record) =>
          record.title ? (
            { props: { colSpan: 0 } }
          ) : (
            <span className={`change font-color-${text.indexOf('-') !== -1 ? 'red' : 'green'}`}>
              {text}
            </span>
          )
      }
    ];

    if (viewport.width > 767) {
      columns.push(
        {
          title: localization['最高价'],
          dataIndex: 'highestPrice',
          key: 'highestPrice',
          align: 'right',
          render: (text, record) =>
            record.title ? { props: { colSpan: 0 } } : text.toFixed(record.pricePrecision)
        },
        {
          title: localization['最低价'],
          dataIndex: 'lowerPrice',
          key: 'lowerPrice',
          align: 'right',
          render: (text, record) =>
            record.title ? { props: { colSpan: 0 } } : text.toFixed(record.pricePrecision)
        },
        {
          title: (
            <Fragment>
              {localization['成交量']}
              <TableSorter {...{ sorter, sorterKey: 'dayCount' }} />
            </Fragment>
          ),
          dataIndex: 'dayCount',
          key: 'dayCount',
          align: 'right',
          onHeaderCell: column => ({
            className: styles.sorter,
            onClick: handleSort.bind(this, 'dayCount')
          }),
          render: (text, record) =>
            record.title ? { props: { colSpan: 0 } } : text.toFixed(record.volumePrecision)
        }
      );
    }

    return (
      <Fragment>
        {viewport.width < 768 && (
          <Search
            className={styles.searchs}
            value={searchValue}
            placeholder={localization['查询']}
            onChange={handleSearch}
            size="large"
            style={{ marginBottom: '0.9375rem' }}
          />
        )}
        <Tabs
          {...{
            tabBarExtraContent: viewport.width > 767 && (
              <Search
                className={styles.searchs}
                value={searchValue}
                placeholder={localization['查询']}
                onChange={handleSearch}
                style={{ width: 200 }}
              />
            )
          }}
          activeKey={marketName}
          onChange={handleSwitchMarkets}
        >
          {marketKeys.map(marketKey => (
            <TabPane
              tab={
                marketKey === 'Favorites' ? (
                  <span>
                    <Icon
                      type="star"
                      className={marketName === 'Favorites' ? 'collected' : ''}
                      theme={marketName === 'Favorites' ? 'filled' : 'outlined'}
                    />
                    {localization['自选']}
                  </span>
                ) : (
                  `${marketKey} ${viewport.width > 767 ? localization['市场'] : ''}`
                )
              }
              key={marketKey}
              className="area-tab-pane"
            >
              {marketKey === marketName ? (
                <Table
                  columns={columns}
                  dataSource={marketList}
                  loading={{ indicator: <Loading />, spinning: marketsLoading }}
                  onRow={record => ({
                    onClick: this.handleGoToExchange.bind(this, record)
                  })}
                  locale={{
                    emptyText: <Empty {...{ localization }} />
                  }}
                  pagination={false}
                />
              ) : null}
            </TabPane>
          ))}
        </Tabs>
      </Fragment>
    );
  }
}

export default Market;

const TableSorter = ({ sorter, sorterKey }) => (
  <span
    className={classnames({
      [styles.sortMark]: true,
      [styles[sorter[sorterKey]]]: !!sorter[sorterKey]
    })}
  >
    <Icon type="caret-up" className={classnames(styles.icon, styles.up)} />
    <Icon type="caret-down" className={classnames(styles.icon, styles.down)} />
  </span>
);
