import React, { PureComponent } from 'react';
import { Button } from 'antd';
import QRCode from 'qrcode.react';
import classnames from 'classnames';

import styles from './recharge.less';

class Recharge extends PureComponent {
  state = {
    showQrcode: false
  };

  render() {
    const { showQrcode } = this.state;
    const { name, show, localization, viewport, rechargeTag, rechargeAddress } = this.props;
    return (
      <div
        className={classnames({
          [styles.recharge]: true,
          'action-sheet': viewport.width < 678,
          show
        })}
      >
        {rechargeTag && (
          <div className={styles.rechargeAccount}>
            备注<span>{rechargeTag}</span>
          </div>
        )}
        <div>{localization['充币地址']}</div>
        <ul className={styles.address}>
          <li className={styles.reAddress}>{rechargeAddress}</li>
          <li>
            <Button
              type="primary"
              className="copy-btn"
              data-address={rechargeAddress}
              data-clipboard-text={rechargeAddress}
            >
              {localization['复制地址']}
            </Button>
          </li>
          <li className={styles.qrcode}>
            <div>
              <Button
                type="primary"
                className={styles.text}
                onClick={() => {
                  if (rechargeAddress) {
                    this.setState({ showQrcode: !showQrcode });
                  }
                }}
              >
                {localization['显示二维码']}
              </Button>
            </div>
            {showQrcode && (
              <div className={styles.qrcon}>
                <QRCode
                  value={rechargeAddress}
                  size={110}
                  bgColor={'#ffffff'}
                  fgColor={'#000000'}
                  level={'L'}
                />
              </div>
            )}
          </li>
        </ul>
        <h4>{localization['温馨提示']}</h4>
        <ul>
          {rechargeTag && <li>{localization['备注和地址必须填写，否则无法转账，甚至造成损失']}</li>}
          <li>
            {localization['请勿向上述地址充值任何非']} {name}{' '}
            {localization['资产，否则资产将不可找回']}
          </li>
          <li>
            {
              localization[
                '您充值至上述地址后，需要整个网络节点的确认，1次网络确认后到账，6次网络确认后可提币'
              ]
            }
          </li>
          <li>
            {
              localization[
                '您的充值地址不会经常改变，可以重复充值，若有更改，我们会尽量通过网站公告或邮件通知你'
              ]
            }
          </li>
          <li>{localization['请务必确认电脑及浏览器安全，防止信息被篡改或泄漏']}</li>
        </ul>
      </div>
    );
  }
}
export default Recharge;
