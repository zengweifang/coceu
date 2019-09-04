import React, { Component } from "react";
import { Modal, Select, Input, message, Upload, Icon } from "antd";
import { IMAGES_ADDRESS, IMAGES_URL } from "utils/constants.js";
import styles from "./popup.less";

const Option = Select.Option;
const { TextArea } = Input;
const list = [
  "对方未付款",
  "对方未放行",
  "对方无应答",
  "对方有欺诈行为",
  "其他"
];

class AppealPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appealType: "",
      reason: "",
      previewVisible: false,
      fileList: [],
      popup: ""
    };
  }

  handleChange = appealType => {
    this.setState({ appealType });
  };

  reasonChange = e => {
    let value = e.target.value;
    if (value.length < 300) {
      this.setState({ reason: value });
    }
  };

  handleUploadChange = ({ fileList }) => {
    this.setState({ fileList });
  };

  handlePreview = file => {
    const imgUrl = file.response
      ? `${IMAGES_URL}/${file.response}`
      : file.thumbUrl;
    this.setState({
      popup: (
        <Modal
          visible
          centered
          footer={null}
          onCancel={() => {
            this.setState({ popup: "" });
          }}
        >
          <img alt="图片" style={{ width: "100%" }} src={imgUrl} />
        </Modal>
      )
    });
  };

  // 提交申诉
  handleOk = () => {
    const { appealType, reason, fileList } = this.state;
    const { onOk, localization } = this.props;
    if (appealType) {
      let result = { appealType, reason };
      fileList &&
        fileList.forEach((item, index) => {
          if (item.response) {
            if (index === 0) {
              result.imagePath = item.response;
            } else {
              result[`imagePath${index + 1}`] = item.response;
            }
          }
        });
      const hasuploading = fileList.some(item => {
        return item.status === "uploading";
      });
      if (hasuploading) {
        message.destroy();
        message.error("图片上传中,请稍后");
      } else {
        onOk(result);
      }
    } else {
      message.destroy();
      message.error(localization["请选择申诉类型"]);
    }
  };

  render() {
    const { appealType, reason, fileList, popup } = this.state;
    const { onCancel, localization } = this.props;
    return (
      <Modal
        title={localization["订单申诉"]}
        visible
        width={500}
        centered
        okText={localization["确认"]}
        cancelText={localization["取消"]}
        onCancel={onCancel}
        onOk={this.handleOk}
      >
        <div className={styles.appealPopup}>
          <p>
            {
              localization[
                "提起申诉后资产将会冻结，申诉专员将介入本次交易，直至申诉结束。恶意申诉者将会被冻结账户。"
              ]
            }
          </p>
          <h4>{localization["申诉类型"]}</h4>
          <Select
            value={appealType}
            onChange={this.handleChange}
            style={{ width: "100%" }}
          >
            {list.map((item, index) => {
              return (
                <Option value={item} key={index}>
                  {item}
                </Option>
              );
            })}
          </Select>
          <h4>{localization["申诉理由"]}</h4>
          <TextArea rows={4} value={reason} onChange={this.reasonChange} />
          <div>
            <h4>付款凭证</h4>
            <Upload
              action={`${IMAGES_ADDRESS}/upload`} //"http://images.uescoin.com/upload" //
              listType="picture-card"
              className={styles.imgList}
              fileList={fileList}
              onPreview={this.handlePreview}
              onChange={this.handleUploadChange}
            >
              {fileList.length >= 3 ? null : (
                <div>
                  <Icon type="plus" />
                  <div className="ant-upload-text">上传图片</div>
                </div>
              )}
            </Upload>
          </div>
          {popup}
        </div>
      </Modal>
    );
  }
}
export default AppealPopup;
