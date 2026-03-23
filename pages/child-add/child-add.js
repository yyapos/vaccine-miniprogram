const { http, API } = require("../../utils/request.js");

Page({
  data: {
    child: {
      name: '',
      gender: 1,
      birthDate: '',
      idCard: '',
      address: '',
      isKeyChild: false,
      keyReason: ''
    },
    genderOptions: ['男', '女'],
    genderIndex: 0,
    today: '',
    loading: false
  },

  onLoad() {
    // 设置今天的日期
    const today = new Date().toISOString().split('T')[0];
    this.setData({ today });
  },

  // 姓名输入
  onNameInput(e) {
    this.setData({
      'child.name': e.detail.value
    });
  },

  // 性别选择
  onGenderChange(e) {
    this.setData({
      genderIndex: parseInt(e.detail.value),
      'child.gender': parseInt(e.detail.value) + 1
    });
  },

  // 出生日期选择
  onBirthDateChange(e) {
    this.setData({
      'child.birthDate': e.detail.value
    });
  },

  // 身份证号输入
  onIdCardInput(e) {
    this.setData({
      'child.idCard': e.detail.value
    });
  },

  // 家庭住址输入
  onAddressInput(e) {
    this.setData({
      'child.address': e.detail.value
    });
  },

  // 重点儿童开关
  onKeyChildChange(e) {
    this.setData({
      'child.isKeyChild': e.detail.value
    });
  },

  // 重点原因输入
  onKeyReasonInput(e) {
    this.setData({
      'child.keyReason': e.detail.value
    });
  },

  // 取消
  onCancel() {
    wx.navigateBack();
  },

  // 提交
  onSubmit() {
    const child = this.data.child;

    // 表单验证
    if (!child.name) {
      wx.showToast({
        title: '请输入儿童姓名',
        icon: 'none'
      });
      return;
    }

    if (!child.birthDate) {
      wx.showToast({
        title: '请选择出生日期',
        icon: 'none'
      });
      return;
    }

    // 重点儿童必须填写重点原因
    if (child.isKeyChild && !child.keyReason) {
      wx.showToast({
        title: '请填写重点原因',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    // 转换数据类型以匹配后端
    const postData = {
      name: child.name,
      gender: parseInt(child.gender),  // 确保是整数
      birthDate: child.birthDate,      // yyyy-MM-dd格式
      idCard: child.idCard || null,
      address: child.address || null,
      isKeyChild: child.isKeyChild ? 1 : 0,  // boolean转integer
      keyReason: child.isKeyChild ? child.keyReason : null
    };

    console.log('发送儿童数据:', postData);

    http.post(API.ADD_CHILD, postData).then(res => {
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });

      // 刷新全局数据
      const app = getApp();
      app.loadChildren();

      setTimeout(() => {
        this.setData({ loading: false });
        wx.navigateBack();
      }, 1500);
    }).catch(err => {
      this.setData({ loading: false });
      console.error('添加儿童失败:', err);
    });
  }
});