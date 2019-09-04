import React, { PureComponent } from "react";
import { connect } from "dva";
import { Tabs } from "antd";
import Mobile from "./Mobile";
import Mail from "./Mail";

import styles from "./index.less";
const TabPane = Tabs.TabPane;

@connect(({ signup }) => ({ ...signup }))
class SignUp extends PureComponent {
  render() {
    const { localization } = this.props;
    return (
      <div className={styles.signup}>
        <h2>{localization["用户注册"]}</h2>
        <Tabs defaultActiveKey="mobile">
          <TabPane tab={localization["手机注册"]} key="mobile">
            <Mobile {...this.props} />
          </TabPane>
          <TabPane tab={localization["邮箱注册"]} key="mail">
            <Mail {...this.props} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default SignUp;
