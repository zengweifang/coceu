import React, { PureComponent } from 'react';
import classnames from 'classnames';
import styles from './wallet.less';

export default class Wallet extends PureComponent {
  render() {
    const { breakRatio = 0, remainingDays, frozenDays, localization, show, viewport } = this.props;
    const actionSheet = viewport.width < 678;

    return (
      <div
        className={classnames({
          [styles.walletWrap]: true,
          'action-sheet': actionSheet,
          show
        })}
      >
        <p>{localization['温馨提示']}:</p>
        <p>
          {localization['超级钱包为冻结钱包, 从第一笔转入时间算起, 满']}
          <span>{remainingDays}</span>
          {localization['天后资产自动释放回常规账户']};
        </p>
        <p>
          {localization['若因个人原因需要提前转出资产,']}{' '}
          {frozenDays > 0 && localization['则至少在钱包创建']}
          <span>{frozenDays > 0 && frozenDays}</span>
          {frozenDays > 0 && localization['天后操作转出,']} {localization['平台将收取违约金']}(
          <span>{breakRatio * 100}</span>%)
        </p>
        <p>{localization['违约金将自动转到销毁账户,每周统一销毁']}</p>
      </div>
    );
  }
}
