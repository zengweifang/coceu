import { Link } from 'dva/router';
import { ClipLoader } from 'react-spinners';
import styles from './index.less';

export const ToLogin = ({ localization }) => (
  <div className={styles.toLogin}>
    <Link to="/login">{localization['登录']}</Link>
    &nbsp;&nbsp;
    {localization['进行查看']}
  </div>
);

export const Loading = () => (
  <div className={styles.loading}>
    <ClipLoader size={35} />
  </div>
);

export const Empty = ({ localization }) => (
  <div className={styles.empty}>
    <i className="iconfont icon-zanwushuju" />
    {localization['暂无数据']}
  </div>
);
