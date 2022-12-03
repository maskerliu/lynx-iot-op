export default {
  login: {
    phone: '请输入您的手机号',
    sendVerifyCode: '发送验证码',
    done: '登录',
  },
  common: {
    search: '搜索',
    done: '确定',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    save: '保存',
    upload: '上传',
    submit: '提交',
    bind: '绑定',
    searchPlaceholder: '请输入搜索关键词',
  },
  iot: {
    device: {
      title: '设备详情',
      name: '设备名',
      address: '地址',
      company: '所属公司',
      delete: {
        title: '警告❗️',
        confirm: '确定要从系统中移除【{deviceId}】这台设备吗？',
        confirm1: '设备移除后，设备上的数据将在系统中无法收集，请谨慎操作！！！',
      }
    }
  },
  company: {
    title: '公司管理',
    base: {
      title: '基本信息',
      name: '公司名',
      owner: '负责人',
      tel: '联系电话',
      address: '地址',
      submit: '提交新公司认证',
    },
    role: {
      title: '角色管理',
      name: '职务名',
      desc: '备注',
      curPrivileges: '当前权限',
      allPrivileges: '可选权限',
      add: '添加新的角色',
    },
    operator: {
      title: '人员管理',
      add: '添加新的运营人员',
      name: '姓名',
      curRoles: '当前角色',
      allRoles: '可选角色'
    },
  },
  mine: {
    needUpdateProfile: '请先更新您的个人资料',
    company: '公司',
    createCompany: '尚未绑定公司，请去创建或联系管理员',
    bindDevice: '绑定设备',
    settings: '设置',
    profile: {
      title: '个人资料',
      avatar: '头像',
      name: '姓名',
      phone: '手机号',
    }
  },
  settings: {
    title: '设置',
    sys: {
      title: '系统信息',
      mqttBroker: 'MQTT服务',
      about: '关于',
      help: '帮助与反馈',
    },
    notify: {
      title: '消息通知',
      sound: '消息声音',
      vibrate: '震动',
    },
    fontlang: {
      title: '字体与多语言',
      fontSize: '字体大小',
      multiLang: '多语言',
    },
    about: {
      privacy: '隐私政策',
      sdks: '三方SDK目录',
      privacySummary: '隐私政策摘要',
      customerService: '客服电话',
    },
    help: {
      feedback: '问题反馈',
      feedbackTitle: '问题描述',
      feedbackPlaceholder: '请留下您的宝贵意见，我们将努力改进',
      feedbackSnaps: '截图（可选）',
      onlineHelp: '在线客服'
    },
    logout: '退出登录',
  },
  message: {
    title: '消息中心'
  }
}