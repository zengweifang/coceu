import React, { PureComponent } from 'react';
import { Link } from 'dva/router';
import { List, Button } from 'antd';
import request from 'utils/request';
import { Loading, Empty } from 'components/Placeholder';

class Help extends PureComponent {
  state = {
    current: 1,
    helps: [],
    total: 0,
    loading: false,
    content: ''
  };

  componentDidMount() {
    this.getData();
  }

  componentDidUpdate(prevProps) {
    const { language, match } = this.props;
    if (prevProps.match.params.id !== match.params.id) this.getData();
    if (prevProps.language !== language) {
      this.getData();
    }
  }

  getData = () => {
    const { id } = this.props.match.params;
    if (id) {
      this.setState({ content: '' });
      this.getDetail(id);
    } else {
      this.setState({ helps: [] });
      this.getList(1);
    }
  };

  //获取帮助列表
  getList = page => {
    this.setState({ loading: true });
    // const { language } = this.props;
    request('/cms/helpCenter/list', {
      body: {
        language: 'zh_CN',
        currentPage: page,
        showCount: 10
      }
    }).then(json => {
      if (json.code === 10000000) {
        this.setState({ helps: json.data.list, total: json.data.count });
        this.setState({ loading: false });
      } else {
        this.setState({ loading: false });
      }
    });
  };

  //获取帮助详情
  getDetail = id => {
    request('/cms/view/' + id, {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        this.setState({ content: json.data.content });
      }
    });
  };

  itemClick = item => {
    this.props.history.push(`/help/${item.id}`);
  };

  pageChange = page => {
    this.getList(page);
    this.setState({ current: page });
  };

  render() {
    const { localization, match } = this.props;
    const { id } = match.params;
    const { current, helps, total, loading, content } = this.state;
    return (
      <div className="container">
        <div className="writings">
          <h3 className="writings-title">
            <Link to="/help"> {localization['帮助中心']}</Link>
            {id ? ` > ${localization['帮助详情']}` : ''}
          </h3>
          <div className="writings-content">
            {id ? (
              content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <Loading />
              )
            ) : (
              <List
                size="large"
                dataSource={helps}
                loading={{
                  spinning: loading,
                  indicator: <Loading />
                }}
                locale={{ emptyText: <Empty {...{ localization }} /> }}
                renderItem={item => (
                  <List.Item
                    onClick={() => {
                      this.itemClick(item);
                    }}
                  >
                    <List.Item.Meta description={item.title} />
                    <Button type="primary" ghost>
                      查看详情
                    </Button>
                  </List.Item>
                )}
                pagination={{
                  current,
                  total,
                  pageSize: 10,
                  onChange: this.pageChange
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Help;
