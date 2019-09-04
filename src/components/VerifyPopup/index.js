import React, { Component } from 'react';
import { Modal } from 'antd';
import { routerRedux } from 'dva/router';

class VerifyPopup extends Component {
  goToSetting = () => {
    const { dispatch, closePopup } = this.props;
    closePopup();
    dispatch(routerRedux.push('/account/security'));
  };

  render() {
    const { localization, closePopup } = this.props;
    return (
      <Modal
        visible
        centered
        width={400}
        onCancel={closePopup}
        onOk={this.goToSetting}
        cancelText={localization['暂不设置']}
        okText={localization['立即设置']}
      >
        <div className="verification-content">
          <i className="iconfont icon-icon" />
        </div>
        <p className="message">{localization['交易前, 请先设置交易验证方式。']}</p>
      </Modal>
    );
  }
}

export default VerifyPopup;
