import React, { Component } from "react";
import { Modal, Table, message } from "antd";
import request from 'utils/request';
import { stampToDate } from 'utils';
import { Loading } from 'components/Placeholder';

class HistoryPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      awardList: [],
      awardTotal: 0,
      current: 1,
      loading: false
    };
  }

  request = window.request;

  componentDidMount() {
    this.getRealy(1);
  }

  pageChange = page => {
    this.setState({ current: page });
    this.getRealy(page);
  };

  getRealy = page => {
    this.setState({ loading: true });
    request("/lucky/myList", {
      method: "POST",
      body: {
        currentPage: page,
        showCount: 6
      }
    }).then(json => {
      this.setState({ loading: false });
      if (json.code === 10000000) {
        const awardList = json.data.list.map((item, index) => {
          item.key = index + 1;
          return item;
        });
        this.setState({
          awardList: awardList,
          awardTotal: json.data.count
        });
      } else {
        message.error(json.msg);
      }
    });
  };

  render() {
    const { awardList, awardTotal, current, loading } = this.state;
    const { onCancel } = this.props;
    const awardColumns = [
      {
        align: "center",
        title: "序号",
        dataIndex: "key",
        key: "key"
      },
      {
        align: "center",
        title: "参与期数",
        dataIndex: "periods",
        key: "periods",
        render: text => {
          return <div>第{text}期</div>;
        }
      },
      {
        align: "center",
        title: "状态",
        dataIndex: "status",
        key: "status",
        render: text => {
          const textMap = {
            0: "待开奖",
            1: "已中奖",
            2: "未中奖"
          };
          return <div>{textMap[text]}</div>;
        }
      },
      {
        align: "center",
        title: "手续费",
        dataIndex: "deductFee",
        key: "deductFee",
        render: text => {
          return <div>{text}</div>;
        }
      },
      {
        align: "center",
        title: "参与时间",
        dataIndex: "updateDate",
        key: "updateDate",
        render: text => {
          return <div>{stampToDate(text * 1, "MM-DD hh:mm")}</div>;
        }
      }
    ];
    return (
      <Modal
        title="我的参与记录"
        visible={true}
        wrapClassName="v-center-modal"
        width={700}
        footer={null}
        onCancel={onCancel}
      >
        <Table
          dataSource={awardList}
          columns={awardColumns}
          loading={{ indicator: <Loading />, spinning: loading }}
          pagination={{
            total: awardTotal,
            current,
            pageSize: 6,
            onChange: page => {
              this.pageChange(page);
            }
          }}
        />
      </Modal>
    );
  }
}

export default HistoryPopup;
