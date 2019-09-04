import React, { PureComponent } from "react";
import MyTabs from "../../C2C/MyTabs";
import  "./index.less";

class C2c extends PureComponent {
  render() {
    const { localization } = this.props;
    const myTabsProps = { localization };
    return (
      <div className="account-c2c-wrap">
        <MyTabs {...myTabsProps} />
      </div>
    );
  }
}

export default C2c;
