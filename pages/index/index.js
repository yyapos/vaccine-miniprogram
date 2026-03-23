const { http, API } = require("../../utils/request.js");

Page({
  data: {
    userInfo: {},
    children: [],
    recentAppointments: [],
    displayAppointments: [],
    appointmentCount: 0,
    unreadReminderCount: 0,
    currentAnnouncement: null
  },

  onLoad() {
    this.loadUserData();
    this.loadRecentAppointments();
  },

  onShow() {
    const app = getApp();
    console.log('首页 onShow，登录状态:', {
      hasToken: !!app.globalData.token,
      hasUserInfo: !!app.globalData.userInfo
    });

    // 每次显示时刷新数据
    this.loadUserData();
    
    // 确保用户数据加载完成后再加载预约记录
    setTimeout(() => {
      this.loadRecentAppointments();
    }, 100);
    
    this.loadUnreadReminderCount();
    this.loadPopupAnnouncements();
  },

  // 加载用户数据
  loadUserData() {
    const app = getApp();
    this.setData({
      userInfo: app.globalData.userInfo || {
        nickname: '微信用户',
        avatar: '',
        phone: ''
      },
      children: app.globalData.children || [],
      appointmentCount: app.globalData.children.length > 0 ? app.globalData.children.length * 2 : 0
    });
  },

  // 加载最近预约
  loadRecentAppointments() {
    const app = getApp();

    // 检查是否已登录
    if (!app.globalData.token) {
      console.log('未登录，跳过加载预约记录');
      this.setData({
        recentAppointments: [],
        displayAppointments: [],
        appointmentCount: 0
      });
      return;
    }

    if (this.data.children.length === 0) {
      console.log('没有儿童，跳过加载预约记录');
      this.setData({
        recentAppointments: [],
        displayAppointments: [],
        appointmentCount: 0
      });
      return;
    }

    console.log('开始加载所有儿童的预约记录，儿童数量:', this.data.children.length);

    // 获取所有儿童的最近预约（合并所有儿童的预约）
    const allAppointments = [];
    let loadedCount = 0;
    let errorCount = 0;
    
    this.data.children.forEach((child, index) => {
      http.get(API.GET_CHILD_RECORDS + child.id).then(res => {
        const appointments = res.data || [];
        console.log(`儿童 ${child.name} (ID: ${child.id}) 的预约记录:`, appointments);
        console.log(`预约记录数量:`, appointments.length);
        
        // 添加状态文本
        const formattedAppointments = appointments.map(item => ({
          ...item,
          statusText: this.getStatusText(item.status)
        }));
        
        allAppointments.push(...formattedAppointments);
        loadedCount++;
        
        console.log(`已加载 ${loadedCount}/${this.data.children.length} 个儿童的预约记录`);
        
        // 当所有儿童的预约都加载完成后
        if (loadedCount + errorCount === this.data.children.length) {
          console.log('所有儿童预约记录加载完成，总数量:', allAppointments.length);
          
          console.log('排序前的预约记录（按原始顺序）:');
          allAppointments.forEach((item, index) => {
            console.log(`${index + 1}. ID=${item.id}, createTime=${item.createTime}, appointmentDate=${item.appointmentDate}`);
          });
          
          // 按创建时间倒序排序（最新的预约记录排在前面）
          allAppointments.sort((a, b) => {
            const timeA = new Date(a.createTime).getTime();
            const timeB = new Date(b.createTime).getTime();
            const result = timeB - timeA; // 降序，B在前面表示B更新
            console.log(`比较: ${a.id}(${a.createTime}) vs ${b.id}(${b.createTime}) => ${result}`);
            return result;
          });
          
          console.log('排序后的预约记录（按创建时间倒序）:');
          allAppointments.forEach((item, index) => {
            console.log(`${index + 1}. ID=${item.id}, createTime=${item.createTime}, appointmentDate=${item.appointmentDate}`);
          });
          
          // 只显示最近3条
          const recentAppointments = allAppointments.slice(0, 3);
          
          console.log('显示的最近3条预约:');
          recentAppointments.forEach((item, index) => {
            console.log(`${index + 1}. 儿童=${item.childName}, 疫苗=${item.vaccineName}, 预约日期=${item.appointmentDate}, 创建时间=${item.createTime}`);
          });
          
          this.setData({
            recentAppointments: recentAppointments,
            displayAppointments: recentAppointments,
            appointmentCount: allAppointments.length
          });
        }
      }).catch(err => {
        console.error(`加载儿童 ${child.name} 预约记录失败:`, err);
        errorCount++;
        
        // 当所有儿童的预约都加载完成后（包括失败的）
        if (loadedCount + errorCount === this.data.children.length) {
          console.log('所有儿童预约记录加载完成（部分失败），总数量:', allAppointments.length);
          
          // 按创建时间倒序排序
          allAppointments.sort((a, b) => {
            return new Date(b.createTime) - new Date(a.createTime);
          });
          
          // 只显示最近3条
          const recentAppointments = allAppointments.slice(0, 3);
          
          this.setData({
            recentAppointments: recentAppointments,
            displayAppointments: recentAppointments,
            appointmentCount: allAppointments.length
          });
        }
      });
    });
  },

  // 加载未读提醒数量
  loadUnreadReminderCount() {
    const app = getApp();

    // 检查是否已登录
    if (!app.globalData.token) {
      console.log('未登录，跳过加载提醒数量');
      this.setData({
        unreadReminderCount: 0
      });
      return;
    }

    http.get(API.GET_UNREAD_COUNT).then(res => {
      this.setData({
        unreadReminderCount: res.data || 0
      });
    }).catch(err => {
      console.error("加载未读提醒数量失败:", err);
      // 设置为0，不影响其他功能
      this.setData({
        unreadReminderCount: 0
      });
    });
  },

  // 加载弹窗公告
  loadPopupAnnouncements() {
    const app = getApp();

    // 检查是否已登录
    if (!app.globalData.token) {
      console.log('未登录，跳过加载公告');
      return;
    }

    http.get(API.GET_POPUP_ANNOUNCEMENTS).then(res => {
      const announcements = res.data || [];
      if (announcements.length > 0) {
        // 显示最新的公告
        const announcement = announcements[0];
        wx.showModal({
          title: '📢 ' + announcement.title,
          content: announcement.content,
          showCancel: false,
          confirmText: '我知道了'
        });
      }
    }).catch(err => {
      console.error("加载公告弹窗失败:", err);
    });
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      0: "待审核",
      1: "已通过",
      2: "已拒绝",
      3: "已完成",
      4: "已取消"
    };
    return statusMap[status] || "未知";
  },

  // 页面跳转
  navigateTo(e) {
    const url = e.currentTarget.dataset.url;

    // tabBar 页面列表（只有首页、论坛、我的）
    const tabBarPages = [
      '/pages/index/index',
      '/pages/forum-index/forum-index',
      '/pages/profile/profile'
    ];

    // 判断是否是 tabBar 页面
    if (tabBarPages.includes(url)) {
      wx.switchTab({
        url: url,
        fail: (err) => {
          console.error('跳转失败:', err);
          wx.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    } else {
      wx.navigateTo({
        url: url,
        fail: (err) => {
          console.error('跳转失败:', err);
          wx.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    }
  },

  // 查看预约详情
  viewAppointment(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/appointment-detail/appointment-detail?id=${id}`
    });
  },

  // 显示提醒功能
  showNotice() {
    if (this.data.unreadReminderCount > 0) {
      wx.navigateTo({
        url: '/pages/reminder/reminder'
      });
    } else {
      wx.showToast({
        title: "暂无新提醒",
        icon: "none"
      });
    }
  }
});