const { http, API } = require("../../utils/request.js");

Page({
  data: {
    posts: [],
    loading: true,
    refreshing: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    keyword: ''
  },

  onLoad() {
    // 页面加载时跳转到论坛首页
    wx.switchTab({
      url: '/pages/forum-index/forum-index'
    });
  },

  // 保留原有的方法，以防其他地方调用
  onPullDownRefresh() {
    this.setData({
      refreshing: true,
      page: 1,
      hasMore: true
    });
    this.loadPosts().then(() => {
      this.setData({ refreshing: false });
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({
        page: this.data.page + 1
      });
      this.loadPosts();
    }
  },

  onSearchInput(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  onSearch() {
    this.setData({
      page: 1,
      hasMore: true
    });
    this.loadPosts();
  },

  loadPosts() {
    this.setData({ loading: true });
    return http.get(API.GET_POSTS, {
      page: this.data.page,
      size: this.data.pageSize,
      keyword: this.data.keyword
    }).then(res => {
      const newPosts = res.data.list || [];
      this.setData({
        posts: this.data.page === 1 ? newPosts : [...this.data.posts, ...newPosts],
        hasMore: newPosts.length >= this.data.pageSize,
        loading: false
      });
    }).catch(err => {
      this.setData({ loading: false });
      console.error('加载帖子失败:', err);
    });
  },

  viewPost(e) {
    const id = e.currentTarget.dataset.id;
    // 跳转到帖子详情页面
    wx.navigateTo({
      url: `/pages/forum-detail/forum-detail?id=${id}`
    });
  },

  createPost() {
    wx.navigateTo({
      url: '/pages/forum-create/forum-create'
    });
  },

  formatTime(time) {
    const date = new Date(time);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) {
      return '刚刚';
    } else if (diff < 3600000) {
      return Math.floor(diff / 60000) + '分钟前';
    } else if (diff < 86400000) {
      return Math.floor(diff / 3600000) + '小时前';
    } else {
      return `${date.getMonth() + 1}-${date.getDate()}`;
    }
  }
});