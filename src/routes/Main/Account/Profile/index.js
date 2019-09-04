import React, { PureComponent, Fragment } from 'react';
import { Link } from 'dva/router';

import styles from './index.less';

class Profile extends PureComponent {
  render() {
    const { localization, account } = this.props;
    const { realName, inviteCode, referInviteCode, createTime, mobile, mail } = account;
    return (
      <div className={styles.profile}>
        <div className={styles.category}>
          <h3>{localization['基本资料']}</h3>
          <dl>
            <dt>{localization['姓名']}：</dt>
            <dd>
              <span>
                {realName || (
                  <Fragment>
                    {localization['暂未实名']}
                    <Link to="/account/certification" style={{ paddingLeft: 10 }}>
                      {localization['去实名']}
                    </Link>
                  </Fragment>
                )}
              </span>
            </dd>
            <dt>{localization['邀请码']}：</dt>
            <dd>
              <span>{inviteCode}</span>
            </dd>
            <dt>{localization['推荐人']}：</dt>
            <dd>
              <span>{referInviteCode || '-----'}</span>
            </dd>
            <dt>{localization['注册时间']}：</dt>
            <dd>
              <span>{createTime || '0000-00-00 00:00:00'}</span>
            </dd>
          </dl>
        </div>
        <div className={styles.category}>
          <h3>
            {localization['其它信息']}
            <Link to="/account/security">{localization['去修改']}</Link>
          </h3>
          <dl>
            <dt>{localization['手机号']}：</dt>
            <dd>
              <span>{mobile || localization['暂未绑定']}</span>
            </dd>
            <dt>{localization['邮箱']}：</dt>
            <dd>
              <span>{mail || localization['暂未绑定']}</span>
            </dd>
          </dl>
        </div>
      </div>
    );
  }
}

export default Profile;
