import { PageContainer } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import {ConfigProvider, List, message} from 'antd';
import { listInterfaceInfoByPageUsingGET } from '@/services/yuapi-backend/interfaceInfoController';

/**
 * 接口广场
 * @constructor
 */
const Index: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<API.InterfaceInfo[]>([]);
  const [total, setTotal] = useState<number>(0);
  const pageSize = 7


  const loadData = async (current: number, pageSize: number) => {
    setLoading(true);
    try {
      const res = await listInterfaceInfoByPageUsingGET({
        current,
        pageSize,
      });
      setList(res?.data?.records ?? []);
      setTotal(res?.data?.total ?? 0);
    } catch (error: any) {
      message.error('请求失败，' + error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData(1,pageSize);
  }, []);

  return (
      <PageContainer title="接口集成管理平台">
        <List
            className="my-list"
            loading={loading}
            itemLayout="horizontal"
            dataSource={list}
            renderItem={(item) => {
              const apiLink = `/interface_info/${item.id}`;
              return (
                  <List.Item actions={[<a key={item.id} href={apiLink}>查看</a>]}>
                    <List.Item.Meta
                        title={<a href={apiLink}>{item.name}</a>}
                        description={item.description}
                    />
                  </List.Item>
              );
            }}
            pagination={{
              // eslint-disable-next-line @typescript-eslint/no-shadow
              showTotal(total: number) {
                return '总数：' + total;
              },
              pageSize: pageSize,
              total,
              onChange(page, pageSize) {
                loadData(page, pageSize);
              },
            }}
        />
      </PageContainer>
  );
};

export default Index;
