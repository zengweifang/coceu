import React, { PureComponent } from "react";
import { Modal, Button } from "antd";
import styles from "./popup.less";

export default class NoticePopup extends PureComponent {
  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel && onCancel();
  };
  render() {
    const { localization } = this.props;
    return (
      <Modal visible={true} centered footer={null} onCancel={this.handleCancel}>
        <div className={styles.noticePopup}>
          <h4>{localization["温馨提示"]}</h4>
          <p>
            {
              localization[
                "尊敬的UES用户: 为了您的C2C交易可以快速到账,请在交易前仔细阅读以下注意事项:"
              ]
            }
          </p>
          <p>
            <strong>1. </strong>
            {localization["所有会员必须绑定手机号才可以进行C2C交易;"]}
          </p>
          <p>
            <strong>2.</strong>
            {
              localization[
                "未实名认证的会员每次只能进行一笔C2C交易,已实名认证的会员最多只允许五笔C2C订单处于交易中(不包括已取消和卖方已确认到帐的订单)"
              ]
            }
            ;
          </p>
          <p>
            <strong>3.</strong>
            {
              localization[
                "请在下单后30分钟内完成付款,否则订单将自动取消,会员当天累计取消3笔订单,将限制当天C2C的所有交易;"
              ]
            }
          </p>
          <p>
            <strong>4.</strong>
            {
              localization[
                "禁止使用微信、支付宝、他人代付、ATM及柜台转账等往银行卡转账:"
              ]
            }
          </p>
          <p>
            {
              localization[
                "请使用本人绑定的银行卡通过手机银行或网银进行汇款,其他任何方式汇款都会造成延时处理;"
              ]
            }
          </p>
          <p>
            <strong>5.</strong>
            {
              localization[
                "大于5万的付款,请务必将单笔金额拆分为5万以内分批转账,否则将延迟到账;"
              ]
            }
          </p>
          <p>
            <strong>6.</strong>
            {
              localization[
                "请履行契约精神,勿尝试任何欺诈行为,一经查实,将永久性冻结账户;"
              ]
            }
          </p>
          <div className={styles.footerBtn}>
            <Button size="large" type="primary" onClick={this.handleCancel}>
              {localization["我知道了"]}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
}
