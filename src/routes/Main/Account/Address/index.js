import React, { PureComponent } from 'react';
import { Input, Select, Button, Table, Popconfirm, message } from 'antd';
import { Loading, Empty } from 'components/Placeholder';
import request from 'utils/request';

import styles from './index.less';

const Option = Select.Option;

class Address extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currencys: [],
      list: null,
      symbol: '',
      address: '',
      remark: ''
    };
  }

  componentDidMount() {
    this.getCoinList();
    this.getAddress();
  }

  // 获取地址
  getAddress = () => {
    request('/withdraw/address/list', {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        let list = json.data.map(item => {
          const { id, coinSymbol, address, tag, type } = item;
          return { key: id, id, coinSymbol, address, tag, type };
        });
        this.setState({ list });
      }
    });
  };

  //获取币列表
  getCoinList = () => {
    request('/coin/list', {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        let myData = json.data.map(item => {
          const { id, name } = item;
          return { id, name };
        });
        this.setState({ currencys: json.data, symbol: myData[0].name });
      }
    });
  };

  delete = id => {
    const { localization } = this.props;
    request('/withdraw/address/delete/' + id, {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        message.success(localization['删除成功'], 1);
        let list = this.state.list.filter(item => {
          return item.id !== id;
        });
        this.setState({ list });
      }
    });
  };

  add = (coinId, symbol, address, tag) => {
    const { localization } = this.props;
    request('/withdraw/address/add', {
      body: {
        coinId,
        symbol,
        address,
        tag
      }
    }).then(json => {
      if (json.code === 10000000) {
        message.success(localization['添加成功'], 1);
        this.getAddress();
        this.setState({ address: '', remark: '' });
      }
    });
  };

  addClick = () => {
    const { localization } = this.props;
    let { currencys, address, symbol, remark } = this.state;
    let coinId = '';
    if (currencys.length > 0) {
      coinId = currencys.filter(item => {
        return item.name === symbol;
      })[0].id;
    }
    if (address) {
      if (remark) {
        this.add(coinId, symbol, address, remark);
      } else {
        message.destroy();
        message.info(localization['请输入备注']);
      }
    } else {
      message.destroy();
      message.info(localization['请输入地址']);
    }
  };

  deleteClick = record => {
    this.delete(record.id);
  };

  handleChange = value => {
    this.setState({ symbol: value });
  };

  addressChange = e => {
    this.setState({ address: e.target.value });
  };

  remarkChange = e => {
    this.setState({ remark: e.target.value });
  };

  render() {
    const { localization, viewport } = this.props;
    const { currencys, list, symbol, address, remark } = this.state;
    const tableColumns = [
      {
        title: localization['币种'],
        dataIndex: 'coinSymbol',
        key: 'coinSymbol'
      },
      {
        title: localization['提币地址'],
        dataIndex: 'address',
        key: 'address'
      },
      {
        title: localization['备注'],
        dataIndex: 'tag',
        key: 'tag'
      },
      {
        title: localization['操作'],
        dataIndex: 'type',
        key: 'type',
        render: (text, record) => {
          return (
            <Popconfirm
              title={`${localization['你确定要删除']}？`}
              onConfirm={this.deleteClick.bind(this, record)}
              okType="danger"
              okText={localization['确定']}
              cancelText={localization['取消']}
            >
              <span className={styles.delete}>{localization['删除']}</span>
            </Popconfirm>
          );
        }
      }
    ];

    const tableProps = {
      dataSource: list,
      columns: tableColumns,
      pagination: false,
      loading: {
        spinning: !list,
        indicator: <Loading />
      },
      locale: { emptyText: <Empty {...{ localization }} /> }
    };

    if (viewport.width < 768) {
      tableColumns[0] = {
        ...tableColumns[0],
        fixed: 'left',
        width: 90
      };
      tableProps.scroll = { x: 600 };
    }

    return (
      <div className={styles.address}>
        <ul className={styles.attr}>
          <li>
            <h4>{localization['币种']}</h4>
            <Select
              showSearch
              size="large"
              value={symbol}
              onChange={this.handleChange}
              filterOption={(input, option) => {
                return option.props.children.indexOf(input.toUpperCase()) >= 0;
              }}
              getPopupContainer={() => document.querySelector(`.${styles.address}`)}
            >
              {currencys.map(item => {
                return (
                  <Option key={item.id} value={item.name}>
                    {item.name}
                  </Option>
                );
              })}
            </Select>
          </li>
          <li className={styles.item}>
            <h4>{localization['提币地址']}</h4>
            <Input size="large" value={address} onChange={this.addressChange} />
          </li>
          <li className={styles.item}>
            <h4>{localization['备注']}</h4>
            <Input size="large" value={remark} onChange={this.remarkChange} />
          </li>
          <li className={styles.block}>
            <Button type="primary" size="large" onClick={this.addClick}>
              {localization['添加']}
            </Button>
          </li>
        </ul>
        <Table {...tableProps} />
      </div>
    );
  }
}

export default Address;
