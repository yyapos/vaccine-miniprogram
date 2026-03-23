Page({
  data: {
    gender: 1,          // 1男 2女
    cityName: "请选择城市",
    city: "",
    avatar: "",         // 用户头像
    nickname: "",        // 用户昵称
    baseUrl: "http://10.180.229.200:9000/api" // API基础路径
  },

  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({ avatar: avatarUrl });
    console.log('选择头像:', avatarUrl);
  },

  // 输入昵称
  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value });
    console.log('输入昵称:', e.detail.value);
  },

  // 选择性别
  onGenderChange(e) {
    this.setData({ gender: e.detail.value });
  },

  // 选择城市
  onCityChange(e) {
    const [province, city] = e.detail.value;
    this.setData({
      cityName: province + " " + city,
      city: city
    });
  },

  // 微信登录（完整版）
  async onWxLogin(e) {
    wx.showLoading({ title: '登录中...', mask: true });

    try {
      console.log('开始登录流程...');

      // 1. 获取手机号code
      if (!e.detail.code) {
        wx.hideLoading();
        wx.showToast({ title: '请授权手机号', icon: 'none' });
        return;
      }
      const phoneCode = e.detail.code;
      console.log('获取到手机号code:', phoneCode);

      // 2. 获取登录code
      const loginRes = await this.wxLogin();
      const code = loginRes.code;
      console.log('获取到登录code:', code);

      // 3. 获取用户输入的信息
      const { gender, city, cityName, avatar, nickname } = this.data;

      // 验证必填项
      if (!nickname || nickname.trim() === '') {
        wx.hideLoading();
        wx.showToast({ title: '请输入昵称', icon: 'none' });
        return;
      }

      if (!city) {
        wx.hideLoading();
        wx.showToast({ title: '请选择城市', icon: 'none' });
        return;
      }

      // 将gender转换为数字类型
      const genderNumber = parseInt(gender);
      console.log('用户信息:', { gender: genderNumber, type: typeof genderNumber, city, cityName, avatar, nickname });

      // 4. 使用用户选择的头像和昵称
      const userAvatar = avatar || '/assets/icons/profile.png';
      const userNickname = nickname || '微信用户';
      console.log('使用用户信息:', { avatar: userAvatar, nickname: userNickname });

      // 5. 请求登录（传给后端）
      const loginData = {
        code: code,
        phoneCode: phoneCode,
        avatar: userAvatar,
        nickname: userNickname,
        gender: genderNumber,  // 确保是数字类型
        city: city
      };
      console.log('发送登录请求:', loginData);

      const response = await this.request({
        url: "/parent/wxlogin",
        method: "POST",
        data: loginData
      });

      console.log('登录响应:', response);

      // 6. 登录成功
      if (response.data && response.data.token) {
        const app = getApp();
        
        // 从后端返回的data中获取完整用户信息
        const backendUser = response.data.data || {};
        
        // 合并用户信息（优先使用后端返回的，前端构造的作为后备）
        const userInfo = {
          id: backendUser.id,
          openid: backendUser.openid,
          nickname: backendUser.nickname || userNickname,
          avatar: backendUser.avatar || userAvatar,
          gender: backendUser.gender || genderNumber,
          city: backendUser.city || city,
          phone: backendUser.phone || ''  // 重要：包含手机号
        };

        // 保存登录信息到globalData和storage
        app.saveLoginInfo(response.data.token, userInfo);

        console.log('登录成功，用户信息:', userInfo);
        console.log('手机号:', userInfo.phone);

        // 加载儿童列表
        await app.loadChildren();
        console.log('儿童列表加载完成:', app.globalData.children);

        wx.hideLoading();
        wx.showToast({ title: "登录成功", icon: 'success' });

        setTimeout(() => {
          wx.switchTab({ url: "/pages/index/index" });
        }, 1500);
      } else {
        throw new Error('登录响应异常：未获取到token');
      }

    } catch (err) {
      wx.hideLoading();
      console.error('登录失败:', err);

      let errorMessage = '登录失败';

      // 根据错误类型显示不同的提示
      if (err.errMsg) {
        if (err.errMsg.includes('request:fail')) {
          errorMessage = '网络连接失败';
        } else if (err.message) {
          errorMessage = err.message;
        }
      }

      if (err.code === 400) {
        errorMessage = '请求参数错误';
      } else if (err.code === 401) {
        errorMessage = '授权失败';
      } else if (err.code === 500) {
        errorMessage = '服务器错误';
      } else if (err.message) {
        errorMessage = err.message;
      }

      wx.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 工具方法
  wxLogin() {
    return new Promise((resolve) => {
      wx.login({ success: resolve });
    });
  },

  request(options) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.data.baseUrl + options.url,
        method: options.method || "GET",
        data: options.data || {},
        header: {
          "Content-Type": "application/json",
          ...options.header
        },
        success: (res) => {
          res.data.code === 200 ? resolve(res.data) : reject(res.data);
        },
        fail: reject
      });
    });
  }
});