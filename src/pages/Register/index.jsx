import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Input, Button, Form } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Banner from '../../components/banner';
import styles from './style.less';

export default class extends Component {
  state = {
    loading: false,
    message: '',
    isMount: false,
  };

  handleSubmit = (values) => {
    if (this.state.loading) return;

    const { userName, password } = values;
    const params = {
      userName,
      password,
    };

    this.props.history.replace('/home/users');
  };

  render() {
    const { loading, message, isMount } = this.state;
    const formItemStyleName = isMount
      ? `${styles['form-item']} ${styles['active']}`
      : styles.formItem;

    return (
      <div className={`${styles['root']}`}>
        {/* <Helmet title="免费注册"/> */}
        <div className={styles.left}>
          <Banner />
        </div>
        <div className={styles.right}>
          <div className={styles.box}>
            <Form
              ref={(form) => (this.form = form)}
              name="register"
              className={styles.inputLine}
              onFinish={this.handleSubmit}
            >
              <div className={formItemStyleName}>
                <div className={styles.header}>免费注册</div>
              </div>
              <div className={formItemStyleName}>
                <Form.Item
                  name="telephone"
                  rules={[{ required: true, message: '请输入手机号' }]}
                >
                  <Input
                    allowClear
                    autoFocus
                    prefix={
                      <UserOutlined className={styles.siteFormItemIcon} />
                    }
                    placeholder="手机号"
                  />
                </Form.Item>
              </div>
              <div className={formItemStyleName}>
                <Form.Item
                  defaultValue=""
                  name="userName"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input
                    allowClear
                    autoFocus
                    prefix={
                      <UserOutlined className={styles.siteFormItemIcon} />
                    }
                    placeholder="用户名"
                  />
                </Form.Item>
              </div>
              <div className={formItemStyleName}>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password
                    prefix={
                      <LockOutlined className={styles.siteFormItemIcon} />
                    }
                    placeholder="密码"
                  />
                </Form.Item>
              </div>
              <div className={formItemStyleName}>
                <Form.Item
                  name="confirmPassword"
                  rules={[{ required: true, message: '请再次输入密码' }]}
                >
                  <Input.Password
                    prefix={
                      <LockOutlined className={styles.siteFormItemIcon} />
                    }
                    placeholder="确认密码"
                  />
                </Form.Item>
              </div>
              <div className={formItemStyleName}>
                <Form.Item shouldUpdate={true} style={{ marginBottom: 0 }}>
                  {() => (
                    <Button
                      className={styles.submitBtn}
                      loading={loading}
                      type="primary"
                      htmlType="submit"
                      disabled={
                        !this.form?.isFieldsTouched(true) ||
                        this.form
                          ?.getFieldsError()
                          .filter(({ errors }) => errors.length).length
                      }
                      style={{ width: '100%' }}
                    >
                      注册
                    </Button>
                  )}
                </Form.Item>
              </div>
            </Form>
            <div className={styles.errorTip}>{message}</div>
            <div className={styles['to-login']}>
              已有账号？
              <Link to="/login" style={{ color: 'lightskyblue' }}>
                立即登录
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
