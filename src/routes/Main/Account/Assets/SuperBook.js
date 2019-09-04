import React, { PureComponent } from 'react';
import { Button } from 'antd';
import classnames from 'classnames';

import styles from './recharge.less';

class SuperBook extends PureComponent {
  render() {
    const { show, localization, viewport, bookAddress } = this.props;
    const actionSheet = viewport.width < 678;
    return (
      <div
        className={classnames({
          [styles.recharge]: true,
          'action-sheet': actionSheet,
          show
        })}
      >
        <div>{localization['账本地址']}</div>
        <ul className={styles.address}>
          <li className={styles.reAddress}>{bookAddress}</li>
          <li>
            <Button
              type="primary"
              className="copy-btn"
              data-address={bookAddress}
              data-clipboard-text={bookAddress}
            >
              {localization['复制地址']}
            </Button>
          </li>
        </ul>
        <h4>{localization['温馨提示']}</h4>
        <ul>
          <li>{localization['该地址区别于充币地址，仅用于超级账本查询使用。']}</li>
          <li>{localization['请勿向上面地址充值任何资产，否则资产将不可找回。']}</li>
          <li>{localization['请务必确认电脑及浏览器安全，防止信息被篡改或泄漏。']}</li>
        </ul>
      </div>
    );
  }
}
export default SuperBook;
