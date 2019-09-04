import React, {Component} from 'react';
import { Modal } from 'antd';
class ModalInfo extends Component {
    render() {
      const {
        isShow = () => {
        },
        style = {}
      } = this.props
      return (
        <Modal bodyStyle={{maxHeight:'30vw',overflow:'auto'}} visible={true} footer={null} style={style} {...this.props} onCancel={() => isShow(false)}
               onOk={() => isShow(false)}>
          {this.props.children}
        </Modal>
      );
    }
}
export default ModalInfo