import React, { PureComponent, Fragment } from 'react';
import { Tabs, Table, Select, message, Button } from 'antd';
import { Loading, Empty } from 'components/Placeholder';
import { stampToDate } from 'utils';
import request from 'utils/request';
import classnames from 'classnames';

import styles from './index.less';

const TabPane = Tabs.TabPane;
const Option = Select.Option;

class Finance extends PureComponent {
  state = {
    symbol: '全部',
    coinList: [],
    currentTab: 'recharge',
    rechargeList: null,
    rechargeTotal: 0,
    rechargePage: 1,

    withdrawList: null,
    withdrawPage: 1,
    withdrawTotal: 0,
    expendRow: null,

    transferList: null,
    transferTotal: 0,
    transferPage: 1,

    transferAccountList: null,
    transferAccountTotal: 0,
    transferAccountPage: 1
  };

  componentDidMount() {
    this.getCoinList();
    this.getRechargeList(1, '', '全部');
  }

  getCoinList = () => {
    request('/coin/list', {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        let myData = json.data.map(item => {
          const { id, name } = item;
          return { id, name };
        });
        myData.unshift({ id: '', name: '全部' });
        this.setState({ coinList: myData, symbol: '全部' });
      }
    });
  };

  getRechargeList = (page, coinId, symbol) => {
    this.setState({ rechargeList: null, rechargePage: page });
    let mSymbol = symbol === '全部' ? '' : symbol;
    let mCoinId = symbol === '全部' ? '' : coinId;
    request('/coin/deposit/list', {
      body: {
        coinId: mCoinId,
        symbol: mSymbol,
        currentPage: page,
        showCount: 10
      }
    }).then(json => {
      if (json.code === 10000000) {
        this.setState({
          rechargeList: json.data.list,
          rechargeTotal: json.data.count
        });
      }
    });
  };

  getWithdrawList = (page, coinId, symbol) => {
    this.setState({ withdrawList: null, withdrawPage: page });
    let mSymbol = symbol === '全部' ? '' : symbol;
    let mCoinId = symbol === '全部' ? '' : coinId;
    request('/coin/withdraw/list ', {
      body: {
        coinId: mCoinId,
        symbol: mSymbol,
        currentPage: page,
        showCount: 10
      }
    }).then(json => {
      if (json.code === 10000000) {
        let withdrawList = json.data.list.map((item, index) => {
          item.key = item.id;
          return item;
        });
        this.setState({ withdrawList, withdrawTotal: json.data.count });
      }
    });
  };

  getTransferList = (page, coinId, symbol) => {
    this.setState({ transferList: null, transferPage: page });
    let mSymbol = symbol === '全部' ? '' : symbol;
    let mCoinId = symbol === '全部' ? '' : coinId;
    request('/offline/coin/transfer/list', {
      body: {
        coinId: mCoinId,
        symbol: mSymbol,
        currentPage: page,
        showCount: 10
      }
    }).then(json => {
      if (json.code === 10000000) {
        let transferList = json.data.list.map(item => {
          item.key = item.id;
          return item;
        });
        this.setState({ transferList, transferTotal: json.data.count });
      }
    });
  };

  tabChange = value => {
    this.setState({ symbol: '全部', currentTab: value, withdrawPage: 1 });
    if (value === 'recharge') {
      this.getRechargeList(1, '', '全部');
    } else if (value === 'withdraw') {
      this.getWithdrawList(1, '', '全部');
    } else if (value === 'transfer') {
      this.getTransferList(1, '', '全部');
    } else {
      this.getTransferAccountList(1, '', '全部');
    }
  };

  getTransferAccountList = (page, coinId, symbol) => {
    this.setState({ transferAccountList: null, transferAccountPage: page });
    let mCoinId = symbol === '全部' ? '' : coinId;
    request('/offline/change/myList', {
      method: 'POST',
      body: {
        coinId: mCoinId,
        currentPage: page,
        showCount: 10
      }
    }).then(json => {
      if (json.code === 10000000) {
        let transferAccountList = [];
        if (json.data.list) {
          transferAccountList = json.data.list.map(item => {
            item.key = item.id;
            return item;
          });
        }
        this.setState({
          transferAccountList,
          transferAccountTotal: json.data.count
        });
      }
    });
  };

  // 取消
  cancelClick = record => {
    request(`/coin/volume/cancel/${record.id}`, {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        message.success(json.msg);
        const { coinList, symbol, withdrawPage } = this.state;
        const coinId = coinList.filter(item => {
          return item.name === symbol;
        })[0].id;
        this.getWithdrawList(withdrawPage, coinId, symbol);
      }
    });
  };

  // 提币记录 点击详情
  detailClick = record => {
    const { expendRow } = this.state;
    if (expendRow && expendRow.id === record.id) {
      this.setState({ expendRow: null });
    } else {
      this.setState({ expendRow: record });
    }
  };

  handleActionSheetHide = e => {
    if (e.target.className && e.target.className.indexOf('action-sheet') !== -1) {
      this.setState({ expendRow: null });
    }
  };

  coinSelect = value => {
    const { currentTab, coinList } = this.state;
    const coinId = coinList.filter(item => {
      return item.name === value;
    })[0].id;

    this.setState({ symbol: value, withdrawPage: 1 });

    if (currentTab === 'recharge') {
      this.getRechargeList(1, coinId, value);
    } else if (currentTab === 'withdraw') {
      this.getWithdrawList(1, coinId, value);
    } else if (currentTab === 'transfer') {
      this.getTransferList(1, coinId, value);
    } else {
      this.getTransferAccountList(1, coinId, value);
    }
  };

  rechargePageChange = page => {
    const { symbol, coinList } = this.state;
    const coinId = coinList.filter(item => {
      return item.name === symbol;
    })[0].id;
    this.getRechargeList(page, coinId, symbol);
  };

  withdrawPageChange = page => {
    const { symbol, coinList } = this.state;
    const coinId = coinList.filter(item => {
      return item.name === symbol;
    })[0].id;
    this.setState({ withdrawPage: page });
    this.getWithdrawList(page, coinId, symbol);
  };

  transferPageChange = page => {
    const { symbol, coinList } = this.state;
    const coinId = coinList.filter(item => {
      return item.name === symbol;
    })[0].id;
    this.getTransferList(page, coinId, symbol);
  };
  tranAccountPageChange = page => {
    const { symbol, coinList } = this.state;
    const coinId = coinList.filter(item => {
      return item.name === symbol;
    })[0].id;
    this.getTransferAccountList(page, coinId, symbol);
  };

  render() {
    const { localization, viewport } = this.props;

    const {
      symbol,
      coinList,
      currentTab,

      rechargeList,
      rechargeTotal,
      rechargePage,

      withdrawList,
      withdrawPage,
      withdrawTotal,

      transferList,
      transferTotal,
      transferPage,

      transferAccountList,
      transferAccountTotal,
      transferAccountPage,

      expendRow
    } = this.state;

    const rechargeColumns = [
      {
        title: localization['时间'],
        dataIndex: 'createDate',
        key: 'createDate',
        render: text => stampToDate(text * 1)
      },
      {
        title: localization['币种'],
        dataIndex: 'coinSymbol',
        key: 'coinSymbol'
      },
      {
        title: localization['类型'],
        dataIndex: 'type',
        key: 'type',
        render: () => localization['充币']
      },
      {
        title: localization['数量'],
        dataIndex: 'volume',
        key: 'volume',
        render: text => Number(text).toFixed(8)
      },
      {
        title: localization['状态'],
        dataIndex: 'status',
        key: 'status',
        render: text => localization[text === 0 ? '确认中' : '已成功']
      }
    ];

    const withdrawColumns = [
      {
        title: localization['时间'],
        dataIndex: 'createDate',
        key: 'createDate',
        render: text => stampToDate(text * 1)
      },
      {
        title: localization['币种'],
        dataIndex: 'coinSymbol',
        key: 'coinSymbol'
      },
      {
        title: localization['类型'],
        dataIndex: 'type',
        key: 'type',
        render: () => localization['提币']
      },
      {
        title: localization['数量'],
        dataIndex: 'volume',
        key: 'volume',
        render: text => Number(text).toFixed(8)
      },
      {
        title: localization['状态'],
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => {
          let myNote = {
            0: (
              <Button type="primary" onClick={this.cancelClick.bind(this, record)}>
                {localization['取消']}
              </Button>
            ),
            1: '审核通过',
            2: '审核不通过',
            3: '已汇出',
            8: '预处理',
            9: '已取消'
          };

          return typeof myNote === 'string' ? localization[myNote[text]] : myNote[text];
        }
      },
      {
        title: localization['操作'],
        dataIndex: 'updateDate',
        key: 'updateDate',
        render: (text, record) => {
          return (
            <div
              onClick={this.detailClick.bind(this, record)}
              style={{ cursor: 'pointer', color: 'var(--primary-color)' }}
            >
              {localization['详情']}
            </div>
          );
        }
      }
    ];

    const transferColumns = [
      {
        title: localization['时间'],
        dataIndex: 'createDate',
        key: 'createDate',
        render: text => stampToDate(text * 1)
      },
      {
        title: localization['币种'],
        dataIndex: 'coinSymbol',
        key: 'coinSymbol'
      },
      {
        title: localization['类型'],
        dataIndex: 'type',
        key: 'type',
        render: text => {
          const showText = {
            0: '常规账户转入到c2c',
            1: 'c2c转入到常规账户',
            3: 'c2c转入到手续费预备金',
            4: '手续费预备金转入到c2c',
            5: '常规账户转入到手续费预备金',
            6: '手续费预备金转入到常规账户',
            7: '注册抽奖所得',
            8: '推荐的会员注册抽奖奖励',
            9: '手续费返还',
            11: '常规账户转入超级钱包',
            12: '超级钱包转出到常规账户',
            20: '常规转户转入到挖矿部落',
            21: '挖矿部落转出到常规账户'
          };
          return <div>{localization[showText[text]]}</div>;
        }
      },
      {
        title: localization['数量'],
        dataIndex: 'volume',
        key: 'volume'
      },
      {
        title: localization['违约金'],
        dataIndex: 'feeVolume',
        key: 'feeVolume'
      },
      {
        title: localization['状态'],
        dataIndex: 'status',
        key: 'status',
        render: () => localization['成功']
      }
    ];

    const transferAccountColumns = [
      {
        title: localization['时间'],
        dataIndex: 'createDate',
        key: 'createDate',
        render: text => {
          return <div>{stampToDate(text * 1)}</div>;
        }
      },
      {
        title: localization['单号'],
        dataIndex: 'changeNo',
        key: 'changeNo'
      },
      {
        title: localization['币种'],
        dataIndex: 'coinSymbol',
        key: 'coinSymbol'
      },
      {
        title: localization['类型'],
        dataIndex: 'type',
        key: 'type',
        render: text => {
          const textMap = {
            0: localization['转入'],
            1: localization['转出'],
            2: localization['红包支出'],
            3: localization['红包收入'],
            4: localization['红包退回']
          };
          return <div>{textMap[text]}</div>;
        }
      },
      {
        title: localization['数量'],
        dataIndex: 'volume',
        key: 'volume'
      },
      {
        title: localization['手续费'],
        dataIndex: 'fee',
        key: 'fee'
      },
      {
        title: localization['对方账号'],
        dataIndex: 'otherAccount',
        key: 'otherAccount'
      },
      {
        title: localization['对方姓名'],
        dataIndex: 'otherRealName',
        key: 'otherRealName'
      },
      {
        title: localization['状态'],
        dataIndex: 'status',
        key: 'status',
        render: () => localization['成功']
      }
    ];

    // loading
    const loading = spinning => ({
      loading: {
        spinning,
        indicator: <Loading />
      }
    });

    const CoinSelect = (
      <Select
        style={{ width: 100 }}
        value={symbol}
        getPopupContainer={() => document.querySelector(`.${styles.finance}`)}
        onChange={this.coinSelect}
      >
        {coinList.map(item => {
          return (
            <Option key={item.id} value={item.name}>
              {item.name === '全部' ? localization[item.name] : item.name}
            </Option>
          );
        })}
      </Select>
    );

    const tabsProps = {
      value: currentTab,
      onChange: this.tabChange
    };

    const commonProps = {
      locale: { emptyText: <Empty {...{ localization }} /> }
    };

    const rechargeProps = {
      dataSource: rechargeList,
      columns: rechargeColumns,
      ...loading(!rechargeList),
      ...commonProps,
      pagination: {
        current: rechargePage,
        total: rechargeTotal,
        pageSize: 10,
        onChange: this.rechargePageChange
      }
    };

    const withdrawProps = {
      dataSource: withdrawList,
      columns: withdrawColumns,
      ...loading(!withdrawList),
      ...commonProps,
      pagination: {
        current: withdrawPage,
        total: withdrawTotal,
        pageSize: 10,
        onChange: this.withdrawPageChange
      }
    };

    const transferProps = {
      dataSource: transferList,
      columns: transferColumns,
      ...loading(!transferList),
      ...commonProps,
      pagination: {
        current: transferPage,
        total: transferTotal,
        pageSize: 10,
        onChange: this.transferPageChange
      }
    };

    const transferAccountProps = {
      dataSource: transferAccountList,
      columns: transferAccountColumns,
      ...loading(!transferAccountList),
      ...commonProps,
      pagination: {
        current: transferAccountPage,
        total: transferAccountTotal,
        pageSize: 10,
        onChange: this.tranAccountPageChange
      }
    };

    if (viewport.width > 767) {
      tabsProps.tabBarExtraContent = CoinSelect;
      withdrawProps.expandedRowKeys = [expendRow ? expendRow.id : ''];
      withdrawProps.expandedRowRender = record => (
        <WithdrawDetail {...{ record, localization, viewport, styles }} />
      );
    } else {
      const commonAttr = {
        fixed: 'left',
        width: 120
      };
      rechargeColumns[0] = {
        ...rechargeColumns[0],
        ...commonAttr
      };
      withdrawColumns[0] = {
        ...withdrawColumns[0],
        ...commonAttr
      };
      transferColumns[0] = {
        ...transferColumns[0],
        ...commonAttr
      };
      transferAccountColumns[0] = {
        ...transferAccountColumns[0],
        ...commonAttr
      };
      rechargeProps.scroll = { x: 600 };
      withdrawProps.scroll = { x: 620 };
      transferProps.scroll = { x: 600 };
      transferAccountProps.scroll = { x: 900 };
    }

    return (
      <div className={styles.finance}>
        {viewport.width < 768 && <div className={styles.coinSelect}>{CoinSelect}</div>}
        <Tabs {...tabsProps}>
          <TabPane tab={localization['充币记录']} key="recharge">
            <Table {...rechargeProps} />
          </TabPane>
          <TabPane tab={localization['提币记录']} key="withdraw">
            <Table {...withdrawProps} />
          </TabPane>
          <TabPane tab={localization['划转记录']} key="transfer">
            <Table {...transferProps} />
          </TabPane>
          <TabPane tab={localization['转账记录']} key="tranAccount">
            <Table {...transferAccountProps} />
          </TabPane>
        </Tabs>
        {viewport.width < 678 && (
          <Fragment>
            <div
              className={classnames({
                'action-sheet-mask': true,
                show: expendRow
              })}
              onClick={this.handleActionSheetHide}
            />
            <WithdrawDetail
              {...{
                styles,
                viewport,
                localization,
                show: expendRow,
                record: expendRow
              }}
            />
          </Fragment>
        )}
      </div>
    );
  }
}

export default Finance;

const WithdrawDetail = ({ record, localization, styles, viewport, show }) => {
  const actionSheet = viewport.width < 678;
  return (
    <div
      className={classnames({
        [styles.withdrawExpend]: true,
        'action-sheet': actionSheet,
        show
      })}
    >
      {record
        ? (() => {
            let { updateDate, fee, address, txId } = record;
            return (
              <ul>
                <li>
                  <div>
                    <span className={styles.title}>{localization['钱包处理时间']}：</span>
                    {updateDate && stampToDate(updateDate * 1)}
                  </div>
                  <div>
                    <span className={styles.title}>{localization['手续费']}：</span>
                    {(fee * 1).toFixed(8)}
                  </div>
                </li>
                <li>
                  <div>
                    <span className={styles.title}>{localization['提币地址']}：</span>
                    {address}
                  </div>
                  <div>
                    <span className={styles.title}>
                      {localization['区块链交易']}
                      ID：
                    </span>
                    {txId}
                  </div>
                </li>
              </ul>
            );
          })()
        : null}
    </div>
  );
};
