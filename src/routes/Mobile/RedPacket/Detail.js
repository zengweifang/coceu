import React, { PureComponent } from 'react';
import classnames from 'classnames';
import MC from 'mcanvas';
import QRCode from 'qrcode.react';
import { stampToDate } from 'utils';
import request from 'utils/request';

import styles from './detail.less';

import logo from 'assets/images/redpacket/logo_ues_2.svg';
import share from 'assets/images/redpacket/share.svg';
import best from 'assets/images/redpacket/best.svg';
import shareBg from 'assets/images/redpacket/share_bg.png';
import close from 'assets/images/redpacket/close.svg';

class Detail extends PureComponent {
  state = {
    shareImg: '',
    redEnvelopeViewVO: {},
    redEnvelopeSubViewVOList: []
  };

  componentDidMount() {
    if (this.props.isLogin) {
      const { id } = this.props.match.params;
      request(`/red/envelope/detail/${id}`, { method: 'GET' }).then(json => {
        if (json.code === 10000000) {
          const { redEnvelopeViewVO, redEnvelopeSubViewVOList } = json.data;
          this.setState({
            redEnvelopeViewVO: redEnvelopeViewVO || {},
            redEnvelopeSubViewVOList: redEnvelopeSubViewVOList || []
          });
        }
      });
    }
  }

  handleCloseShare = () => {
    this.setState({ shareImg: '' });
  };

  drawShareImg = () => {
    const qrcodeImg = document.querySelector('#qrcode').toDataURL();
    const mc = new MC({
      width: 279,
      height: 388
    });

    mc.background(shareBg, {
      left: 0,
      top: 0,
      type: 'contain'
    })
      .add(qrcodeImg, {
        width: 110,
        pos: {
          x: 85,
          y: 200
        }
      })
      .draw(b64 => {
        this.setState({ shareImg: b64 });
      });
  };

  render() {
    const { id } = this.props.match.params;
    const { shareImg, redEnvelopeViewVO, redEnvelopeSubViewVOList } = this.state;
    const {
      status,
      volume,
      realName,
      bestWith,
      coinSymbol,
      isReceived,
      totalNumber,
      receiveNumber,
      receiveVolume,
      myReceiveVolume
    } = redEnvelopeViewVO;
    const mapStatus = {
      0: '领取中',
      1: '已领完',
      2: '已结束'
    };
    console.log(redEnvelopeSubViewVOList);
    return (
      <div className={styles.detail}>
        <header>
          <h2>环球红包</h2>
          <img src={logo} alt="UES" />
          <h4>{realName}的红包</h4>
          <h5>{bestWith}</h5>
        </header>
        {isReceived === '1' && (
          <div className={styles.result}>
            <h3>
              <strong>{myReceiveVolume}</strong>
              <span>{coinSymbol}</span>
            </h3>
            已存入C2C账户
          </div>
        )}
        <div className={styles.cont}>
          <h4 className={styles.status}>
            {mapStatus[status]}
            {isReceived === '1' && (
              <span className={styles.total}>
                已领取{receiveNumber}/{totalNumber}个，共{receiveVolume}/{volume} {coinSymbol}
              </span>
            )}
          </h4>
          <img className={styles.share} src={share} alt="分享UES红包" onClick={this.drawShareImg} />
          <ul className={styles.list}>
            {redEnvelopeSubViewVOList.map(item => {
              return (
                <li key={item.updateDate}>
                  <div className={styles.left}>
                    <h3>{item.realName}</h3>
                    <span>{stampToDate(item.updateDate * 1, 'YYYY-MM-DD hh:mm')}</span>
                  </div>
                  <div
                    className={classnames({
                      [styles.right]: true,
                      [styles.best]: item.isBest === '1'
                    })}
                  >
                    <h3>
                      {item.volume} {item.coinSymbol}
                    </h3>
                    <span>
                      {item.isBest === '1' && <img src={best} alt="best UES" />}
                      价值 {item.price} 元
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <QRCode
          size={100}
          id="qrcode"
          style={{ display: 'none' }}
          value={`${window.location.origin}/mobile/redpacket/${id}`}
        />
        <div className={classnames({ [styles.shareLayer]: true, [styles.show]: shareImg })}>
          {shareImg && (
            <div className={styles.box}>
              <img
                className={styles.close}
                src={close}
                alt="UES关闭分享"
                onClick={this.handleCloseShare}
              />
              <img src={shareImg} alt="UES 红包分享" />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Detail;
