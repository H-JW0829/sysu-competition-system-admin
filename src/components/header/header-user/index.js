import React, { Component } from 'react';
import {
  CaretDownOutlined,
  EditOutlined,
  LogoutOutlined,
  SettingOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Menu, Dropdown, Modal } from 'antd';
import { Link } from 'react-router-dom';
import { toLogin } from '../../../commons';
// import { toLogin, getLoginUser } from 'src/commons';
// import ModifyPassword from './ModifyPassword';
import styles from './style.less';

const { confirm } = Modal;
const Item = Menu.Item;

export default class HeaderUser extends Component {
  static defaultProps = {
    theme: 'default',
  };

  state = {
    passwordVisible: false,
  };

  handleMenuClick = ({ key }) => {
    // if (key === 'logout') {
    //   this.props.ajax.post('/mock/logout').then(toLogin);
    // }

    if (key === 'modifyPassword') {
      this.setState({ passwordVisible: true });
    }
  };

  render() {
    const { className, theme, userInfo } = this.props;
    const handleClick = () => {
      // toLogin();
      confirm({
        title: '您确定要退出登录吗？',
        icon: <ExclamationCircleOutlined />,
        okText: '确定',
        cancelText: '取消',
        onOk() {
          window.localStorage.removeItem('token');
          setTimeout(() => {
            toLogin();
          }, 500);
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    };

    const menu = (
      <Menu
        className={styles.menu}
        theme={theme}
        selectedKeys={[]}
        onClick={this.handleMenuClick}
      >
        <Item key="modifyPassword">
          <EditOutlined />
          修改密码
        </Item>
        <Item>
          {/* <Link to="/settings"> */}
          <SettingOutlined />
          设置
          {/* </Link> */}
        </Item>
        <Menu.Divider />
        <Item key="logout" onClick={handleClick}>
          <LogoutOutlined />
          退出登录
        </Item>
      </Menu>
    );
    return (
      <div
        className={styles['user-menu']}
        ref={(node) => (this.userMenu = node)}
      >
        <Dropdown
          trigger="click"
          overlay={menu}
          getPopupContainer={() => this.userMenu || document.body}
          // style={{ fontSize: '12px' }}
        >
          <span className={styles['account']}>
            <span className={styles['user-name']}>
              {' '}
              {userInfo?.name}
              {userInfo?.staffId ? `(${userInfo.staffId})` : null}&nbsp;
              {'管理员'}
            </span>
            <CaretDownOutlined />
          </span>
        </Dropdown>
      </div>
    );
  }
}
