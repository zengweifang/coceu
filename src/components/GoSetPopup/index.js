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
    const { localization, closePopup, popupType } = this.props;
    const tip = popupType === 'set_verify' ? '请先设置交易验证方式' : '请先设置交易密码';
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
        <p className="message">{localization[tip]}</p>
      </Modal>
    );
  }
}

export default VerifyPopup;
