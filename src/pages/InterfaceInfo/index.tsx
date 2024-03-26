import { PageContainer } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import {Button, Card, Descriptions, Form, message, Input, Spin, Divider, Modal} from 'antd';
import {
  getInterfaceInfoByIdUsingGET,
  invokeInterfaceInfoUsingPOST,
} from '@/services/yuapi-backend/interfaceInfoController';
import { useParams } from '@@/exports';
import {
  addUserInterfaceInfoUsingPOST,
  getUserInterfaceInfoByIdUsingGET
} from "@/services/yuapi-backend/userInterfaceInfoController";
import {getLoginUserUsingGET} from "@/services/yuapi-backend/userController";

/**
 * 接口广场
 * @constructor
 */
const Index: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<API.InterfaceInfo>();
  const [invokeRes, setInvokeRes] = useState<any>();
  const [invokeLoading, setInvokeLoading] = useState(false);
  const [userInfo,setUserInfo] = useState({id:-1})
  const [userInterfaceInfo,setUserInterfaceInfo] = useState({
    leftNum: 0,
    totalNum:0,
    status:0,
  })

  const params = useParams();

  //申请接口调用次数对话框
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  let modalInputNumber = ''
  const modalInputOnchange= (e)=>{
    modalInputNumber = e.target.value
  }
  const handleOk = () => {
    setIsModalOpen(false);
    //向后端发送申请
    applyForCallNumber()
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };


  //加载接口数据
  const loadData = async () => {
    if (!params.id) {
      message.error('参数不存在');
      return;
    }
    setLoading(true);
    //获取接口信息
    try {
      const res = await getInterfaceInfoByIdUsingGET({
        id: Number(params.id),
      });
      setData(res.data);
    } catch (error: any) {
      message.error('请求失败，' + error.message);
    }
    //获取用户信息
    try {
      const res = await getLoginUserUsingGET();
      setUserInfo({
        id:res.data.id,
      })
    } catch (error: any) {
      message.error('请求失败，' + error.message);
    }

    setLoading(false);
  };
  useEffect(() => {
    loadData();
  }, []);
  useEffect(() => {
    loadUserInterfaceInfo();
  }, [userInfo]);
  const loadUserInterfaceInfo = async () => {
    //获取用户-接口信息
    try {
      const res = await getUserInterfaceInfoByIdUsingGET({
        interfaceInfoId: Number(params.id),
        userId: userInfo.id
      });
      if (res.data){
        // @ts-ignore
        setUserInterfaceInfo(res.data);
      }
    } catch (error: any) {

    }
  }

  //申请调用次数
  const applyForCallNumber= async()=>{
    try {
      const res = await addUserInterfaceInfoUsingPOST({
        interfaceInfoId:data.id,
        leftNum:parseInt(modalInputNumber),
        totalNum:parseInt(modalInputNumber),
        userId:1
      });
      message.success('申请成功');
      loadData()
    } catch (error: any) {
      message.error('操作失败，' + error.message);
    }
  }


  //在线调用接口
  const onFinish = async (values: any) => {
    if (!params.id) {
      message.error('接口不存在');
      return;
    }

    console.log("invokeInterfaceInfoUsingPOST=",{
      id: params.id,
      url:data.url,
      requestMethod:data.method,
      ...values,
    })
    setInvokeLoading(true);
    try {
      const res = await invokeInterfaceInfoUsingPOST({
        id: params.id,
        url:data.url,
        requestMethod:data.method,
        ...values,
      });
      setInvokeRes(res.data);
      await loadUserInterfaceInfo()
      message.success('请求成功');
    } catch (error: any) {
      message.error('操作失败，' + error.message);
    }
    setInvokeLoading(false);
  };


  return (
    <PageContainer title="查看接口文档">
      <Card>
        {data ? (
          <Descriptions title={data.name} column={1}>
            <Descriptions.Item label="接口状态">{data.status ? '开启' : '关闭'}</Descriptions.Item>
            <Descriptions.Item label="描述">{data.description}</Descriptions.Item>
            <Descriptions.Item label="请求地址">{data.url}</Descriptions.Item>
            <Descriptions.Item label="请求方法">{data.method}</Descriptions.Item>
            <Descriptions.Item label="请求参数">{data.requestParams}</Descriptions.Item>
            <Descriptions.Item label="请求头">{data.requestHeader}</Descriptions.Item>
            <Descriptions.Item label="响应头">{data.responseHeader}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{data.createTime.slice(0, -19)}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{data.updateTime.slice(0, -19)}</Descriptions.Item>
            {data.method==="POST"&&
                <Descriptions.Item label="总调用次数"><div>{userInterfaceInfo.totalNum}{userInterfaceInfo.totalNum !== 0 && userInterfaceInfo.status === 0 ? '（待审核）' : userInterfaceInfo.status === 1 ? '(已拒绝)' : ''}</div></Descriptions.Item>
            }
            {data.method==="POST"&&
                <Descriptions.Item label="剩余调用次数"><div>{userInterfaceInfo.status === 2 ? userInterfaceInfo.leftNum : '0'}</div></Descriptions.Item>
            }
            {data.method==="POST"&&
                <Descriptions.Item label="">
                  <Button type="primary" onClick={showModal}>
                    申请调用次数
                  </Button>
                  <Modal title="申请调用次数" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                    <Input placeholder="请输入调用次数" onChange={modalInputOnchange}/>
                  </Modal>
                </Descriptions.Item>
            }
          </Descriptions>
        ) : (
          <>接口不存在</>
        )}
      </Card>
      <Divider />
      <Card title="在线测试">
        <Form name="invoke" layout="vertical" onFinish={onFinish}>
          <Form.Item label="请求参数" name="userRequestParams">
            <Input.TextArea />
          </Form.Item>
          <Form.Item wrapperCol={{ span: 16 }}>
            <Button type="primary" htmlType="submit">
              调用
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Divider />
      <Card title="返回结果" loading={invokeLoading}>
        {invokeRes}
      </Card>
    </PageContainer>
  );
};

export default Index;
