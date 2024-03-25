import Footer from '@/components/Footer';
import { getFakeCaptcha } from '@/services/ant-design-pro/login';
import {
  AlipayCircleOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { Alert, message, Tabs } from 'antd';
import React, {useEffect, useState} from 'react';
import { flushSync } from 'react-dom';
import styles from './index.less';
import {userLoginUsingPOST, userRegisterUsingPOST} from '@/services/yuapi-backend/userController';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};
const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');

  useEffect(() => {
    const element = document.querySelector('.ant-btn-primary span'); // 使用CSS选择器获取DOM元素
    element.innerHTML = type === 'account'? '登陆' : '注册'
  }, [type]);


  const handleSubmit = async (values: API.UserLoginRequest) => {
    try {

      if (type === 'account'){
        // 登录
        const res = await userLoginUsingPOST({
          ...values,
        });
        if (res.data) {
          const urlParams = new URL(window.location.href).searchParams;
          history.push(urlParams.get('redirect') || '/');
          setInitialState({
            loginUser: res.data
          });
          return;
        }
      }else if (type === 'register'){
        // 注册
        console.log({
          ...values
        })
        const res = await userRegisterUsingPOST({
          ...values
        })
        if (res.data) {
          alert('注册成功')
          setType('account')
          return;
        }
      }

    } catch (error) {
      const defaultLoginFailureMessage = error+'';
      message.error(defaultLoginFailureMessage.replace('Error:',''));
    }
  };


  const { status, type: loginType } = userLoginState;
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <LoginForm
          title="API集成管理平台"
          subTitle={'API Integration and Management Platform'}
          initialValues={{
            autoLogin: true,
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.UserLoginRequest);
          }}>
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '账户密码登录',
              },
              {
                key: 'register',
                label: '注册',
              },
            ]}
          />

          {status === 'error' && loginType === 'account' && (
            <LoginMessage content={'错误的用户名和密码'} />
          )}
          {type === 'account' && (
            <>
              <ProFormText
                name="userAccount"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                placeholder={'用户名'}
                rules={[
                  {
                    required: true,
                    message: '用户名是必填项！',
                  },
                ]}
              />
              <ProFormText.Password
                name="userPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                placeholder={'密码'}
                rules={[
                  {
                    required: true,
                    message: '密码是必填项！',
                  },
                ]}
              />
            </>
          )}

          {status === 'error' && loginType === 'register' && <LoginMessage content="验证码错误" />}
          {type === 'register' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                name="userAccount"
                placeholder={'请输入用户名'}
                rules={[
                  {
                    required: true,
                    message: '用户名是必填项！',
                  },
                  {
                    pattern: /^[a-zA-Z0-9_]{6,}$/,
                    message: '用户名需大于6位',
                  },
                ]}
              />
              <ProFormText.Password
                  name="userPassword"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined className={styles.prefixIcon} />,
                  }}
                  placeholder={'密码'}
                  rules={[
                    {
                      required: true,
                      message: '密码是必填项',
                    },
                  ]}
              />
              <ProFormText.Password
                  name="checkPassword"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined className={styles.prefixIcon} />,
                  }}
                  placeholder={'确认密码'}
                  rules={[
                    {
                      required: true,
                      message: '确认密码是必填项',
                    },
                  ]}
              />

            </>
          )}
          <div
            style={{
              marginBottom: 24,
            }}
          >
          </div>
        </LoginForm>
      </div>
    </div>
  );
};
export default Login;
