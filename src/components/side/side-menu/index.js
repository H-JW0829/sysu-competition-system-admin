import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../icon';
import { Menu } from 'antd';
import { renderNode } from '../../../commons';
import Link from '../../page-link';
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
} from '@ant-design/icons';

// import { Link } from 'react-router-dom';
import styles from './style.less';

const SubMenu = Menu.SubMenu;

export default class SideMenu extends Component {
  static propTypes = {
    dataSource: PropTypes.array, // 菜单数据
    theme: PropTypes.string, // 主题
    collapsed: PropTypes.bool, // 是否收起
    openKeys: PropTypes.array, // 打开菜单keys
    selectedKeys: PropTypes.array, // 选中菜单keys
    onOpenChange: PropTypes.func, // 菜单打开关闭时触发
  };

  static defaultProps = {
    dataSource: [],
    theme: 'dark',
    collapsed: false,
    openKeys: [],
    selectedKeys: [],
    onOpenChange: () => true,
  };
  handleOpenChange = (openKeys) => {
    this.props.onOpenChange(openKeys);
  };

  renderMenus() {
    let { dataSource } = this.props;
    dataSource = [
      {
        key: 'user',
        text: '用户管理',
        icon: 'user',
        path: '/home/users',
        order: 900,
      },
      {
        key: 'competition',
        text: '竞赛管理',
        icon: 'align-left',
        path: '/home/competitions',
        order: 900,
      },
    ];
    if (dataSource && dataSource.length) {
      return renderNode(dataSource, (item, children) => {
        const { key, path, text, icon, target, url } = item;

        let title = <span>{text}</span>;

        if (icon)
          title = (
            <span>
              <Icon type={icon} />
              <span>{text}</span>
            </span>
          );

        return (
          <Menu.Item key={key}>
            <Link
              to={{
                pathname: path,
                state: { from: 'menu' },
              }}
            >
              {title}
            </Link>
          </Menu.Item>
        );
      });
    }
    return null;
  }

  render() {
    let { theme, collapsed, openKeys, selectedKeys } = this.props;
    const menuProps = collapsed
      ? {}
      : {
          openKeys,
        };

    return (
      <div className={styles['side-menu']}>
        <Menu>{this.renderMenus()}</Menu>
      </div>
    );
  }
}
