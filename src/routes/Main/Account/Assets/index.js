import React, { PureComponent, Fragment } from 'react';
import { Tabs, Table, Button, Input, message, Modal, Checkbox, Icon } from 'antd';
import { Loading, Empty } from 'components/Placeholder';
import request from 'utils/request';
import Recharge from './Recharge';
import Withdraw from './Withdraw';
import SuperBook from './SuperBook';
import Wallet from './Wallet';
import TransferAccount from './TransferAccount';
import TransferPopup from 'components/TransferPopup';
import WalletPopup from 'components/TransferPopup/Wallet';
import { toNonExponential, stampToDate } from 'utils';
import classnames from 'classnames';
import FreezeModal from './FreezeModal'

import styles from './index.less';

const TabPane = Tabs.TabPane;
const Search = Input.Search;

class Assets extends PureComponent {
  state = {
    modalTit: '',
    showModal: false,
    actionType: '',
    availableC2c: 0,
    handleCoin: null,
    handleVolume: '',
    c2cData: null,
    routineData: null,
    normalAllData: null,
    expandedRow: '',
    expendedFlag: '',
    currencyName: '',
    checked: false,
    freezeData: [],
    popup: null,

    walletData: null,
    walletExpendRowKeys: [],
    walletExpendRow: ''
  };

  componentDidMount() {
    this.getRoutineData();
  }

  inputVolume = e => {
    let value = e.target.value;
    if (/^\d*\.{0,1}\d{0,8}$/.test(value) && value.length < 16) {
      this.setState({ handleVolume: value });
    }
  };

  tabChange = tabKey => {
    if (tabKey === 'routine') {
      this.getRoutineData();
      this.setState({ currencyName: '', expandedRow: '' });
    } else if (tabKey === 'c2c') {
      this.getC2cData();
    } else if (tabKey === 'freeze') {
      this.getFreezeList();
    } else if (tabKey === 'wallet') {
      this.getWalletList();
    }
  };

  getC2cData = () => {
    this.setState({ c2cData: null });
    request('/offline/volume/list', {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        const c2cData = json.data.map(item => {
          item.key = item.coinId;
          item.volume = item.volume || '0.00';
          item.advertVolume = item.advertVolume || '0.000';
          item.lockVolume = item.lockVolume || '0.00';
          item.totalPrice = (
            Number(item.volume) +
            Number(item.advertVolume) +
            Number(item.lockVolume) +
            Number(item.bailVolume)
          ).toFixed(8);
          return item;
        });
        this.setState({ c2cData });
      }
    });
  };

  getRoutineData = () => {
    this.setState({ routineData: null });
    request('/coin/volume/list', {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        const normalAllData = json.data.map(item => {
          let totalPrice = 0;
          let { id, volume, lockVolume, withdrawFee } = item;
          volume = volume || '0.00';
          lockVolume = lockVolume || '0.00';
          totalPrice = Number(volume) + Number(lockVolume);
          withdrawFee = withdrawFee || '0.00';
          return {
            ...item,
            key: id,
            volume,
            lockVolume,
            totalPrice,
            withdrawFee
          };
        });
        const checked = localStorage.getItem('zeroChecked');
        let routineData = normalAllData;
        if (checked && checked === 'true') {
          routineData = normalAllData.filter(item => {
            return item.volume > 0;
          });
          this.setState({ routineData, normalAllData, checked: true });
        } else {
          this.setState({ routineData, normalAllData, checked: false });
        }
      }
    });
  };

  //获取超级钱包
  getWalletList = () => {
    this.setState({ walletData: null });
    request('/super/volume/list', {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        const walletData = json.data.map((item, index) => {
          item.key = item.coinId;
          return item;
        });
        const walletExpendRowKeys = json.data.map((item, index) => {
          const { coinId } = item;
          return coinId;
        });
        this.setState({ walletData, walletExpendRowKeys });
      }
    });
  };

  // 获取冻结账户
  getFreezeList = () => {
    this.setState({ freezeData: null });
    request('/mk2/user/alllock', {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        const freezeData = json.data.map((item, index) => {
          item.key = index;
          return item;
        });
        this.setState({ freezeData });
      }
    });
  };

  // 获取充币地址
  setRechargeAddress = id => {
    request(`/coin/user/address/${id}`, {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        const newRoutineData = this.state.routineData.map(item => {
          if (item.id === id) {
            const coinData = json.data || {}
            const { tag, address } = coinData;
            item.rechargeTag = tag;
            item.rechargeAddress = address;
          }
          return item;
        });
        this.setState({ routineData: newRoutineData });
      }
    });
  };

  // 获取提币地址
  setWithdrawAddressList = id => {
    request(`/withdraw/address/list/${id}`, {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        const newRoutineData = this.state.routineData.map(item => {
          if (item.id === id) {
            item.withdrawAddressList = json.data || [];
          }
          return item;
        });
        this.setState({ routineData: newRoutineData });
      }
    });
  };

  // 获取账本地址
  setBookAddress = name => {
    request(`/super/book/getAddress/${name}`, {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        const newRoutineData = this.state.routineData.map(item => {
          if (item.name === name) {
            item.bookAddress = json.data;
          }
          return item;
        });
        this.setState({ routineData: newRoutineData });
      }
    });
  };

  handleRecharge = record => {
    if (!record.rechargeAddress) {
      this.setRechargeAddress(record.id);
    }
    this.setState({
      expandedRow: record,
      expendedFlag: 'recharge'
    });
  };

  handleWithdraw = record => {
    if (!record.withdrawAddressList) {
      this.setWithdrawAddressList(record.id);
    }
    this.setState({
      expandedRow: record,
      expendedFlag: 'withdraw'
    });
  };

  handleSuperBook = record => {
    if (!record.bookAddress) {
      this.setBookAddress(record.name);
    }
    this.setState({
      expandedRow: record,
      expendedFlag: 'superBook'
    });
  };

  handleActionSheetHide = e => {
    if (e.target.className && e.target.className.indexOf('action-sheet') !== -1) {
      this.setState({ expendedFlag: '' });
    }
  };

  handleSearch = e => {
    let value = e.target.value;
    if (value.length < 16) {
      let { normalAllData, checked } = this.state;
      let routineData = normalAllData;
      if (checked) {
        routineData = normalAllData.filter(item => {
          return item.volume > 0;
        });
      }
      let target = value.toUpperCase();
      routineData = routineData.filter(item => {
        return item.name.indexOf(target) > -1;
      });
      this.setState({ currencyName: value, routineData });
    }
  };

  zeroChange = e => {
    const checked = e.target.checked;
    const { normalAllData, currencyName } = this.state;
    const target = currencyName.toUpperCase();
    let routineData = normalAllData.filter(item => {
      return item.name.indexOf(target) > -1;
    });
    if (checked) {
      routineData = routineData.filter(item => {
        return item.volume > 0;
      });
    }
    this.setState({ checked, routineData });
    localStorage.setItem('zeroChecked', checked);
  };

  triggerAction = ({ type, coin }) => {
    const { localization } = this.props;
    const typeToTit = {
      turnIn: localization['从常规账户转入到C2C账户'],
      turnOut: localization['从C2C账户转出到常规账户']
    };
    let url;
    if (type.indexOf('turn') > -1) {
      url = `/${type === 'turnIn' ? 'coin' : 'offline'}/volume/${coin.coinId}`;
    }
    request(url, {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        if (!json.data) {
          message.info(localization['您没有该币种资产']);
          return;
        }
        this.setState({
          modalTit: typeToTit[type],
          showModal: true,
          actionType: type,
          handleCoin: coin,
          availableC2c: json.data.volume
        });
      }
    });
  };

  turnAction = type => {
    const { localization } = this.props;
    const { handleCoin, handleVolume } = this.state;
    if (handleVolume) {
      request(`/offline/volume/${type.substr(4).toLowerCase()}`, {
        body: {
          coinId: handleCoin.coinId,
          symbol: handleCoin.symbol,
          volume: handleVolume
        },
        customMsg: true
      }).then(json => {
        if (json.code === 10000000) {
          this.getC2cData();
          message.success(localization['操作成功']);
          this.hideModal();
        } else {
          if (type === 'turnOut' && json.code === 10004015) {
            message.error(localization['资产不足']);
          }
        }
      });
    } else {
      message.warn(localization['数量不能为空']);
    }
  };

  hideModal = () => {
    this.setState({
      modalTit: '',
      showModal: false,
      handleVolume: '',
      availableC2c: 0
    });
  };

  allTurnClick = () => {
    const { availableC2c } = this.state;
    if (availableC2c > 0) {
      this.setState({ handleVolume: availableC2c });
    }
  };

  closeModal = () => {
    this.setState({ popup: null });
  };

  showFreezeModal = (record) => {
    const { localization } = this.props;
    const { relationId } = record;
    const freezeProps = {
      localization,
      relationId
    }
    this.setState({
      popup: <FreezeModal
        {...freezeProps}
        onCancel={this.closeModal}
        onOk={() => { }}
      />
    })
  }

  handleTransfer = record => {
    const { localization } = this.props;
    const coinProps = {
      localization,
      coinId: record.coinId,
      symbol: record.symbol,
      pointVolume: record.pointVolume
    };
    this.setState({
      popup: (
        <TransferPopup
          {...coinProps}
          onCancel={this.closeModal}
          onOk={() => {
            this.closeModal();
            this.getC2cData();
          }}
        />
      )
    });
  };

  transferAccount = record => {
    const { localization } = this.props;
    this.setState({
      popup: (
        <TransferAccount
          {...record}
          localization={localization}
          onCancel={this.closeModal}
          onOk={() => {
            this.closeModal();
            this.getC2cData();
          }}
        />
      )
    });
  };

  // 超级钱包转账
  walletTransfer = record => {
    const { localization } = this.props;
    const { coinId, coinSymbol, volume, breakRatio } = record;
    const walletProps = { localization, coinId, symbol: coinSymbol, assert: volume, breakRatio };
    this.setState({
      popup: (
        <WalletPopup
          {...walletProps}
          onCancel={this.closeModal}
          onOk={() => {
            this.closeModal();
            this.getWalletList();
          }}
        />
      )
    });
  };

  showWalletTips = record => {
    this.setState({
      walletExpendRow: record,
      expendedFlag: 'wallet'
    });
  };

  render() {
    const { localization, viewport } = this.props;
    const {
      modalTit,
      showModal,
      actionType,
      availableC2c,
      handleCoin,
      handleVolume,
      c2cData,
      routineData,
      currencyName,
      checked,
      freezeData,
      expendedFlag,
      expandedRow,
      popup,
      walletData,
      walletExpendRowKeys,
      walletExpendRow
    } = this.state;

    const routineColumns = [
      {
        title: localization['资金名称'],
        dataIndex: 'name',
        key: 'name',
        render: text => {
          const type = text.toLowerCase();
          return (
            <Fragment>
              <span className={`${styles.currencyLogo} ${styles[type]}`} />
              {text}
            </Fragment>
          );
        }
      },
      {
        title: localization['可用资金'],
        dataIndex: 'volume',
        key: 'volume',
        render: text => {
          return (
            <Fragment>
              <Icon type="wallet" theme="outlined" className={styles.wallet} />
              {toNonExponential(text, 4)}
            </Fragment>
          );
        }
      },
      {
        title: localization['挂单金额'],
        dataIndex: 'lockVolume',
        render: text => toNonExponential(text, 4)
      },
      {
        title: localization['总计'],
        dataIndex: 'totalPrice',
        key: 'totalPrice',
        render: text => toNonExponential(text, 4)
      },
      {
        title: localization['操作'],
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => (
          <div className={styles.action}>
            {(record.tokenStatus * 1 === 1 || record.tokenStatus * 1 === 2) && (
              <Button type="primary" onClick={this.handleRecharge.bind(this, record)}>
                {localization['充币']}
              </Button>
            )}
            {(record.tokenStatus * 1 === 1 || record.tokenStatus * 1 === 3) && (
              <Button type="primary" onClick={this.handleWithdraw.bind(this, record)}>
                {localization['提币']}
              </Button>
            )}
            {record.showSuperBook * 1 === 1 && (
              <Button type="primary" onClick={this.handleSuperBook.bind(this, record)}>
                {localization['账本地址']}
              </Button>
            )}
          </div>
        )
      }
    ];

    const c2cColumns = [
      {
        title: localization['资金名称'],
        dataIndex: 'symbol',
        key: 'symbol',
        render: (text, record) => {
          const type = text.toLowerCase();
          return (
            <Fragment>
              <span className={`${styles.currencyLogo} ${styles[type]}`} />
              {text}
            </Fragment>
          );
        }
      },
      {
        title: localization['可用资金'],
        dataIndex: 'volume',
        key: 'volume',
        render: (text, record) => {
          return (
            <div className="available-col">
              <Icon type="wallet" theme="outlined" className={styles.wallet} />
              {toNonExponential(text, 8)}
            </div>
          );
        }
      },
      {
        title: localization['广告冻结'],
        dataIndex: 'advertVolume',
        key: 'advertVolume',
        render: text => toNonExponential(text, 8)
      },
      {
        title: localization['交易冻结'],
        dataIndex: 'lockVolume',
        key: 'lockVolume',
        render: text => toNonExponential(text, 8)
      },
      {
        title: localization['手续费预备金'],
        dataIndex: 'bailVolume',
        key: 'bailVolume',
        render: text => {
          return <div>{toNonExponential(text, 8)}</div>;
        }
      },
      {
        title: localization['总计'],
        dataIndex: 'totalPrice',
        key: 'totalPrice',
        render: text => toNonExponential(text, 8)
      },
      {
        title: localization['操作'],
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => (
          <div className={styles.action}>
            <Button type="primary" onClick={this.handleTransfer.bind(this, record)}>
              {localization['资产互转']}
            </Button>
            {record.isChangeAccount === '0' && (
              <Button type="primary" onClick={this.transferAccount.bind(this, record)}>
                {localization['转账']}
              </Button>
            )}
          </div>
        )
      }
    ];

    const freezeColumns = [
      {
        title: localization['币种'],
        dataIndex: 'coinSymbol',
        key: 'coinSymbol',
        render: (text, record) => {
          const type = text.toLowerCase();
          return (
            <div>
              <span className={`${styles.currencyLogo} ${styles[type]}`} />
              {text}
            </div>
          );
        }
      },
      {
        title: localization['冻结类型'],
        dataIndex: 'lockType',
        key: 'lockType',
        render: text => {
          const myText = {
            '1': '充值冻结',
            '2': '广告商冻结',
            '3': '活动奖励冻结'
          };
          return <div>{myText[text] || '其他'}</div>;
        }
      },
      {
        title: localization['冻结总额'],
        dataIndex: 'lockVolume',
        key: 'lockVolume',
        render: text => toNonExponential(text, 8)
      },
      {
        title: localization['累计已释放数量'],
        dataIndex: 'releaseVolume',
        key: 'releaseVolume',
        render: text => toNonExponential(text, 8)
      },
      {
        title: localization['操作'],
        dataIndex: 'operate',
        key: 'operate',
        render: (text, record) => {
          const { releaseVolume } = record;
          if (releaseVolume > 0) {
            return <div>
              <Button type='primary'
                onClick={() => {
                  this.showFreezeModal(record)
                }}>
                {localization['释放详情']}
              </Button>
            </div>;
          } else {
            return <div>----</div>
          }
        }
      },
    ];

    const walletColumns = [
      {
        title: localization['资产名称'],
        dataIndex: 'coinSymbol',
        key: 'coinSymbol'
      },
      {
        title: localization['实际资产'],
        dataIndex: 'volume',
        key: 'volume',
        render: (text, record) => {
          return (
            <div className="available-col">
              <Icon type="wallet" theme="outlined" className={styles.wallet} />
              {toNonExponential(text, 8)}
            </div>
          );
        }
      },
      {
        title: localization['算力'],
        dataIndex: 'minning',
        key: 'minning',
        render: (text, record) => {
          const { volume, multiple } = record;
          return <div> {toNonExponential(volume * multiple, 8)}</div>;
        }
      },
      {
        title: localization['钱包创建时间'],
        dataIndex: 'depositBegin',
        key: 'depositBegin',
        render: text => {
          return <div>{text && stampToDate(text * 1, 'YYYY-MM-DD')}</div>;
        }
      },
      {
        title: localization['到期时间'],
        dataIndex: 'depositEnd',
        key: 'depositEnd',
        render: text => {
          return <div>{text && stampToDate(text * 1, 'YYYY-MM-DD')}</div>;
        }
      },
      {
        title: localization['操作'],
        dataIndex: 'operate',
        key: 'operate',
        render: (text, record) => {
          return (
            <div>
              {viewport.width < 768 && (
                <Button
                  className={styles.walletTips}
                  type="primary"
                  onClick={() => {
                    this.showWalletTips(record);
                  }}
                >
                  {localization['提示']}
                </Button>
              )}
              <Button
                type="primary"
                onClick={() => {
                  this.walletTransfer(record);
                }}
              >
                {localization['资产互转']}
              </Button>
            </div>
          );
        }
      }
    ];

    // 公用props
    const commonProps = {
      pagination: false,
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

    // 常规 props
    const routineProps = {
      dataSource: routineData,
      columns: routineColumns,
      ...loading(!routineData),
      ...commonProps
    };
    // c2c props
    const c2cProps = {
      dataSource: c2cData,
      columns: c2cColumns,
      ...loading(!c2cData),
      ...commonProps
    };
    // 冻结 props
    const freezeProps = {
      dataSource: freezeData,
      columns: freezeColumns,
      ...loading(!freezeData),
      ...commonProps
    };

    // 钱包 this.props
    const walletProps = {
      dataSource: walletData,
      columns: walletColumns,
      ...loading(!walletData),
      ...commonProps
    };

    if (viewport.width < 768) {
      const commonAttr = {
        fixed: 'left',
        width: 100
      };
      routineColumns[0] = {
        ...routineColumns[0],
        ...commonAttr
      };
      c2cColumns[0] = {
        ...c2cColumns[0],
        ...commonAttr
      };
      freezeColumns[0] = {
        ...freezeColumns[0],
        ...commonAttr
      };
      walletColumns[0] = {
        ...walletColumns[0],
        ...commonAttr
      };
      routineProps.scroll = { x: 800 };
      c2cProps.scroll = { x: 1000 };
      freezeProps.scroll = { x: 600 };
      walletProps.scroll = { x: 1000 };
    } else {
      routineProps.expandedRowRender = record => {
        if (expendedFlag === 'recharge') {
          return <Recharge {...{ ...record, localization, viewport }} />;
        } else if (expendedFlag === 'withdraw') {
          return <Withdraw {...{ ...record, localization, viewport }} />;
        } else if (expendedFlag === 'superBook') {
          return <SuperBook {...{ ...record, localization, viewport }} />;
        }
      };
      routineProps.expandedRowKeys = [expandedRow.key];

      //超级钱包
      walletProps.expandedRowRender = record => {
        const { localization, viewport } = this.props;
        const waProps = { localization, viewport, ...record };
        return <Wallet {...waProps} />;
      };
      walletProps.expandedRowKeys = walletExpendRowKeys;
    }

    return (
      <Fragment>
        <Tabs defaultActiveKey="routine" onChange={this.tabChange}>
          <TabPane tab={localization['常规账户']} key="routine">
            <div className={styles.search}>
              <Checkbox onChange={this.zeroChange} checked={checked}>
                {localization['隐藏资产为0的币种']}
              </Checkbox>
              ,<Search value={currencyName} onChange={this.handleSearch} style={{ width: 120 }} />
            </div>
            <Table {...routineProps} />
          </TabPane>
          {/* <TabPane tab={localization['C2C账户']} key="c2c">
            <Table {...c2cProps} />
          </TabPane> */}
          <TabPane tab={localization['冻结账户']} key="freeze">
            <Table {...freezeProps} />
          </TabPane>
        </Tabs>
        <Modal title={modalTit} visible={showModal} onCancel={this.hideModal} footer={null}>
          {(actionType => {
            if (actionType.indexOf('turn') > -1) {
              const actionText = localization[actionType === 'turnIn' ? '转入' : '转出'];
              //转入转出C2C
              return (
                <ul className="c2c-form">
                  <li>
                    <Input
                      addonBefore={localization['币种']}
                      size="large"
                      value={handleCoin.symbol}
                      disabled
                    />
                  </li>
                  <li className="line-li">
                    <Input
                      addonBefore={localization['数量']}
                      size="large"
                      value={handleVolume}
                      onChange={this.inputVolume}
                    />
                  </li>
                  <li className="aviable-symbol">
                    <span
                      onClick={this.allTurnClick}
                      style={{
                        color: 'var(--primary-color)',
                        cursor: 'pointer',
                        marginRight: 16
                      }}
                    >
                      {localization['全部']} {actionText}
                    </span>
                    {localization['可用']}：{availableC2c} {handleCoin.symbol}
                  </li>
                  <li className="c2c-submit">
                    <Button
                      type="primary"
                      size="large"
                      onClick={this.turnAction.bind(this, actionType)}
                    >
                      {actionText}
                    </Button>
                  </li>
                </ul>
              );
            } else if (actionType === 'recharge') {
              return localization['充币'];
            }
          })(actionType)}
        </Modal>
        {viewport.width < 678 && (
          <Fragment>
            <div
              className={classnames({
                'action-sheet-mask': true,
                show: expendedFlag !== ''
              })}
              onClick={this.handleActionSheetHide}
            />
            <Recharge
              {...{
                ...expandedRow,
                localization,
                viewport,
                key: expandedRow.key + 'recharge',
                show: expendedFlag === 'recharge'
              }}
            />
            <Withdraw
              {...{
                ...expandedRow,
                localization,
                viewport,
                key: expandedRow.key + 'withdraw',
                show: expendedFlag === 'withdraw'
              }}
            />
            <SuperBook
              {...{
                ...expandedRow,
                localization,
                viewport,
                key: expandedRow.key + 'superBook',
                show: expendedFlag === 'superBook'
              }}
            />
            <Wallet
              {...{
                ...walletExpendRow,
                localization,
                viewport,
                key: walletExpendRow.key + 'wallet',
                show: expendedFlag === 'wallet'
              }}
            />
          </Fragment>
        )}
        {popup}
      </Fragment>
    );
  }
}

export default Assets;
