import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';
import { Helmet } from 'react-helmet';
import Header from '../../components/header';
import Side from '../../components/side';
// import PageTabs from '../../components/page-tabs';
// import { getSelectedMenuByPath } from 'src/commons';
import { PAGE_FRAME_LAYOUT } from '../../commons/settings';
import { Redirect, Route, Switch } from 'react-router-dom';
import NotFound from '../NotFound';
import styles from './style.less';
import { get, post } from '../../commons/http';

export default class FrameTopSideMenu extends Component {
  state = {
    userInfo: {},
  };

  constructor(...props) {
    super(...props);
    const { action, isMobile } = this.props;
    const setMenuStatus = () => {
      setTimeout(() => {});
    };

    setMenuStatus();
    this.props.history.listen(() => {
      // 加上timeout之后，tab页切换之后，对应页面就不render了，不知道为什么！
      setMenuStatus();
    });
  }

  componentDidMount() {
    const getUserInfo = async () => {
      const response = await get('/user/get-info');
      if (response.code === 0) {
        window.localStorage.setItem(
          'user',
          JSON.stringify({ ...response.data })
        );
        this.setState({ userInfo: { ...response.data } });
      }
    };

    // getAllCompetition();
    getUserInfo();
  }

  static propTypes = {
    layout: PropTypes.string,
  };

  static defaultProps = {
    layout: PAGE_FRAME_LAYOUT.SIDE_MENU, // top-menu side-menu
    pageHeadFixed: true, // 页面头部是否固定
  };

  state = {};

  setTitleAndBreadcrumbs() {
    const {
      action: { page },
      pageHeadShow,
      menus,
      title: prevTitle,
      breadcrumbs: prevBreadcrumbs,
    } = this.props;

    // const selectedMenu = getSelectedMenuByPath(window.location.pathname, menus);
    const selectedMenu = {};
    let breadcrumbs = [];
    let title = '';
    if (selectedMenu) {
      title = {
        text: selectedMenu.text,
      };
      if (selectedMenu.parentNodes) {
        breadcrumbs = selectedMenu.parentNodes.map((item) => {
          return {
            key: item.key,
            icon: item.icon,
            text: item.text,
            path: item.path,
          };
        });
      }

      if (selectedMenu.path !== '/') {
        breadcrumbs.unshift({
          key: 'index',
          icon: 'home',
          text: '首页',
          path: '/',
        });
      }

      breadcrumbs.push({
        key: selectedMenu.key,
        icon: selectedMenu.icon,
        text: selectedMenu.text,
      });
    }

    // 从菜单中没有获取到，有肯能是当前页面设置了，但是没有菜单对应
    if (!breadcrumbs.length && prevBreadcrumbs && prevBreadcrumbs.length) {
      page.setBreadcrumbs(prevBreadcrumbs);
    } else {
      page.setBreadcrumbs(breadcrumbs);
    }

    // 从菜单中没有获取到，有肯能是当前页面设置了，但是没有菜单对应
    if (!title && prevTitle) {
      page.setTitle(prevTitle);
    } else {
      page.setTitle(title);
    }

    pageHeadShow ? page.showHead() : page.hideHead();
  }

  render() {
    let {
      layout,
      pageHeadFixed,
      showPageHead,
      tabsShow,
      title,
      breadcrumbs,

      showSide,
      sideCollapsed,
      sideCollapsedWidth,
      sideWidth,
      globalLoading,
      globalLoadingTip,
      sideDragging,
      isMobile,
    } = this.props;
    // console.log(layout,"layout")
    sideWidth = sideCollapsed ? sideCollapsedWidth : sideWidth;
    sideWidth = showSide ? sideWidth : 0;

    let transitionDuration = sideDragging ? '0ms' : `300ms`;

    const isTopSideMenu = layout === PAGE_FRAME_LAYOUT.TOP_SIDE_MENU;
    const isSideMenu = layout === PAGE_FRAME_LAYOUT.SIDE_MENU;
    const hasSide = isTopSideMenu || isSideMenu;
    // console.log(hasSide,"hasside");
    if (!hasSide) {
      window.document.body.style.paddingLeft = '0px';
    } else {
      // console.log(sideWidth)
      window.document.body.style.paddingLeft = '200px';
    }

    const theme = 'default'; // (isTopSideMenu || isSideMenu) ? 'dark' : 'default';

    if (isMobile) {
      showPageHead = true;
      pageHeadFixed = true;
      tabsShow = false;
    }

    const titleText = title?.text || title;
    const titleIsString = typeof titleText === 'string';

    // const topSpaceClass = [ 'content-top-space' ];

    // if (showPageHead && pageHead && pageHeadFixed) topSpaceClass.push('with-fixed-page-head');
    // if (tabsShow) topSpaceClass.push('with-tabs');

    const windowWidth = window.innerWidth;
    const sideWidthSpace = hasSide ? sideWidth : 0;
    const { match } = this.props;

    return (
      <div
        styleName="no-print"
        className={`${styles['no-print']} ${styles['base-frame']}`}
      >
        <Header userInfo={this.state.userInfo} />
        <Side layout={layout} theme={theme} />
        <div
          className={`${styles['content-top-space']} ${styles['with-fixed-page-head']} ${styles['with-tabs']}`}
        />
        {/* {tabsShow ? <div className={styles.pageTabs} id="frame-page-tabs" style={{ left: sideWidthSpace, width: windowWidth - sideWidthSpace, transitionDuration }}><PageTabs width={windowWidth - sideWidthSpace}/></div> : null} */}
        <div className={styles['page']}>
          <Switch>
            {this.props.routes.map((route, index) => {
              return (
                <Route
                  key={index}
                  path={`${match.path}${route.path}`}
                  component={route.component}
                  exact
                ></Route>
              );
            })}
            <Redirect from="/home" to="/home/users" exact></Redirect>
            <Route path="/home/*" component={NotFound}></Route>
          </Switch>
        </div>
        <div
          className={styles.globalLoading}
          style={{ display: globalLoading ? 'block' : 'none' }}
        >
          <Spin spinning size="large" tip={globalLoadingTip} />
        </div>
      </div>
    );
  }
}
