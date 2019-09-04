import React, { PureComponent } from 'react';
import { message, Modal, Input } from 'antd';
import request from 'utils/request';

class GooglePopup extends PureComponent {
  state = {
    errorTip: '',
    code: ''
  };

  handleCancel = () => {
    const { closePopup } = this.props;
    closePopup && closePopup();
  };

  handleOk = () => {
    const { localization, dispatch, closePopup } = this.props;
    const { code } = this.state;
    if (code) {
      request('/user/googleValid', {
        body: { code }
      }).then(json => {
        if (json.code === 10000000) {
          message.success(json.msg);
          closePopup && closePopup();
        }
      });
    } else {
      dispatch({
        type: 'global/save',
        payload: { warnMsg: localization['请输入验证码'] }
      });
    }
  };

  codeOnchange = e => {
    let value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      this.setState({ code: value });
    }
  };

  render() {
    const { localization } = this.props;
    const { code } = this.state;
    return (
      <Modal
        title={localization['谷歌验证码']}
        visible
        centered
        maskClosable={false}
        width={400}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        cancelText={localization['取消']}
        okText={localization['确定']}
      >
        <Input
          size="large"
          style={{ minWidth: 300 }}
          autoFocus
          value={code}
          placeholder={localization['请输入谷歌验证码']}
          onChange={this.codeOnchange}
        />
      </Modal>
    );
  }
}

export default GooglePopup;
