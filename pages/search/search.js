// 本组件为搜索组件
// 需要传入addflag   值为true / false （是否显示搜索框右侧部分）
// 若显示搜索框右侧部分，addflag值为true  需传入右侧图标url以及addhandle函数
const WXAPI = require('../../wxapi/main')

Component({

  properties: {

    addflag: { //显示搜索框右侧部分
      type: Boolean,
      value: false, //如果不传addflg，那么默认不显示
      observer(newVal, oldVal, changedPath) {

      }
    },
    addimg: { //显示搜索框右侧部分icon
      type: String,
      value: ''
    },
    searchstr: { //input  值
      type: String,
      value: ''
    },

  },

  /**
   * 组件的初始数据
   */
  data: {
    searchflag: false, //搜索框 取消按钮显示与隐藏
    searchGoods: [],
    newGoods: [],
    sectionData: [],
    ifLoadMore: null
  },

  /**
   * 组件的方法列表

   */
  methods: {

    //获得焦点
    getfocus() {
      this.setData({
        searchflag: true,
      })
    },
    //搜索框右侧按钮事件
    addhandle() {
      this.triggerEvent("addhandle");
    },
    //搜索输入
    searchList(e) {
      this.triggerEvent("searchList", e);
      const that = this;
      let searchVal = e.detail.value.replace(/(^\s*)|(\s*$)/g, "");
      if (searchVal == null || searchVal == '') {
        that.setData({
          searchGoods: ''
        })
        //加载福利专场
        that.newGoodsShow();
        return;
      }
      WXAPI.goods({
        nameLike: searchVal,
        page: 1,
        pageSize: 100000,
        token: wx.getStorageSync('token')
      }).then(function(res) {
        if (res.code == 404 || res.code == 700) {
          return
        }
        that.setData({
          searchGoods: res.data
        })
        //加载福利专场
        that.newGoodsShow();
      })

    },
    //查询
    endsearchList(e) {
      this.triggerEvent("endsearchList");
    },
    //失去焦点
    blursearch(e) {
      this.triggerEvent("blursearch");
    },
    // 取消
    cancelsearch() {
      this.setData({
        searchflag: false,
      })
      this.triggerEvent("cancelsearch");
    },
    //清空搜索框
    activity_clear(e) {
      this.triggerEvent("activity_clear");
    },
    newGoodsShow(e) {
      const that = this;
      let newGoodsData = that.data.searchGoods;
      let ifLoadMore = that.data.ifLoadMore;
      let sectionData = [];
      if (ifLoadMore) {
        //加载更多
        if (newGoodsData.length > 0) {
          sectionData.concat(newGoodsData);
        } else {
          ifLoadMore = false;
          this.setData({
            hidden: true
          })
          wx.showToast({
            title: '暂无更多内容！',
            icon: 'loading',
            duration: 2000
          })
        }

      } else {
        if (ifLoadMore == null) {
          ifLoadMore = true;
          sectionData = newGoodsData; //刷新
        }
      }
      that.setData({
        searchGoods: sectionData,
        // isHideLoadMore: true
      });
      wx.stopPullDownRefresh(); //结束动画
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
      var that = this;
      if (that.data.ifLoadMore != null) {
        that.newGoodsShow();
      }
    },
    toDetailsTap(e) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }

  }
})