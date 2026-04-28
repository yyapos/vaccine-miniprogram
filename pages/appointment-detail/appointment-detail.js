const { http, API } = require("../../utils/request.js");

Page({
  data: {
    appointmentId: null,
    appointment: null,
    loading: true,
    canCancel: false
  },

  onLoad(options) {
    const id = options.id;
    if (id) {
      this.setData({ appointmentId: id });
      this.loadAppointmentDetail(id);
    } else {
      wx.showToast({
        title: "参数错误",
        icon: "none"
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 加载预约详情
  loadAppointmentDetail(id) {
    this.setData({ loading: true });
    
    http.get(API.GET_APPOINTMENT_DETAIL + id).then(res => {
      const appointment = res.data || {};
      this.setData({
        appointment: {
          ...appointment,
          statusText: this.getStatusText(appointment.status),
          statusIcon: this.getStatusIcon(appointment.status)
        },
        canCancel: this.canCancelAppointment(appointment.status),
        loading: false
      });
    }).catch(err => {
      console.error("加载预约详情失败:", err);
      this.setData({ loading: false });
      wx.showToast({
        title: "加载失败",
        icon: "none"
      });
    });
  },

  // 取消预约
  cancelAppointment() {
    wx.showModal({
      title: "确认取消",
      content: "确定要取消这个预约吗？",
      success: (res) => {
        if (res.confirm) {
          this.doCancelAppointment();
        }
      }
    });
  },

  // 执行取消预约
  doCancelAppointment() {
    wx.showLoading({ title: "取消中..." });
    
    http.put(API.CANCEL_APPOINTMENT + this.data.appointmentId, {
      reason: "家长主动取消"
    }).then(res => {
      wx.hideLoading();
      wx.showToast({
        title: "取消成功",
        icon: "success"
      });
      // 刷新详情
      this.loadAppointmentDetail(this.data.appointmentId);
    }).catch(err => {
      wx.hideLoading();
      console.error("取消预约失败:", err);
      wx.showToast({
        title: err.message || "取消失败",
        icon: "none"
      });
    });
  },

  canCancelAppointment(status) {
    return status === 0 || status === 1;
  },

  getStatusText(status) {
    const map = {
      0: "待审核",
      1: "已通过",
      2: "已拒绝",
      3: "已完成",
      4: "已取消"
    };
    return map[status] || "未知";
  },

  getStatusIcon(status) {
    const map = {
      0: "⏳",
      1: "✅",
      2: "❌",
      3: "✅",
      4: "🚫"
    };
    return map[status] || "❓";
  },

  // 重新预约
  rebookAppointment() {
    wx.navigateTo({
      url: '/pages/appointment-booking/appointment-booking'
    });
  },

  // 查看儿童信息
  viewChildInfo() {
    if (this.data.appointment && this.data.appointment.childId) {
      wx.navigateTo({
        url: `/pages/child-detail/child-detail?id=${this.data.appointment.childId}`
      });
    }
  },

  // 查看疫苗信息
  viewVaccineInfo() {
    if (this.data.appointment && this.data.appointment.vaccineId) {
      wx.navigateTo({
        url: `/pages/vaccine-detail/vaccine-detail?id=${this.data.appointment.vaccineId}`
      });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadAppointmentDetail(this.data.appointmentId);
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});