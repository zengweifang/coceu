import React, { Component } from 'react';
import { Input, Select, Button, message } from 'antd';
import { withRouter } from 'react-router-dom';
import request from 'utils/request';
import Validate from './Validate';
import classnames from 'classnames';

import styles from './withdraw.less';

const Option = Select.Option;

class Withdraw extends Component {
  state = {
    myCoinCount: '',
    address: '',
    fee: 0,
    popup: '',
    vmodal: '',
    tag: ''
  };

  closeModal = () => {
    this.setState({ vmodal: '' });
  };

  withdrawClick = () => {
    console.log(this.props)
    const { localization, coinType, viewport } = this.props;
    const { myCoinCount, address, tag } = this.state;
    if (address && address.length > 64) {
      return message.error(localization['地址不能超过64位']);
    }
    if (!address) {
      return message.error(localization['地址不能为空']);
    }
    if (coinType === '4' && !tag) {
      return message.error(localization['备注不能为空']);
    }
    if (!myCoinCount) {
      return message.error(localization['数量不能为空']);
    }
    this.submitWithdraw(json => {
      if (json.code === 10000000) {
        let id = json.data;
        this.setState({
          popup: (
            <Validate
              id={id}
              cancelClick={() => {
                this.setState({ popup: '' });
              }}
              okClick={() => {
                this.setState({ popup: '' });
                const { name, withdrawFee } = this.props;
                const myVolume = myCoinCount - withdrawFee;
                this.props.history.push('/account/status', { name, myVolume, address });
              }}
              localization={localization}
              viewport={viewport}
            />
          )
        });
      } else {
        message.error(json.msg);
      }
    });
  };

  submitWithdraw = callback => {
    const { id, name, coinType } = this.props;
    let { address, myCoinCount, tag } = this.state;

    const tagParams = {};
    if (coinType === '4') {
      tagParams.tag = tag;
    }
    request('/coin/volume/withdraw', {
      method: 'POST',
      body: {
        coinId: id,
        symbol: name,
        address: address,
        volume: myCoinCount,
        ...tagParams
      }
    }).then(json => {
      callback(json);
    });
  };

  addressOnChange = value => {
    this.setState({ address: value });
  };

  tagChange = e => {
    const tag = e.target.value;
    this.setState({ tag });
  };

  countChange = e => {
    let value = e.target.value;
    if (/^\d*\.{0,1}\d{0,8}$/.test(value) && value.length < 16) {
      this.setState({ myCoinCount: value });
    }
  };

  render() {
    const {
      name,
      show,
      volume,
      viewport,
      coinType,
      withdrawFee,
      localization,
      withdrawMaxVolume,
      withdrawMinVolume,
      withdrawAddressList
    } = this.props;
    let { myCoinCount, address, tag } = this.state;

    let lastCount = myCoinCount - withdrawFee;
    if (isNaN(lastCount)) {
      lastCount = 0;
    } else if (lastCount > 0) {
      lastCount = lastCount.toFixed(8);
    } else {
      lastCount = 0;
    }

    const actionSheet = viewport.width < 678;

    return (
      <div
        className={classnames({
          [styles.withdraw]: true,
          'action-sheet': actionSheet,
          show
        })}
      >
        <div className={styles.title}>{localization['提币地址']}</div>
        <div>
          <Select
            style={{ width: '100%' }}
            onChange={this.addressOnChange}
            size="large"
            value={address}
            mode="combobox"
          >
            {withdrawAddressList &&
              withdrawAddressList.map(item => {
                return (
                  <Option key={item.address} value={item.address}>
                    {item.address}
                  </Option>
                );
              })}
          </Select>
        </div>
        {coinType === '4' && <div className={styles.title}>{localization['备注']}</div>}
        {coinType === '4' && (
          <div>
            <Input
              placeholder={localization['备注']}
              onChange={this.tagChange}
              value={tag}
              size="large"
            />
          </div>
        )}
        <ul className={styles.top}>
          <li className={styles.title}>{localization['数量']}</li>
          <li className={styles.title}>
            {localization['可用']}： <span className={styles.restNumber}>{volume}</span>
            {localization['限额']}：{' '}
            <span className={styles.limiteNumber}>{withdrawMaxVolume}</span>
          </li>
        </ul>
        <Input
          placeholder={localization['数量']}
          onChange={this.countChange}
          value={myCoinCount}
          size="large"
        />

        <ul className={styles.count}>
          <li>
            <div className={styles.title}>{localization['手续费']}</div>
            <div className={styles.money}>
              <Input disabled size="large" value={withdrawFee} />
              <span>{name}</span>
            </div>
          </li>
          <li>
            <div className={styles.title}>{localization['到账数量']}</div>
            <div className={styles.number}>
              <Input disabled size="large" value={lastCount} />
              <span>{name}</span>
            </div>
          </li>
        </ul>
        <div className={styles.block}>
          <ul>
            <li>
              <h3>{localization['温馨提示']}</h3>
            </li>
            {coinType === '4' && (
              <li>{localization['备注和地址必须填写，否则无法转账，甚至造成损失']}</li>
            )}
            <li>
              {localization['最小提币数量为']}：
              <span className={styles.minWithdraw}>{withdrawMinVolume}</span>
              {name}
            </li>
            <li>
              {
                localization[
                '为保障资金安全，当您账户安全策略变更，密码修改，使用新地址提币。我们会对你提笔币进行人工审核，请耐心等待工作人员电话或邮件联系。'
                ]
              }
            </li>
            <li>{localization['请务必确认电脑及浏览器安全，防止信息被篡改或泄漏。']}</li>
          </ul>
          <div className={styles.btn}>
            <Button onClick={this.withdrawClick} type="primary" size="large" style={{ width: 100 }}>
              {localization['提币']}
            </Button>
          </div>
        </div>
        {this.state.popup}
        {this.state.vmodal}
      </div>
    );
  }
}

export default withRouter(Withdraw);
