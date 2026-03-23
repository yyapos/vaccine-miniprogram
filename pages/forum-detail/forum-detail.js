const { http, API } = require("../../utils/request.js");

Page({
  data: {
    postId: null,
    post: null,
    comments: [],
    loading: false,
    isLiked: false,
    commentInput: ''
  },

  onLoad(options) {
    const postId = options.id;
    this.setData({ postId });
    this.loadPostDetail();
    this.loadComments();
  },

  // 加载帖子详情
  loadPostDetail() {
    if (!this.data.postId) return;

    this.setData({ loading: true });

    // 检查是否在24小时内已浏览过该帖子
    const viewKey = `viewed_post_${this.data.postId}`;
    const lastViewTime = wx.getStorageSync(viewKey);
    const currentTime = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    // 如果24小时内已浏览过，使用不增加浏览量的接口
    // 否则使用普通接口，会增加浏览量
    const shouldIncrementView = !lastViewTime || (currentTime - lastViewTime > oneDay);

    http.get(API.GET_POST_DETAIL + this.data.postId).then(res => {
      const post = res.data;
      this.setData({
        post: post,
        loading: false
      });

      // 如果是首次浏览或超过24小时，记录浏览时间
      if (shouldIncrementView) {
        wx.setStorageSync(viewKey, currentTime);
      }

      this.checkLikeStatus();
    }).catch(err => {
      console.error("加载帖子详情失败:", err);
      this.setData({ loading: false });
    });
  },

  // 加载评论
  loadComments() {
    if (!this.data.postId) return;

    http.get(API.GET_COMMENTS + this.data.postId + '/comments').then(res => {
      const comments = res.data || [];
      this.setData({ comments });
    }).catch(err => {
      console.error("加载评论失败:", err);
    });
  },

  // 检查点赞状态
  checkLikeStatus() {
    if (!this.data.postId) return;
    
    http.get(API.CHECK_LIKE, {
      targetId: this.data.postId,
      targetType: 'post'
    }).then(res => {
      this.setData({ isLiked: res.data === true });
    }).catch(err => {
      console.error("检查点赞状态失败:", err);
    });
  },

  // 点赞/取消点赞
  toggleLike() {
    if (!this.data.postId) return;

    http.post(API.LIKE_TOGGLE, {
      targetId: this.data.postId,
      targetType: 'post'
    }).then(res => {
      // 使用后端返回的 liked 值，而不是反转本地状态
      const liked = res.data.liked;
      this.setData({ isLiked: liked });

      // 根据后端返回的 liked 值更新点赞数
      const post = this.data.post;
      if (liked) {
        // 点赞成功，点赞数+1
        post.likeCount = (post.likeCount || 0) + 1;
      } else {
        // 取消点赞成功，点赞数-1
        post.likeCount = Math.max(0, (post.likeCount || 0) - 1);
      }
      this.setData({ post });

      wx.showToast({
        title: liked ? '点赞成功' : '取消点赞',
        icon: 'success'
      });
    }).catch(err => {
      console.error("点赞操作失败:", err);
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    });
  },

  // 评论输入
  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value });
  },

  // 提交评论
  submitComment() {
    if (!this.data.commentInput.trim()) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      });
      return;
    }
    
    http.post(API.CREATE_COMMENT, {
      postId: this.data.postId,
      content: this.data.commentInput.trim()
    }).then(res => {
      wx.showToast({
        title: '评论成功',
        icon: 'success'
      });
      this.setData({ commentInput: '' });
      this.loadComments();
    }).catch(err => {
      console.error("提交评论失败:", err);
      wx.showToast({
        title: '评论失败',
        icon: 'none'
      });
    });
  },

  // 删除评论
  deleteComment(e) {
    const commentId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条评论吗？',
      success: (res) => {
        if (res.confirm) {
          http.delete(API.DELETE_COMMENT + commentId).then(() => {
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            this.loadComments();
          }).catch(err => {
            console.error("删除评论失败:", err);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          });
        }
      }
    });
  }
});