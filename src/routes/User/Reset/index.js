import React, { PureComponent } from 'react';
import { Tabs } from 'antd';
import Mobile from './Mobile';
import SendMail from './SendMail';

import styles from './index.less';

const TabPane = Tabs.TabPane;

class Reset extends PureComponent {
  state = {
    currentTab: 'mobile',
    resetConfirm: false
  };

  componentDidMount() {
    const { state } = this.props.history.location;
    if (state && state.mobile) {
      this.setState({ mobile: state.mobile, currentTab: 'mobile' });
    }
  }

  tabChange = key => {
    this.setState({ currentTab: key });
  };

  handleResetConfirm = () => {
    this.setState({ resetConfirm: true });
  };

  render() {
    const { localization } = this.props;
    const { currentTab, resetConfirm } = this.state;

    return resetConfirm ? (
      <div className={styles.wrap}>
        <h2>{localization['重置密码确认']}</h2>
        <p className={styles.text}>
          {
            localization[
              '已向您的注册邮箱发送了一封重置密码邮件，请点击邮件中的链接前去重置登录密码。如果长时间未收到邮件，请尝试在垃圾邮件中查找。'
            ]
          }
        </p>
      </div>
    ) : (
      <div className={styles.wrap}>
        <h2>{localization['找回密码']}</h2>
        <Tabs activeKey={currentTab} onChange={this.tabChange}>
          <TabPane tab={localization['手机找回']} key="mobile">
            <Mobile {...{ localization }} />
          </TabPane>
          <TabPane tab={localization['邮箱找回']} key="mail">
            <SendMail {...{ localization, handleResetConfirm: this.handleResetConfirm }} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default Reset;
