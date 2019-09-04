import React, { Component } from 'react';
import { Button } from 'antd';

const ButtonGroup = Button.Group;

export default class Setting extends Component {

  handleChangeTheme = (theme) => {
    const { changeTheme } = this.props;
    changeTheme(theme);
  }
  render() {
    const { theme } = this.props;
    let lightProps = {};
    let darkProps = {};
    if (theme === "light") {
      lightProps.type = "primary";
      darkProps.className = "btn-dark";
    } else {
      darkProps.type = "primary";
      lightProps.className = "btn-dark";
    }

    return (
      <div className='c2c-setting'>
        <ButtonGroup>
          <Button {...lightProps} onClick={() => { this.handleChangeTheme("light") }}>
            <i className="iconfont icon-taiyang-copy" />
          </Button>
          <Button {...darkProps} onClick={() => { this.handleChangeTheme("dark") }}>
            <i className="iconfont icon-iconset0454" />
          </Button>
        </ButtonGroup>
      </div>
    );
  }
}