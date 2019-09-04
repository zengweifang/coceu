import React, { PureComponent } from 'react';
import { Button } from 'antd';
import styles from './index.less';
import download1 from 'assets/images/download/download1.png';
import trust1 from 'assets/images/download/trust1.png';
import trust2 from 'assets/images/download/trust2.png';
import ma from 'assets/images/ma.png';
import downloadBanner from 'assets/images/download/download_banner.png';

export default class Dowload extends PureComponent {

  render() {
    const { localization } = this.props;
    return (
      <div className={styles.download}>
        <div className={styles.header}>
          <div className={styles.bg} />
          <div className={`${styles.container} container`}>
            <img className={styles.image} src={downloadBanner}/>
            <div className={styles.content}>
              <div className={styles.title}>
                随时随地 轻松交易
              </div>
              <div className={styles.button}>
                扫码下载 APP
              </div>
              <div className={styles.txt}>
                扫描上侧二维码下载到手机
              </div>
            </div>

          </div>
        </div>
        <div className={styles.guide}>
          <div className={`container`}>
            <h4>iOS {localization['用户安装教程']}</h4>
            <ul className={styles.downloadUl}>
              <li>
                <img className={styles.myImg} alt="ues download" src={download1} />
              </li>
              <li className={`${styles.iosOne} ${styles.iosText}`}>
                <h3>1</h3>
                <div>{localization['下载']} APP</div>
                <p>
                  <span>{localization['扫描二维码，点击右上角按钮,选择使用 Safari 浏览器，']}</span>
                  <span>{localization['打开网址选择“点击安装”，将APP安装至手机上。']}</span>
                </p>
              </li>
            </ul>
            <ul className={styles.trustUl}>
              <li className={`${styles.iosTwo} ${styles.iosText}`}>
                <h3>2</h3>
                <div>{localization['选择信任']}</div>
                <p>
                  <span>{localization['打开手机“设置”>“通用”>“设备管理”，']}</span>
                  <span>{localization['点击“信任”按钮。']}</span>
                </p>
              </li>
              <li>
                <img className={styles.myImg} alt="ues trust" src={trust1} />
                <img className={styles.myImg} alt="ues trust" src={trust2} />
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
