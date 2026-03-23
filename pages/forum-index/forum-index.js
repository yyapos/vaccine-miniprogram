const { http, API } = require("../../utils/request.js");

Page({
  data: {
    posts: [],
    announcements: [],
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    keyword: '',
    sortBy: 'latest' // latest: 最新, hot: 最热
  },

  onLoad() {
    this.loadAnnouncements();
    this.loadPosts();
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadAnnouncements();
    this.loadPosts();
  },

  // 加载公告
  loadAnnouncements() {
    http.get(API.GET_ANNOUNCEMENTS).then(res => {
      const announcements = res.data || [];
      this.setData({
        announcements: announcements
      });
    }).catch(err => {
      console.error("加载公告失败:", err);
    });
  },

  // 加载帖子列表
  loadPosts() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    const params = {
      page: this.data.page,
      pageSize: this.data.pageSize,
      sortBy: this.data.sortBy // 添加排序参数
    };

    // 如果有搜索关键词，添加到参数中
    if (this.data.keyword) {
      params.keyword = this.data.keyword;
    }

    http.get(API.GET_POSTS, params).then(res => {
      const newPosts = res.data || [];
      this.setData({
        posts: this.data.page === 1 ? newPosts : this.data.posts.concat(newPosts),
        loading: false,
        hasMore: newPosts.length >= this.data.pageSize
      });
    }).catch(err => {
      console.error("加载帖子失败:", err);
      this.setData({ loading: false });
    });
  },

  // 查看帖子详情或公告
  viewPostDetail(e) {
    const id = e.currentTarget.dataset.id;
    const type = e.currentTarget.dataset.type || 'post'; // 默认为帖子

    if (type === 'announcement') {
      // 如果是公告，显示弹窗
      const announcement = this.data.announcements.find(a => a.id === id);
      if (announcement) {
        wx.showModal({
          title: announcement.title,
          content: announcement.content,
          showCancel: false,
          confirmText: '我知道了'
        });
      }
    } else {
      // 如果是帖子，跳转到详情页
      wx.navigateTo({
        url: `/pages/forum-detail/forum-detail?id=${id}`
      });
    }
  },

  // 发表帖子
  createPost() {
    wx.navigateTo({
      url: '/pages/forum-create/forum-create'
    });
  },

  // 刷新列表
  onPullDownRefresh() {
    this.setData({
      page: 1,
      posts: []
    });
    this.loadPosts();
    this.loadAnnouncements();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 加载更多
  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.setData({
      page: this.data.page + 1
    });
    this.loadPosts();
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  // 执行搜索
  onSearch() {
    this.setData({
      page: 1,
      posts: [],
      hasMore: true
    });
    this.loadPosts();
  },

  // 切换排序方式
  switchSort(e) {
    const sortType = e.currentTarget.dataset.sort;
    if (this.data.sortBy === sortType) return;

    this.setData({
      sortBy: sortType,
      page: 1,
      posts: [],
      hasMore: true
    });
    this.loadPosts();
  }
});