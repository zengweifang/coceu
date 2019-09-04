import React, { PureComponent, Fragment } from 'react';
import { Modal, Icon } from 'antd';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import request from 'utils/request';

import styles from './index.less';

import logo from 'assets/images/redpacket/logo_ues.svg';
import openImg from 'assets/images/redpacket/open.svg';
import openingImg from 'assets/images/redpacket/opening.svg';

class RedPacket extends PureComponent {
  state = {
    opening: false,
    redpacketInfo: {}
  };

  componentDidMount() {
    if (this.props.isLogin) {
      const { id } = this.props.match.params;
      request(`/red/envelope/view`, {
        method: 'GET',
        body: { redEnvelopeId: id }
      }).then(json => {
        if (json.code === 10000000) {
          this.setState({ redpacketInfo: json.data });
        }
      });
    } else {
      Modal.info({
        centered: true,
        title: '温馨提示',
        content: '您还没有登录，需登录才能拆UES红包',
        okText: '去登录',
        onOk: () => {
          this.props.history.push('/mobile/login');
        }
      });
    }
  }

  componentDidUpdate() {
    if (!this.props.isLogin && !document.querySelector('.ant-modal-mask')) {
      Modal.info({
        centered: true,
        title: '温馨提示',
        content: '您还没有登录，需登录才能拆UES红包',
        okText: '去登录',
        onOk: () => {
          this.props.history.push('/mobile/login');
        }
      });
    }
  }

  handleOpen = () => {
    this.setState({ opening: true });
    const { id } = this.props.match.params;
    const { redpacketInfo } = this.state;
    request(`/red/envelope/open`, {
      body: { redEnvelopeId: id },
      customMsg: true
    }).then(json => {
      setTimeout(() => {
        if (json.code === 10000000) {
          this.setState({ redpacketInfo: json.data });
        } else {
          const mapCodeToStatus = {
            10007001: '3', // 未在红包活动时间范围内
            10007002: '2', // 红包已过期
            10007003: '1' // 已领取完 /手慢了
          };
          this.setState({
            redpacketInfo: {
              ...redpacketInfo,
              status: mapCodeToStatus[json.code]
            }
          });
        }
      }, 1000);
    });
  };

  render() {
    const { match, viewport } = this.props;
    const { opening, redpacketInfo } = this.state;
    const { realName, remark, bestWith, isReceived, status, volume, coinSymbol } = redpacketInfo;
    return (
      <div className={styles.redpacket}>
        <div className={styles.box} style={{ height: viewport.width * 1.3 + 'px' }}>
          <div className={styles.top}>
            <header className={styles.header}>
              <img src={logo} alt="ues" />
              <h3>{realName}</h3>
              {isReceived === '1' || status !== '0' ? bestWith : remark}
            </header>
            <div className={styles.feedback}>
              {(() => {
                if (isReceived === '1') {
                  return (
                    <Fragment>
                      <strong>{volume}</strong>
                      {coinSymbol}
                    </Fragment>
                  );
                } else {
                  const mapStatus = {
                    1: '手慢了，红包已被抢光',
                    2: '红包已结束',
                    3: '未在红包活动时间范围内'
                  };
                  return mapStatus[status];
                }
              })()}
            </div>
          </div>
          {isReceived === '0' && status === '0' && (
            <div
              className={classnames({ [styles.handler]: true, [styles.opening]: opening })}
              onClick={this.handleOpen}
            >
              <img className={styles.front} src={opening ? openingImg : openImg} alt="红包" />
            </div>
          )}
          {(isReceived === '1' || status !== '0') && (
            <Link className={styles.view} to={`${match.url}/detail`}>
              查看领取详情 <Icon type="right" />
            </Link>
          )}
        </div>
      </div>
    );
  }
}

export default RedPacket;
