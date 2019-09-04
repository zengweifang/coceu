import React, { PureComponent } from 'react';
import { Steps, Button, message, Upload, Icon } from 'antd';
import { getQueryString, setLocalStorage } from 'utils';
import { IMAGES_ADDRESS } from 'utils/constants';
import classnames from 'classnames';
import request from 'utils/request';
import VerForm from './VerForm';

import styles from './steps.less';
import exampleImg from 'assets/images/card-template.png';

const Step = Steps.Step;

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

class StepsForm extends PureComponent {
  state = {
    showExampleImage: false,
    current: this.props.account.cardLevel,
    countryCode: getQueryString('countryCode')
  };

  // 显示示例图片
  showExample = () => {
    this.setState({ showExampleImage: true });
  };

  // 隐藏示例图片
  hideExample = () => {
    this.setState({ showExampleImage: false });
  };

  goPrev = () => {
    this.setState({ current: this.state.current - 1 });
  };

  // 提交身份信息
  submitVer = (submitType, values) => {
    const { localization, account, dispatch } = this.props;
    const {
      idCard,
      age,
      sex,
      realName,
      address,
      cardUpId,
      cardDownId,
      cardFaceId,
      countryCode
    } = this.state;

    const mapUrl = {
      0: '/user/updateUser',
      1: '/user/updateUserCardOne',
      2: '/user/updateUserCardTwo'
    };

    const mapBody = {
      0: { idCard, age, sex, realName, address, cardUpId, cardDownId, cardFaceId, countryCode },
      1: Object.assign({}, values, { countryCode }),
      2: { cardUpId, cardDownId, cardFaceId, countryCode }
    };

    request(mapUrl[submitType], { body: mapBody[submitType] }).then(json => {
      if (json.code === 10000000) {
        const cardStatus = submitType === 1 ? 2 : 12;
        const newAccount = { ...account, cardStatus };
        dispatch({
          type: 'global/save',
          payload: {
            account: newAccount
          }
        });
        setLocalStorage('account', newAccount);
        this.props.history.push('/account/certification');
        message.success(localization['信息提交成功']);
      }
    });
  };

  fetchUserInfo = values => {
    this.setState({ ...values, current: this.state.current + 1 });
  };

  // 上传图片前钩子，做上传图片大小限制
  beforeUpload = file => {
    const { localization } = this.props;
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error(`${localization['照片必须小于']}10MB`);
    }
    return isLt10M;
  };

  // 检测上传图片状态
  handleChange = ({ file }, type) => {
    if (file.status === 'uploading') {
      this.setState({ [`${type}Loading`]: true });
      return;
    }
    if (file.status === 'done') {
      getBase64(file.originFileObj, imageUrl =>
        this.setState({
          [`card${type}Id`]: file.response,
          [`${type}ImageUrl`]: imageUrl,
          [`${type}Loading`]: false
        })
      );
    }
  };

  render() {
    const { localization, account, viewport } = this.props;
    const {
      showExampleImage,
      cardUpId,
      cardDownId,
      cardFaceId,
      current,
      countryCode,
      idCard
    } = this.state;

    const canSumbit = cardUpId && cardDownId && cardFaceId;

    return (
      <div className={styles.form}>
        <Steps current={current}>
          {[
            `${localization['基本信息']}${
              countryCode === '00' ? ` (V2 ${localization['认证']})` : ''
            }`
            ,
            `${localization['身份证件信息']}${
              countryCode === '00' ? ` (V2 ${localization['认证']})` : ''
            }`
          ].map(text => (
            <Step key={text} title={text} />
          ))}
        </Steps>
        <div className={classnames({ [styles.steps]: true, [styles.active]: current === 0 })}>
          <VerForm
            {...{
              viewport,
              countryCode,
              localization,
              submitVer: this.submitVer,
              fetchUserInfo: this.fetchUserInfo
            }}
          />
        </div>
        <div className={classnames({ [styles.steps]: true, [styles.active]: current === 1 })}>
          <h2 className={styles.attention}>
            {
              localization[
                '照片要求：大小不超过10M，照片清晰，手持有效证件、平台名称(UES) 及当天日期的字条'
              ]
            }
            <Button onFocus={this.showExample} onBlur={this.hideExample} type="primary">
              {localization['示例']}
            </Button>
            {showExampleImage && (
              <div className={styles.example}>
                <img src={exampleImg} alt="" />
                <div className={styles.text}>
                  <span>{localization['标准']}</span>
                  <span>{localization['边缘缺失']}</span>
                  <span>{localization['照片模糊']}</span>
                  <span>{localization['不在手心']}</span>
                </div>
              </div>
            )}
          </h2>
          <div className={styles.photos}>
            {['Up', 'Down', 'Face'].map(type => {
              const uploadText = {
                Up: localization['上传身份证正面照'],
                Down: localization['上传身份证背面照'],
                Face: localization['上传手持身份证及字条图']
              };
              const uploaded = this.state[`card${type}Id`];
              return (
                <Upload
                  key={type}
                  action={`${IMAGES_ADDRESS}/card/upload`}
                  listType="picture-card"
                  className={classnames({ [styles.box]: true, [styles[type]]: !uploaded })}
                  showUploadList={false}
                  beforeUpload={this.beforeUpload}
                  onChange={info => {
                    this.handleChange(info, type);
                  }}
                >
                  {this.state[`${type}ImageUrl`] ? (
                    <img src={this.state[`${type}ImageUrl`]} alt="" />
                  ) : (
                    <div>
                      <Icon type={this.state[`${type}Loading`] ? 'loading' : 'plus'} />
                      <div className={styles.text}>{uploadText[type]}</div>
                    </div>
                  )}
                </Upload>
              );
            })}
          </div>
          <div className={styles.action}>
            {account.cardLevel === 0 && (
              <Button type="primary" size="large" onClick={this.goPrev}>
                {localization['上一步']}
              </Button>
            )}
            <Button
              type="primary"
              size="large"
              onClick={this.submitVer.bind(this, idCard ? 0 : 2)}
              disabled={!canSumbit}
            >
              {localization['提交审核']}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default StepsForm;
