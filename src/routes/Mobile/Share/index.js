import React, { PureComponent } from 'react';
import { Button } from 'antd';
import { isWechat, getQueryString } from 'utils';

import styles from './index.less';

class Share extends PureComponent {
  render() {
    const { localization, history } = this.props;
    const realName = getQueryString('realName') || localization['您的朋友'];
    const inviteCode = getQueryString('inviteCode');
    return (
      <div className={styles.share}>
        <div className={styles.header}>
          <h4>
            {realName} {localization['邀请您成为UES交易所的会员']}
          </h4>
        </div>
        <div className={styles.content}>
          {realName}{' '}
          {
            localization[
              '邀请您注册UES交易所, UES平台币等您来领, 注册即领取, 领完即止，赶快来领取吧!'
            ]
          }
        </div>
        <div className={styles.footer}>
          <Button
            block
            type="primary"
            size="large"
            onClick={() => {
              history.push(`/mobile/signup?inviteCode=${inviteCode}`);
            }}
          >
            {localization['马上注册']}
          </Button>
          <Button
            block
            type="primary"
            size="large"
            className={styles.download}
            onClick={() => {
              history.push('/download');
            }}
          >
            {localization['下载']}&nbsp;mgex APP
          </Button>
        </div>
        {isWechat() && <div className={styles.wechatMask}>{localization['请在浏览器打开']}</div>}
      </div>
    );
  }
}

export default Share;
