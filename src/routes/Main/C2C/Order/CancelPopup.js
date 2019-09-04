import React, { Component } from "react";
import { Modal, message, Checkbox } from "antd";

import styles from "./popup.less";

class CancelPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false
    };
  }

  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel && onCancel();
  };

  handleOk = () => {
    const { onOk, localization } = this.props;
    const { checked } = this.state;
    if (checked) {
      onOk && onOk();
    } else {
      message.destroy();
      message.error(localization["请先确认是否付款"]);
    }
  };

  render() {
    const { checked } = this.state;
    const { localization } = this.props;
    return (
      <Modal
        title={localization["确认取消订单"]}
        width={440}
        cancelText={localization["我再想想"]}
        okText={localization["确认取消"]}
        centered
        visible={true}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
      >
        <div className={styles.cancelPopup}>
          <p>
            {localization["如果您已经向卖家付款，请千万不要取消交易。取消规则：买家当天累计2笔取消，会限制当日C2C交易功能。"]}
          </p>
          <div>
            <Checkbox
              checked={checked}
              onChange={e => {
                this.setState({ checked: e.target.checked });
              }}
            >
              {localization["我确认还没有付款给对方"]}
            </Checkbox>
          </div>
        </div>
      </Modal>
    );
  }
}

export default CancelPopup;
