import "./index.less";
import "./sortable.js";

/**
 * url参数匹配规则
 */
//匹配指定字段
//"mgrqispi.dll?APPNAME=HRsoft2000&PRGNAME=MainFrame_Main&ARGUMENTS=-AS3363858644529894882".replace(/(?<=ARGUMENTS=)[\S\s]*(?=\&|)?/gi,'fanjiantao')
//缓存工具方法
var dbUtil = {
    table: "local",
    cache: true,
    dbType: !!window.localStorage ?
        "local" : navigator.cookieEnabled ?
        "cookie" : "var",
    setData: function(value, t) {
        if (!this.cache) {
            return;
        }
        if (this.dbType == "cookie") {
            var oDate = new Date();
            oDate.setDate(oDate.getDate() + (t || 30));

            document.cookie =
                this.table + "=" + value + "; expires=" + oDate.toDateString();
        }
        if (this.dbType == "local") {
            window.localStorage.setItem(this.table, value);
        }
        if (this.dbType == "var") {
            window[this.table] = value;
        }
    },
    getData: function() {
        if (this.dbType == "cookie") {
            var arr1 = document.cookie.split("; ");
            for (var i = 0; i < arr1.length; i++) {
                var arr2 = arr1[i].split("=");
                if (arr2[0] == this.table) {
                    return decodeURI(arr2[1]);
                }
            }
        }
        if (this.dbType == "local") {
            return window.localStorage.getItem(this.table);
        }
        if (this.dbType == "var") {
            return window[this.table];
        }
    },
    removeData: function() {
        console.log("删除数据", this.table);
        if (this.dbType == "cookie") {
            this.setData(this.table, "", -1); // 把cookie设置为过期
        }
        if (this.dbType == "local") {
            window.localStorage.removeItem(this.table);
        }
        if (this.dbType == "var") {
            window[this.table] = null;
        }
    },
};
//store
var store = {
    activeIndex: -1,
    tagList: [],
};
//dom 操作部分开始
//全局获取浏览器滚动条的宽度
var scrollBarWidth = (function() {
    var scrollDiv = document.createElement("div");
    scrollDiv.style.cssText =
        "width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;";
    document.body.appendChild(scrollDiv);
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
})();

//数组对象去重
function distinct(arr, key) {
    var newobj = {},
        newArr = [];
    for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        if (!newobj[item[key]]) {
            newobj[item[key]] = newArr.push(item);
        }
    }
    return newArr;
}

function moveTag() {
    //移动tag和视图
    var currentTag = $(".tagViews .tagItem.active");
    if (!currentTag.position()) return;
    var left = currentTag.position().left;
    var viewWidth = $(".tagViews").width();
    var currentWidth = currentTag.outerWidth();
    var currentLeft = $(".tagViews").scrollLeft();
    var nextWidth = currentTag.next().outerWidth();
    if (nextWidth + left + currentWidth - viewWidth > 0) {
        $(".tagViews").animate({
                scrollLeft: currentLeft + (nextWidth + left + currentWidth - viewWidth),
            },
            500
        );
    }
    if (currentTag.prev().position() && currentTag.prev().position().left <= 0) {
        $(".tagViews").animate({ scrollLeft: currentLeft + currentTag.prev().position().left },
            500
        );
    } else {
        if (left <= 0) {
            $(".tagViews").animate({ scrollLeft: 0 }, 500);
        }
    }

    //不存在的iframe 重新创建
    var check_index = checkView({ path: currentTag.attr("data-path") });
    if (check_index == -1) {
        createIframeView({ path: currentTag.attr("data-path") });
    }

    $(".frameViewBox iframe").hide();
    $(".frameViewBox iframe").eq(check_index).show();
    store.activeIndex = currentTag.index();
    dbUtil.setData(JSON.stringify(store));
    console.log(store, "当前存储数据");
    // console.log("修改store 中对应的数据", store.tagList[currentTag.index()]);
    //进行数据存储
}

function moveView(index) {
    $(".tagViews .tagItem").removeClass("active");
    $(".tagViews .tagItem").eq(index);
    $(".tagViews .tagItem").eq(index).addClass("active");

    moveTag();
}

function checkView(data) {
    //检测是否已创建iframe
    var check_index = -1;
    $(".frameViewBox iframe").each(function(index, item) {
        // console.log($(item).attr("src"), data.path);
        if ($(item).attr("src") == data.path) {
            check_index = index;
        }
    });
    return check_index;
}

function cheackTag(data) {
    var check_index = -1;
    //检测传入的tag是否是已经打开的tag
    $(".tagViews .tagItem").each(function(index, item) {
        // console.log($(item).attr("src"), data.path);
        if ($(item).attr("data-path") == data.path) {
            check_index = index;
        }
    });
    return check_index;
}

function createIframeView(data) {
    var { title, path, id } = data;
    var frame = $(
        `<iframe style="width:100%;height:100%;display:none;" src=${path} id=${id} frameborder="0"></iframe>`
    );

    $(".frameViewBox").append(frame);
    frame[0].src = path;
    console.log("加载中");
    frame.off("load").on("load", function() {
        console.log(arguments);
        console.log(frame.index(), "加载完成");
    });
}

function addTagView(data, _this) {
    let cheackIndex = cheackTag(data);
    if (cheackIndex > -1) {
        moveView(cheackIndex);
        return;
    }
    let { title, path, id } = data;
    $(".tagViews .tagItem").removeClass("active");
    let newTag = !_this ?
        $(
            `<span class="tagItem active border"  data-id="${id}" data-path="${path}">${title}<span class="close" title="关闭标签页">✖</span></span>`
        ) :
        $(
            `<span class="tagItem active border" ${
          _this ? `style="line-height:${_this.layOutData.lineHeight}px"` : ""
        } data-id="${id}" data-path="${path}">${title}<span class="close" ${
          _this.layOutData
            ? `style="margin-top:${_this.layOutData.closeMarginTop}px"`
            : ""
        } title="关闭标签页">✖</span></span>`
      );
  $(".tagViews").append(newTag);
  console.log("添加store 中对应的数据");
  store.tagList.push(data);
  $(newTag).prev();
  createIframeView(data);
  moveTag();
}

/**
 * path 参数处理
 */
function pathReplace(path, params) {
  if (typeof params == "object") {
    var pathlimit = path.split("&");
    for (let i = 0; i < pathlimit.length; i++) {
      for (const key in params) {
        if (Object.hasOwnProperty.call(params, key)) {
          let keyVal = pathlimit[i].split("=");
          if (
            keyVal[0]
              .toLocaleLowerCase()
              .indexOf(key.toString().toLocaleLowerCase()) > -1
          ) {
            if (typeof params[key] == "function") {
              keyVal[1] = params[key](keyVal[1]);
            } else {
              keyVal[1] = params[key];
            }
          }
          pathlimit[i] = keyVal.join("=");
        }
      }
    }

    return pathlimit.join("&");
  } else {
    return path;
  }

  // $.each(params,function(key,value){
  //     console.log(key,value);
  // })
}

/**
 * 用于实例化的主类
 * @param {opt} opt
 */
function TagView(opt) {
  var Namespace = "VanUi-";
  //初始化布局
  this.data = $.extend(true, {}, opt);
  var data = this.data;
  console.log(data.params, "参数字段");
  var viewHeight = "";
  if (typeof data.height == "number" && data.height > 0) {
    // viewHeight = scrollBarWidth + data.height;
    viewHeight = data.height;
  } else {
    // viewHeight = scrollBarWidth + $(data.el).height();
    viewHeight = $(data.el).height();
  }

  // var lineHeight = viewHeight - scrollBarWidth;
  var lineHeight = viewHeight;
  var closeMarginTop = (lineHeight - 15) / 2;
  console.log("lineHeight", lineHeight);
  console.log("layoutHeight", viewHeight);
  console.log("closeMarginTop", closeMarginTop);
  var tagDom = "";
  var layOut = "";
  var viewBox = "";
  var frames = "";
  var activeIndex = "";
  this.layOutData = {
    lineHeight: lineHeight,
    closeMarginTop: closeMarginTop,
    viewHeight: viewHeight,
  };

  var layOutData = this.layOutData;
  var tagList = [];
  if (
    data.cache &&
    typeof data.cache == "object" &&
    JSON.stringify(data.cache) !== "{}"
  ) {
    data.cache.table && (dbUtil.table = data.cache.table); //存储空间
    try {
      store = JSON.parse(dbUtil.getData());
      activeIndex = store.activeIndex;
    //   console.log(store.tagList[activeIndex].path,"当前选中的path");
    } catch (error) {
      store = { activeIndex: -1, tagList: [] };
    }
    //处理store中的参数问题
    $.each(store.tagList,function(index,item){
       item.path = pathReplace(item.path,data.params)
    })

    tagList = distinct(data.tagList.concat(store.tagList), "path");
    console.log(tagList)
    store.tagList = tagList;
  } else {
    tagList = data.tagList;
  }
  // console.log(distinct(data.tagList.concat(store.tagList),"path"));
  if (tagList) {
    // console.log(activeIndex,"缓存里面的index");
    // console.log(data.tagList)
    // console.log($.extend(data.tagList,store.tagList));
    // console.log(store.tagList);
    $.each(tagList, function (index, val) {
      let { title, path, id, active, isAffix, preload } = val;
      if (active) {
        if (activeIndex > -1) {
        } else {
          activeIndex = index;
        }
      }
      //✖
      tagDom += `<span class="tagItem border ${
        activeIndex == index ? "active":""
      }" ${
        layOutData ? `style="line-height:${layOutData.lineHeight}px"` : ""
      }  data-path="${pathReplace(path, data.params)}">${title}${
        isAffix
          ? ""
          : `<span class="close" ${
              layOutData
                ? `style="margin-top:${layOutData.closeMarginTop}px"`
                : ""
            }  title="关闭标签页">✖</span>`
      }</span>`;

      //frames += preload?`<iframe style="width:100%;height:100%;display:${index==activeIndex?"block":"none"};" src=${pathReplace(path,data.params)}  frameborder="0"></iframe>`:"";
    });
    viewBox = `<div class="frameViewBox" style="width:100%;height:100%;overflow:hidden;">${frames}</div>`;
    layOut = `<div class="tagBox" ${
      data.height && `style="height:${data.height}px"`
    } ><div class="tagViews" style="height:${
      layOutData.viewHeight
    }px" >${tagDom}</div></div>`;
  } else {
    layOut = `<div class="tagBox"><div class="tagViews" style="height:${layOutData.viewHeight}px" ></div></div>`;
    viewBox =
      '<div class="frameViewBox" style="width:100%;height:100%;overflow:hidden;"></div>';
  }

  $(function () {
    $(data.el).append(layOut);
    $(data.frameEl).append(viewBox);
    moveTag();
    /**
     * 注册事件
     */
    $(".tagViews").on("click", ".tagItem", function () {
      $(".tagViews .tagItem").removeClass("active");
      $(this).prev();
      $(this).addClass("active")
      moveTag();
    });
    $(".tagViews").on("click", ".tagItem .close", function (event) {
      event.stopPropagation();
      var currentTag = $(this).parent();
      if (currentTag.hasClass("active")) {
        if ($(this).parent().index() == $(".tagViews .tagItem").length - 1) {
          currentTag = $(this).parent().prev();
          $(".tagViews .tagItem").removeClass("active");

          currentTag.prev();
          currentTag.addClass("active");
        } else {
          currentTag = $(this).parent().next();
          $(".tagViews .tagItem").removeClass("active");
          console.log(currentTag.prev()[0], "当前删除的元素");
          $(this).parent().prev();
          currentTag.addClass("active")
        }
      }

      var cheacIndex = checkView({ path: $(this).parent().attr("data-path") });
      if (cheacIndex > -1) {
        $(".frameViewBox iframe").eq(cheacIndex).remove();
      }
      console.log("删除store 中对应的数据", $(this).parent().index());
      store.tagList.splice($(this).parent().index(), 1);
      $(this).parent().remove();
      moveTag();
    });
    
    /**
     * 插件注册
     */
     data.plugins&&data.plugins.forEach((plugin) => {
        if(typeof plugin == "function"){
           plugin({dbUtil});
        }
     })
     

  });
}

TagView.prototype = {
  constructor: TagView,
  renderTagView(){
    /**重新渲染 */
    var tagDom = "";
    var layOut = "";
    var viewBox = "";
    var frames = "";
    var activeIndex = "";
    var layOutData = this.layOutData;
    var data=this.data;
    var tagList = [];
    if (
      data.cache &&
      typeof data.cache == "object" &&
      JSON.stringify(data.cache) !== "{}"
    ) {
      data.cache.table && (dbUtil.table = data.cache.table); //存储空间
      try {
        store = JSON.parse(dbUtil.getData());
        activeIndex = store.activeIndex;
      //   console.log(store.tagList[activeIndex].path,"当前选中的path");
      } catch (error) {
        store = { activeIndex: -1, tagList: [] };
      }
      //处理store中的参数问题
      $.each(store.tagList,function(index,item){
         item.path = pathReplace(item.path,data.params)
      })
  
      tagList = distinct(data.tagList.concat(store.tagList), "path");
      console.log(tagList)
      store.tagList = tagList;
    } else {
      tagList = data.tagList;
    }
    // console.log(distinct(data.tagList.concat(store.tagList),"path"));
    if (tagList) {
      // console.log(activeIndex,"缓存里面的index");
      // console.log(data.tagList)
      // console.log($.extend(data.tagList,store.tagList));
      // console.log(store.tagList);
      $.each(tagList, function (index, val) {
        let { title, path, id, active, isAffix, preload } = val;
        if (active) {
          if (activeIndex > -1) {
          } else {
            activeIndex = index;
          }
        }
        //✖
        tagDom += `<span class="tagItem border ${
          activeIndex == index ? "active":""
        }" ${
          layOutData ? `style="line-height:${layOutData.lineHeight}px"` : ""
        }  data-path="${pathReplace(path, data.params)}">${title}${
          isAffix
            ? ""
            : `<span class="close" ${
                layOutData
                  ? `style="margin-top:${layOutData.closeMarginTop}px"`
                  : ""
              }  title="关闭标签页">✖</span>`
        }</span>`;
  
        //frames += preload?`<iframe style="width:100%;height:100%;display:${index==activeIndex?"block":"none"};" src=${pathReplace(path,data.params)}  frameborder="0"></iframe>`:"";
      });
      layOut = `<div class="tagBox" ${
        data.height && `style="height:${data.height}px"`
      } ><div class="tagViews" style="height:${
        layOutData.viewHeight
      }px" >${tagDom}</div></div>`;
    } else {
      layOut = `<div class="tagBox"><div class="tagViews" style="height:${layOutData.viewHeight}px" ></div></div>`;
    }
  
    $(data.frameEl+` iframe:not([src='${data.tagList[0].path}']`).remove();
    $(data.el).empty();
    $(data.el).append(layOut);
    moveTag();
    $(".tagViews").off('click');
    $(".tagViews").on("click", ".tagItem", function () {
      $(".tagViews .tagItem").removeClass("active");
      $(this).prev();
      $(this).addClass("active")
      moveTag();
    });
    $(".tagViews").on("click", ".tagItem .close", function (event) {
      event.stopPropagation();
      var currentTag = $(this).parent();
      if (currentTag.hasClass("active")) {
        if ($(this).parent().index() == $(".tagViews .tagItem").length - 1) {
          currentTag = $(this).parent().prev();
          $(".tagViews .tagItem").removeClass("active");

          currentTag.prev();
          currentTag.addClass("active");
        } else {
          currentTag = $(this).parent().next();
          $(".tagViews .tagItem").removeClass("active");
          console.log(currentTag.prev()[0], "当前删除的元素");
          $(this).parent().prev();
          currentTag.addClass("active")
        }
      }

      var cheacIndex = checkView({ path: $(this).parent().attr("data-path") });
      if (cheacIndex > -1) {
        $(".frameViewBox iframe").eq(cheacIndex).remove();
      }
      console.log("删除store 中对应的数据", $(this).parent().index());
      store.tagList.splice($(this).parent().index(), 1);
      $(this).parent().remove();
      moveTag();
    });
    
    
  },
  addTagView(title, path) {
    //添加
    console.log(this.data.params, "需处理的字段");
    var tagData = {
      title: title,
      path: pathReplace(path, this.data.params),
      id: Math.round().toString(16).slice(2),
    };
    addTagView(tagData, this);
  },
  next() {
    //下一页
    var currentLeft = $(".tagViews").scrollLeft();
    $(".tagViews")
      .stop()
      .animate({ scrollLeft: currentLeft + $(".tagViews").width() }, 500);
  },
  prev() {
    //上一页
    var currentLeft = $(".tagViews").scrollLeft();
    $(".tagViews")
      .stop()
      .animate({ scrollLeft: currentLeft - $(".tagViews").width() }, 500);
  },
  refresh(callback) {
    //刷新
    var activeUrl = $(".tagViews .tagItem.active").attr("data-path");
    var frame = $(".frameViewBox iframe").eq(checkView({ path: activeUrl }));
    try {
      frame.contentWindow.reload();
    } catch (error) {
      frame.attr("src", frame.attr("src"));
    }
    callback&&frame.off('load').on('load',function(){
        callback(activeUrl,frame);
    })
    moveTag();
  },
  dataDb(method) {
    //db中的数据内容;
    if (dbUtil[method] && typeof method == "string") {
      return dbUtil[method]();
    }
  },
};
export { TagView };