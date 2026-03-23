const { http, API } = require("../../utils/request.js");

Page({
  data: {
    childId: null,
    vaccineId: null,
    child: null,
    vaccine: null,
    doseNumber: 1,
    doseOptions: [], // 剂次选项数组
    scheduledDate: '',
    minDate: '',
    loading: false
  },

  onLoad(options) {
    if (options.childId && options.vaccineId) {
      this.setData({
        childId: parseInt(options.childId),
        vaccineId: parseInt(options.vaccineId)
      });
      this.loadData();
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }

    // 设置最小日期为明天
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.setData({
      minDate: tomorrow.toISOString().split('T')[0]
    });
  },

  // 加载数据
  loadData() {
    const app = getApp();
    
    // 获取儿童信息
    const children = app.globalData.children || [];
    const child = children.find(c => c.id === this.data.childId);
    if (child) {
      this.setData({ child });
    }

    // 获取疫苗信息
    http.get(API.GET_VACCINE_DETAIL + this.data.vaccineId).then(res => {
      const vaccine = res.data;
      // 生成剂次选项数组
      const doseOptions = [];
      if (vaccine && vaccine.doseNumber) {
        for (let i = 1; i <= vaccine.doseNumber; i++) {
          doseOptions.push({
            value: i,
            name: `第 ${i} 次`
          });
        }
      }
      
      this.setData({
        vaccine: vaccine,
        doseOptions: doseOptions
      });
    }).catch(err => {
      console.error('加载疫苗信息失败:', err);
    });
  },

  // 选择接种日期
  onDateChange(e) {
    this.setData({
      scheduledDate: e.detail.value
    });
  },

  // 选择接种次数
  onDoseChange(e) {
    this.setData({
      doseNumber: parseInt(e.detail.value) + 1
    });
  },

  // 提交预约
  handleSubmit() {
    if (!this.data.scheduledDate) {
      wx.showToast({
        title: '请选择接种日期',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    const appointmentData = {
      childId: this.data.childId,
      vaccineId: this.data.vaccineId,
      doseNumber: this.data.doseNumber,  // 添加剂次信息
      appointmentDate: this.data.scheduledDate
    };

    console.log('发送预约数据:', appointmentData);
    console.log('儿童信息:', this.data.child);

    http.post(API.CREATE_APPOINTMENT, appointmentData).then(res => {
      wx.showToast({
        title: '预约成功',
        icon: 'success'
      });

      setTimeout(() => {
        this.setData({ loading: false });
        wx.navigateBack();
      }, 1500);
    }).catch(err => {
      this.setData({ loading: false });
      console.error('预约失败:', err);
    });
  },

  // 取消预约
  handleCancel() {
    wx.navigateBack();
  }
});