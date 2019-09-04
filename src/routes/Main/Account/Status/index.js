import { Steps } from 'antd';
import { stampToDate } from 'utils';
import styles from './index.less';

const Step = Steps.Step;

function Status({ localization, location }) {
  const { name, address, myVolume } = location.state;
  return (
    <div className={styles.status}>
      <h4>{localization['提币订单已提交，请耐心等待']}</h4>
      <div className={styles.step}>
        <Steps current={2}>
          <Step title={localization['提交']} status="process" />
          <Step title={localization['审核']} status="wait" />
          <Step title={localization['处理']} status="wait" />
          <Step title={localization['完成']} status="wait" />
        </Steps>
      </div>
      <ul className={styles.order}>
        <li>
          <div className={styles.title}>{localization['币种']}</div>：<div>{name}</div>
        </li>
        <li>
          <div className={styles.title}>{localization['提币地址']}</div>：<div>{address}</div>
        </li>
        <li>
          <div className={styles.title}>{localization['到账数量']}</div>：<div>{myVolume}</div>
        </li>
        <li>
          <div className={styles.title}>{localization['申请时间']}</div>：
          <div>{stampToDate(new Date().getTime())}</div>
        </li>
      </ul>
    </div>
  );
}

export default Status;
