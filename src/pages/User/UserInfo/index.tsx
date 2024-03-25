import {
  Button,
  Descriptions, message,
  Modal,
  Spin,
  Tooltip,
} from 'antd';
import React, {useEffect, useRef, useState} from 'react';
import { useNavigate } from "react-router-dom";

import Paragraph from "antd/lib/typography/Paragraph";
import ProCard from "@ant-design/pro-card";
import {getLoginUserUsingGET, userLogoutUsingPOST} from "@/services/yuapi-backend/userController";
import {getInterfaceInfoByIdUsingGET} from "@/services/yuapi-backend/interfaceInfoController";


export const valueLength = (val: any) => {
    return val && val.trim().length > 0
}
const UserInfo: React.FC = () => {

    const [userInfo,setUserInfo] = useState({
      userName:"default name",
      accessKey:"default ak",
      secretKey:"default sk"
    })
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

  const loadData = async () => {

    try {
      const res = await getLoginUserUsingGET();
      console.log(res)
      setUserInfo({
        userName:res.data.userAccount,
        accessKey:res.data.accessKey,
        secretKey:res.data.secretKey
      })
    } catch (error: any) {
      message.error('请求失败，' + error.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);



    const handelLogout = ()=>{
      userLogoutUsingPOST().then(r =>navigate('/user/login'))
    }


    return (
        <Spin spinning={loading}>
            <ProCard
                type="inner"
                bordered
                direction="column"
            >
                <ProCard
                    title={<strong>个人信息</strong>}
                    type="inner"
                    bordered
                >
                    <Descriptions column={1}>
                      <div>
                          <h4>账号：</h4>
                          <Paragraph>
                              {valueLength(userInfo.userName) ? userInfo.userName : '无名氏'}
                          </Paragraph>
                      </div>
                      <div>
                        <button onClick={()=>handelLogout()}>退出登录</button>
                      </div>
                    </Descriptions>
                </ProCard>
                <br/>
                <br/>
                <ProCard
                    bordered
                    type="inner"
                    title={"开发者凭证（调用接口的凭证）"}
                >
                    {
                        (userInfo?.accessKey && userInfo?.secretKey) ? (
                            <Descriptions column={1}>
                                <Descriptions.Item label="AccessKey">
                                    <Paragraph copyable={valueLength(userInfo?.accessKey)}>
                                        {userInfo?.accessKey}
                                    </Paragraph>
                                </Descriptions.Item>
                                <Descriptions.Item label="SecretKey">
                                    <Paragraph copyable={valueLength(userInfo?.secretKey)}>
                                        {userInfo?.secretKey}
                                    </Paragraph>
                                </Descriptions.Item>
                            </Descriptions>) : "暂无凭证,请先生成凭证"
                    }
                </ProCard>
                <br/>

            </ProCard>
        </Spin>
    );
};

export default UserInfo;
