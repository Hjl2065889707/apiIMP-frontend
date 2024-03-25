export default [
  { path: '/', name: '接口广场', icon: 'RedditOutlined', component: './Index' },
  { path: '/interface_info/:id',
    name: '查看接口',
    icon: 'smile',
    component: './InterfaceInfo',
    hideInMenu: true
  },
  {
    path: '/user',
    layout: false,
    routes: [{ name: '登录', path: '/user/login', component: './User/Login' }],
  },
  {
    name: '接口申请',
    path: '/interface_apply',
    icon: 'ApiOutlined',
    component: './InterfaceApply'
  },
  { name: '接口管理',
    icon: 'table',
    path: '/admin/interface_info',
    access: 'canAdmin',
    component: './Admin/InterfaceInfo'
  },
  { name: '申请处理',
    path: '/admin/handel_application',
    icon: 'ProfileOutlined',
    access: 'canAdmin',
    component: './Admin/HandelApplication'
  },
  {
    name: '个人中心',
    path: '/userInfo',
    icon: 'crown',
    component: './User/UserInfo'
  },


  { path: '*', layout: false, component: './404' },
];
