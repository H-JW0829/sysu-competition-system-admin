import React, { Component } from 'react';
import { Input, Button, Form, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Banner from '../../components/banner';
import styles from './style.less';
import { publicEncrypt } from 'crypto';
import { get, post } from '../../commons/http';
import Captcha from 'react-captcha-code';

export default class extends Component {
  state = {
    loading: false,
    message: '',
    isMount: false,
    publicKey: '',
    captcha: '',
  };

  componentDidMount() {
    //获取公钥
    const getPublicKey = async () => {
      const response = await get('/user/key');
      const { data } = response;
      this.setState({ publicKey: data.key });
      window.localStorage.setItem('publicKey', data.key);
    };
    getPublicKey();
  }

  handleSubmit = async (values) => {
    if (this.state.loading) return;

    const { tel, password } = values;

    const rsaPassword = publicEncrypt(
      this.state.publicKey,
      Buffer.from(password)
    ).toString('base64');
    const response = await post('/user/login', {
      tel,
      password: rsaPassword,
      verify: true,
    });
    const { code, msg, data } = response;
    if (code === 0) {
      window.localStorage.setItem('token', data.token);
      //   const { updateUser } = this.props;
      //   const user = {
      //     id: data.id,
      //     name: data.name,
      //     role: data.role,
      //     tel: data.tel,
      //   };
      //   updateUser(user);
      message.success('登录成功,正在跳转...', 1);
      setTimeout(() => {
        this.props.history.replace('/home/users');
      }, 1000);
    } else {
      message.error(msg || '登录失败，请重试', 2);
    }
  };

  setCode = (captcha) => {
    console.log('captcha:', captcha);
    this.setState({ captcha });
  };

  render() {
    const { loading, message, isMount, captcha } = this.state;
    const formItemStyleName = isMount
      ? `${styles['form-item']} ${styles['active']}`
      : styles.formItem;

    return (
      <div className={`${styles['root']}`}>
        {/* <Helmet title="欢迎登陆"/> */}
        <div className={styles.left}>
          <Banner />
        </div>
        <div className={styles.right}>
          <div className={styles.box}>
            <Form
              ref={(form) => (this.form = form)}
              name="login"
              className={styles.inputLine}
              onFinish={this.handleSubmit}
            >
              <div className={formItemStyleName}>
                <div className={styles.header}>欢迎登录</div>
              </div>
              <div className={formItemStyleName}>
                <Form.Item
                  name="tel"
                  rules={[
                    { required: true, message: '请输入手机号' },
                    {
                      message: '请输入正确的手机号码',
                      type: 'string',
                      len: 11,
                      pattern: /^1[3|4|5|7|8][0-9]\d{8}$/,
                    },
                  ]}
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
              <div className={formItemStyleName} style={{ display: 'flex' }}>
                <div
                  style={{ width: '100px', height: '42px', marginRight: '3px' }}
                >
                  <Captcha
                    charNum={4}
                    onChange={this.setCode}
                    width={100}
                    height={42}
                  />
                </div>
                <Form.Item
                  name="code"
                  rules={[
                    { required: true, message: '请输入验证码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const result = value === captcha ? true : false;
                        if (result) {
                          return Promise.resolve();
                        } else {
                          return Promise.reject('验证码错误');
                        }
                      },
                    }),
                  ]}
                  validateFirst={true}
                >
                  <Input allowClear autoFocus placeholder="验证码" />
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
                      登录
                    </Button>
                  )}
                </Form.Item>
              </div>
            </Form>
            <div className={styles.errorTip}>{message}</div>
            <div className={styles['to-register']}>
              没有账号？
              <Link to="/register" style={{ color: 'lightskyblue' }}>
                马上注册
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
