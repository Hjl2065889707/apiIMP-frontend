import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import '@umijs/max';
import { Button, Drawer, message } from 'antd';
import React, { useRef, useState } from 'react';
import type { SortOrder } from 'antd/es/table/interface';
import {
  addInterfaceInfoUsingPOST,
  deleteInterfaceInfoUsingPOST,
  listInterfaceInfoByPageUsingGET,
  offlineInterfaceInfoUsingPOST,
  onlineInterfaceInfoUsingPOST,
  updateInterfaceInfoUsingPOST
} from '@/services/yuapi-backend/interfaceInfoController';
import CreateModal from '@/pages/Admin/InterfaceInfo/components/CreateModal';
import UpdateModal from "@/pages/Admin/InterfaceInfo/components/UpdateModal";
import {
  listUserInterfaceInfoByPageUsingGET,
  updateUserInterfaceInfoUsingPOST
} from "@/services/yuapi-backend/userInterfaceInfoController";

const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.InterfaceInfo>();
  const [selectedRowsState, setSelectedRows] = useState<API.InterfaceInfo[]>([]);

  /**
   * 同意申请
   *
   * @param record
   */
  const handleAgree = async (record: API.IdRequest) => {
    const hide = message.loading('同意中');
    if (!record) return true;
    console.log("record=",record)
    try {
      await updateUserInterfaceInfoUsingPOST({
        ...record,
        status: 2,
      });
      hide();
      message.success('操作成功');
      await actionRef.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error('操作失败，' + error.message);
      return false;
    }
  };


  /**
   *  refuse application
   * @zh-CN 拒绝申请
   *
   * @param record
   */
  const handleReject = async (record: API.InterfaceInfo) => {
    const hide = message.loading('正在拒绝');
    if (!record) return true;
    console.log("record=",record)
    try {
      await updateUserInterfaceInfoUsingPOST({
        ...record,
        status: 1,
      });
      hide();
      message.success('操作成功');
      await actionRef.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error('操作失败，' + error.message);
      return false;
    }
  };


  const columns: ProColumns<API.UserInterfaceInfo>[] = [
    {
      title: '用户账号',
      dataIndex: 'userId',
      valueType: 'text',
      formItemProps: {
        rules: [{
          required: true,
        }]
      }
    },
    {
      title: '接口ID',
      dataIndex: 'interfaceInfoId',
      valueType: 'textarea',
    },
    {
      title: '接口名称',
      dataIndex: 'interfaceName',
      valueType: 'text',
    },
    {
      title: '申请次数',
      dataIndex: 'totalNum',
      valueType: 'text',
    },
    {
      title: '状态',
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        0: {
          text: '待审核',
          status: 'Default',
        },
        1: {
          text: '拒绝',
          status: 'Error',
        },
        2: {
          text: '同意',
          status: 'Success',
        },
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="config1"
          onClick={() => {
            handleAgree(record);
          }}
        >
          同意
        </a>,
        <Button
          type="text"
          danger
          key="config2"
          onClick={() => {
            handleReject(record);
          }}
        >
          拒绝
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={'接口申请表格'}
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
        ]}
        request={async (
          params,
          sort: Record<string, SortOrder>,
          filter: Record<string, React.ReactText[] | null>,
        ) => {
          //todo 修改
          const res: any = await listUserInterfaceInfoByPageUsingGET({
            ...params,
          });
          if (res?.data) {
            return {
              data: res?.data.records || [],
              success: true,
              total: res?.data.total || 0,
            };
          } else {
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      <Drawer
        width={10}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.RuleListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.RuleListItem>[]}
          />
        )}
      </Drawer>

    </PageContainer>
  );
};
export default TableList;
