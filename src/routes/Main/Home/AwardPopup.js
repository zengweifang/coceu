import React, { Component } from 'react';
import request from 'utils/request';
import { Modal, Table } from 'antd';
import { stampToDate } from 'utils';
import { Loading, Empty } from 'components/Placeholder';

class AwardPopup extends Component {
  state = {
    awardList: [],
    awardTotal: 0,
    current: 1,
    loading: false
  };

  componentDidMount() {
    this.getRealy(1);
  }

  pageChange = page => {
    this.setState({ current: page });
    this.getRealy(page);
  };

  getRealy = page => {
    this.setState({ loading: true });
    request('/lucky/list', {
      method: 'POST',
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
      }
    });
  };

  render() {
    const { localization, viewport, onCancel } = this.props;
    const { awardList, awardTotal, current, loading } = this.state;
    const awardColumns = [
      {
        align: 'center',
        title: '序号',
        dataIndex: 'key',
        key: 'key'
      },
      {
        align: 'center',
        title: '账号',
        dataIndex: 'mail',
        key: 'mail'
      },
      {
        align: 'center',
        title: '奖金',
        dataIndex: 'luckyVolume',
        key: 'luckyVolume',
        render: text => {
          return <div>{(text * 1).toFixed(2)}</div>;
        }
      },
      {
        align: 'center',
        title: '获奖时间',
        dataIndex: 'updateDate',
        key: 'updateDate',
        render: text => {
          return <div>{stampToDate(text * 1, ' MM-DD hh:mm')}</div>;
        }
      }
    ];

    const tableProps = {
      dataSource: awardList,
      columns: awardColumns,
      loading: { indicator: <Loading />, spinning: loading },
      locale: {
        emptyText: <Empty {...{ localization }} />
      },
      pagination: {
        total: awardTotal,
        current,
        pageSize: 6,
        onChange: this.pageChange
      }
    };

    if (viewport.width < 768) {
      awardColumns[0] = {
        ...awardColumns[0],
        fixed: 'left',
        width: 140
      };
      tableProps.scroll = { x: 500 };
    }

    return (
      <Modal
        title={localization['获奖人']}
        visible
        centered
        footer={null}
        width={600}
        onCancel={onCancel}
        getContainer={() => document.querySelector('.layout')}
      >
        <Table {...tableProps} />
      </Modal>
    );
  }
}

export default AwardPopup;
