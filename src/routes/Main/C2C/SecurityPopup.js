import React, { Component } from "react";
import { Modal, message, Button } from "antd";
import security1 from "assets/images/c2c_security_1.svg";
import security2 from "assets/images/c2c_security_2.svg";
import security3 from "assets/images/c2c_security_3.svg";
import security4 from "assets/images/c2c_security_4.svg";
import security5 from "assets/images/c2c_security_5.svg";
import security6 from "assets/images/c2c_security_6.svg";

import styles from "./popup.less";

class SecurityPopup extends Component {
  handleOk = () => {
    const { onOk } = this.props;
    const { checked } = this.state;
    if (checked) {
      onOk && onOk();
    } else {
      message.destroy();
    }
  };

  render() {
    return (
      <Modal
        title="安全交易风险警示"
        width={620}
        footer={null}
        centered
        visible
      >
        <ul className={styles.securityPopup}>
          <li className={styles.item}>
            <div>
              <img className={styles.heImage} src={security1} alt="" />
            </div>
            <p>
              请务必根据您的需求购买虚拟数字资产，避免恶意下单，为此将带来永久封号的风险。
            </p>
          </li>
          <li className={styles.item}>
            <div>
              <img className={styles.heImage} src={security2} alt="" />
            </div>
            <p>
              在下单后，请务必与卖方确认收款渠道，避免打款错误，带来争议甚至造成损失。
            </p>
          </li>
          <li className={styles.item}>
            <div>
              <img className={styles.heImage} src={security3} alt="" />
            </div>
            <p>
              在真实确认打款后，请不要轻易相信任何冒充收款方要求您重新转账的请求，请务必通过在线聊天，或拨打UES平台中展示给您的收款方手机号码。
            </p>
          </li>
          <li className={styles.item}>
            <div>
              <img className={styles.heImage} src={security4} alt="" />
            </div>
            <p>
              在线下打款时，务必填写对方正确的收款账号，以及核对您的付款金额，请千万不要多打或少打，避免带来损失。
            </p>
          </li>
          <li className={styles.item}>
            <div>
              <img className={styles.heImage} src={security5} alt="" />
            </div>
            <p>
              在打款完成后，请一定到订单中执行【我已付款】操作，避免订单被系统自动取消后，卖家再次卖出造成您的资产损失（未付款前，订单有30分钟的打款并确认付款时间）
            </p>
          </li>
          <li className={styles.item}>
            <div>
              <img className={styles.heImage} src={security6} alt="" />
            </div>
            <p>
              不要透露密码、短信验证和谷歌验证码及谷歌密钥给任何人，以及不要回复任何号称UES客服的索要验证码、账号密码等请求。
            </p>
          </li>
          <li className={styles.tips}>请务必注意安全防范，加强自我保护意识</li>
          <li className={styles.footerBtn}>
            <Button type="primary">我已知晓,继续 >></Button>
          </li>
        </ul>
      </Modal>
    );
  }
}

export default SecurityPopup;
