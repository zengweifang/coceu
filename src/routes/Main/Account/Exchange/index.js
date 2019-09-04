import React, { PureComponent, Fragment } from 'react';
import { Tabs, Input, Select, Button, Table, message, List } from 'antd';
import { Loading, Empty } from 'components/Placeholder';
import { getQueryString, stampToDate } from 'utils';
import request from 'utils/request';
import classnames from 'classnames';

import styles from './index.less';

const TabPane = Tabs.TabPane;
const Option = Select.Option;

class Exchange extends PureComponent {
  state = {
    currentTab: getQueryString('orderNo') ? 'record' : 'current',
    currency: '',
    coin: 'USDT',
    coinList: [],
    currentList: null,
    currentTotal: 0,
    currentPage: 1,
    expendRecordKey: '',
    recordList: null,
    recordTotal: 0,
    recordPage: 1,
    recordAllDetail: null,
    detailList: null,
    detailPage: 1,
    detailTotal: 0
  };

  componentDidMount() {
    this.getCoinMainList();

    let { coin } = this.state;
    if (getQueryString('orderNo')) {
      this.getRecordTrade(1, '', coin);
    } else {
      this.getCurrentTrade(1, '', coin);
    }
  }

  getCoinMainList = () => {
    request('/index/coinMainList', {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        const coinList = json.data;
        this.setState({ coinList });
      }
    });
  };

  tabChange = value => {
    if (value === 'current') {
      this.getCurrentTrade(1, '', 'USDT');
    } else if (value === 'record') {
      this.setState({ expendRecordKey: '' });
      this.getRecordTrade(1, '', 'USDT');
    } else {
      this.getTradeDetail(1, '', 'USDT');
    }
    this.setState({ currentTab: value, currency: '', coin: 'USDT' });
  };

  getCurrentTrade = (page, coinOther, coinMain) => {
    this.setState({ currentList: null });
    request('/coin/userTradeOrder', {
      method: 'POST',
      body: {
        coinMain,
        coinOther,
        status: 0,
        currentPage: page,
        showCount: 10
      }
    }).then(json => {
      if (json.code === 10000000) {
        let currentList = json.data.list.map(item => {
          item.key = item.id;
          return item;
        });
        this.setState({ currentList, currentTotal: json.data.count, currentPage: page });
      }
    });
  };

  getRecordTrade = (page, coinOther, coinMain) => {
    this.setState({ recordList: null });
    request('/coin/userTradeOrder', {
      method: 'POST',
      body: {
        coinMain,
        coinOther,
        status: 1,
        currentPage: page,
        showCount: 10
      }
    }).then(json => {
      if (json.code === 10000000) {
        let recordList = json.data.list.map(item => {
          item.key = item.id;
          return item;
        });
        this.setState({ recordList, recordTotal: json.data.count, recordPage: page });
      }
    });
  };

  // 撤单
  cancelTrade = orderNo => {
    const { localization } = this.props;
    request(`/trade/cancelTrade/${orderNo}`, {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        message.success(localization['撤单成功']);
        let { currency, coin, currentPage } = this.state;
        this.getCurrentTrade(currentPage, currency, coin);
      }
    });
  };

  getTradeDetail = (page, coinOther, coinMain) => {
    this.setState({ detailList: null });
    request('/coin/userTradeOrderDetail', {
      method: 'POST',
      body: {
        coinMain,
        coinOther,
        status: 1,
        currentPage: page,
        showCount: 10
      }
    }).then(json => {
      if (json.code === 10000000) {
        let detailList = json.data.list.map(item => {
          item.key = item.id;
          return item;
        });
        this.setState({ detailList, detailTotal: json.data.count, detailPage: page });
      }
    });
  };

  currencyChange = e => {
    this.setState({ currency: e.target.value });
  };

  detailPageChange = page => {
    let { currency, coin } = this.state;
    this.getTradeDetail(page, currency, coin);
  };
  currentPageChange = page => {
    let { currency, coin } = this.state;
    this.getCurrentTrade(page, currency, coin);
  };
  recordPageChange = page => {
    let { currency, coin } = this.state;
    this.getRecordTrade(page, currency, coin);
  };

  // 撤单点击事件
  handleCancelTrade = record => {
    this.cancelTrade(record.id);
  };

  handleActionSheetHide = e => {
    if (e.target.className && e.target.className.indexOf('action-sheet') !== -1) {
      this.setState({ recordAllDetail: null });
    }
  };

  coinSelectChange = value => {
    let { currentTab, currency } = this.state;
    this.setState({ coin: value });
    if (currentTab === 'current') {
      this.getCurrentTrade(1, currency, value);
    } else if (currentTab === 'record') {
      this.setState({ expendRecordKey: '' });
      this.getRecordTrade(1, currency, value);
    } else {
      this.getTradeDetail(1, currency, value);
    }
  };

  searchClick = () => {
    let { currentTab, currency, coin } = this.state;
    currency = currency.toUpperCase();
    if (currentTab === 'current') {
      this.getCurrentTrade(1, currency, coin);
    } else if (currentTab === 'record') {
      this.setState({ expendRecordKey: '' });
      this.getRecordTrade(1, currency, coin);
    } else {
      this.getTradeDetail(1, currency, coin);
    }
  };

  detailClick = record => {
    let { recordAllDetail, expendRecordKey } = this.state;
    if (recordAllDetail && recordAllDetail.length > 0 && expendRecordKey === record.id) {
      this.setState({ expendRecordKey: '' });
    } else {
      this.setState({ expendRecordKey: record.id });
      this.getDetailList(record.id);
    }
  };

  getDetailList = id => {
    request(`/coin/tradeOrderDetail/${id}`, {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        this.setState({ recordAllDetail: json.data });
      }
    });
  };

  render() {
    const { localization, viewport } = this.props;

    const {
      currentTab,
      currency,
      currentPage,
      recordPage,
      detailPage,
      expendRecordKey,
      currentTotal,
      recordTotal,
      currentList,
      recordList,
      detailList,
      detailTotal,
      coinList,
      coin,
      recordAllDetail
    } = this.state;

    const commonColumns = [
      {
        title: localization['时间'],
        dataIndex: 'createDate',
        key: 'createDate',
        render: text => stampToDate(text * 1)
      },
      {
        title: localization['交易类型'],
        dataIndex: 'exType1',
        key: 'exType1',
        render: () => localization['币币交易']
      },
      {
        title: localization['交易对'],
        dataIndex: 'coinMain',
        key: 'coinMain',
        render: (text, record) => `${record.coinOther}/${record.coinMain}`
      },
      {
        title: localization['方向'],
        dataIndex: 'exType',
        key: 'exType',
        render: text => (
          <div className={`font-color-${text === 0 ? 'green' : 'red'}`}>
            {localization[`${text === 0 ? '买入' : '卖出'}`]}
          </div>
        )
      },
      {
        title: localization['价格'],
        dataIndex: 'price',
        key: 'price'
      }
    ];

    const currentColumns = [
      ...commonColumns,
      {
        title: localization['数量'],
        dataIndex: 'askVolume',
        key: 'askVolume'
      },
      {
        title: localization['委托总额'],
        dataIndex: 'all',
        key: 'all',
        render: (text, record) => (record.price * record.askVolume).toFixed(4)
      },
      {
        title: localization['已成交'],
        dataIndex: 'successVolume',
        key: 'successVolume'
      },
      {
        title: localization['未成交'],
        dataIndex: 'not',
        key: 'not',
        render: (text, record) => (record.askVolume - record.successVolume).toFixed(4)
      },
      {
        title: localization['操作'],
        dataIndex: 'toCoinVolume',
        key: 'toCoinVolume',
        render: (text, record) => (
          <Button
            type="primary"
            onClick={() => {
              this.handleCancelTrade(record);
            }}
          >
            {localization['撤单']}
          </Button>
        )
      }
    ];

    const recordColumns = [
      ...commonColumns,
      {
        title: localization['委托量'],
        dataIndex: 'askVolume',
        key: 'askVolume'
      },
      {
        title: localization['已成交'],
        dataIndex: 'successVolume',
        key: 'successVolume'
      },
      {
        title: localization['状态'],
        dataIndex: 'status',
        key: 'status',
        render: text => {
          const statusText = {
            0: '未成交',
            1: '部分成交',
            2: '全部成交',
            3: '部分取消',
            4: '全部取消'
          };
          return statusText[text] ? localization[statusText[text]] : '--';
        }
      },
      {
        title: localization['操作'],
        dataIndex: 'lockVolume0',
        key: 'lockVolume0',
        render: (text, record) =>
          record.status === 4 ? (
            '--'
          ) : (
            <div
              onClick={() => {
                this.detailClick(record);
              }}
              className={styles.detailText}
            >
              {localization['详情']}
            </div>
          )
      }
    ];

    const detailColumns = [
      ...commonColumns,
      {
        title: localization['数量'],
        dataIndex: 'successVolume',
        key: 'successVolume'
      },
      {
        title: localization['成交额'],
        dataIndex: 'toCoinVolume',
        key: 'toCoinVolume',
        render: (text, record) => (record.price * record.successVolume).toFixed(8)
      },
      {
        title: localization['手续费'],
        dataIndex: 'exFee',
        key: 'exFee',
        render: text => Number(text).toFixed(8)
      }
    ];

    const searchBar = (
      <div className="search" style={{ marginBottom: viewport.width < 678 ? '0.625rem' : 0 }}>
        <Input
          value={currency}
          onChange={this.currencyChange}
          placeholder={localization['币种']}
          style={{ width: '6.25rem' }}
        />
        <span style={{ padding: '0 0.625rem' }}>/</span>
        <Select
          value={coin}
          style={{ width: 100 }}
          onChange={this.coinSelectChange}
          getPopupContainer={() => document.querySelector('.search')}
        >
          {coinList &&
            coinList.map(item => {
              return (
                <Option key={item} value={item}>
                  {item}
                </Option>
              );
            })}
        </Select>
        <Button
          type="primary"
          onClick={this.searchClick}
          style={{ width: '5rem', marginLeft: '1.25rem' }}
        >
          {localization['查询']}
        </Button>
      </div>
    );

    const tabsProps = {
      activeKey: currentTab,
      onChange: this.tabChange
    };

    // 公用props
    const commonProps = {
      locale: {
        emptyText: <Empty {...{ localization }} />
      }
    };

    // loading
    const loading = spinning => ({
      loading: {
        spinning,
        indicator: <Loading />
      }
    });

    const currentProps = {
      dataSource: currentList,
      columns: currentColumns,
      pagination: {
        defaultCurrent: 1,
        total: currentTotal,
        current: currentPage,
        pageSize: 10,
        onChange: this.currentPageChange
      },
      ...loading(!currentList),
      ...commonProps
    };

    const recordProps = {
      dataSource: recordList,
      columns: recordColumns,
      pagination: {
        defaultCurrent: 1,
        total: recordTotal,
        current: recordPage,
        pageSize: 10,
        onChange: this.recordPageChange
      },
      ...loading(!recordList),
      ...commonProps
    };

    const detailProps = {
      dataSource: detailList,
      columns: detailColumns,
      pagination: {
        defaultCurrent: 1,
        total: detailTotal,
        current: detailPage,
        pageSize: 10,
        onChange: this.detailPageChange
      },
      ...loading(!detailList),
      ...commonProps
    };

    if (viewport.width > 767) {
      tabsProps.tabBarExtraContent = searchBar;
      recordProps.expandedRowRender = record => (
        <RecordDetail {...{ recordAllDetail, styles, viewport, localization }} />
      );
      recordProps.expandedRowKeys = [expendRecordKey];
    } else {
      const commonAttr = {
        ...commonColumns[0],
        fixed: 'left',
        width: 120
      };
      currentColumns[0] = commonAttr;
      recordColumns[0] = commonAttr;
      detailColumns[0] = commonAttr;
      currentProps.scroll = { x: 900 };
      recordProps.scroll = { x: 800 };
      detailProps.scroll = { x: 800 };
    }

    return (
      <Fragment>
        {viewport.width < 768 && searchBar}
        <Tabs {...tabsProps}>
          <TabPane tab={localization['当前委托']} key="current">
            <Table {...currentProps} />
          </TabPane>
          <TabPane tab={localization['委托记录']} key="record">
            <Table {...recordProps} />
          </TabPane>
          <TabPane tab={localization['成交明细']} key="detail">
            <Table {...detailProps} />
          </TabPane>
        </Tabs>
        {viewport.width < 678 && (
          <Fragment>
            <div
              className={classnames({
                'action-sheet-mask': true,
                show: !!recordAllDetail
              })}
              onClick={this.handleActionSheetHide}
            />
            <RecordDetail
              {...{
                recordAllDetail,
                styles,
                localization,
                viewport,
                show: !!recordAllDetail
              }}
            />
          </Fragment>
        )}
      </Fragment>
    );
  }
}

export default Exchange;

function RecordDetail({ recordAllDetail, styles, localization, viewport, show }) {
  const actionSheet = viewport.width < 678;
  return (
    <div
      className={classnames({
        [styles.expand]: true,
        'action-sheet': actionSheet,
        show
      })}
    >
      {recordAllDetail && recordAllDetail.length ? (
        <List
          size="small"
          header={
            <ul className={styles.title}>
              <li>{localization['成交时间']}</li>
              <li>{localization['成交价格']}</li>
              <li>{localization['成交数量']}</li>
              <li>{localization['成交额']}</li>
              {!actionSheet && (
                <li>
                  {localization['手续费']}(
                  {recordAllDetail[0].exType
                    ? recordAllDetail[0].coinMain
                    : recordAllDetail[0].coinOther}
                  )
                </li>
              )}
            </ul>
          }
          dataSource={recordAllDetail}
          renderItem={item => (
            <List.Item>
              <ul className={styles.list}>
                <li>{stampToDate(item.createDate * 1)}</li>
                <li>{item.price}</li>
                <li>{item.successVolume}</li>
                <li>{item.price * item.successVolume}</li>
                {!actionSheet && <li>{item.exFee.toFixed(8)}</li>}
              </ul>
            </List.Item>
          )}
        />
      ) : (
        <Empty {...{ localization }} />
      )}
    </div>
  );
}
