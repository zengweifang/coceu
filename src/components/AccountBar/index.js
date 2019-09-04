import { NavLink } from 'react-router-dom';

import styles from './index.less';
import classnames from 'classnames';

export default function AccountBar({
  isC2cVisible,
  localization,
  viewport,
  barUnfold,
  handleLogOut,
  handleSwitchAccountBar
}) {
  const menus = {
    资金管理: [
      {
        path: '/account/assets',
        name: '我的资产'
      },
      {
        path: '/account/finance',
        name: '财务记录'
      },
      {
        path: '/account/address',
        name: '地址管理'
      }
    ],
    我的交易: [
      {
        path: '/account/exchange',
        name: '币币交易'
      }
      // {
      //   path: '/account/c2c',
      //   name: 'C2C交易'
      // }
    ],
    个人信息: [
      {
        path: '/account/profile',
        name: '基本信息'
      }
      // {
      //   path: '/account/payment',
      //   name: '支付绑定'
      // }
    ],
    安全中心: [
      {
        path: '/account/security',
        name: '安全设置'
      },
      {
        path: '/account/certification',
        name: '实名认证'
      }
    ],
    我的推荐: [
      {
        path: '/account/invite',
        name: '我的邀请'
      }
    ]
  };

  return (
    <section
      className={classnames({ [styles.bar]: true, [styles.unfold]: barUnfold })}
      onClick={handleSwitchAccountBar}
    >
      <div className={styles.barWrapper}>
        {Object.entries(menus).map(([category, links]) => (
          <div key={category} className={styles.category}>
            <h3>{localization[category]}</h3>
            <div className={styles.links}>
              {links.map(link => (
                <NavLink key={link.path} activeClassName={styles.active} to={link.path}>
                  {localization[link.name]}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
        {viewport.width < 768 && (
          <div className={styles.logout} onClick={handleLogOut}>
            {localization['退出']}
          </div>
        )}
      </div>
    </section>
  );
}
