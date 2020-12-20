import "./index.less";
//dom 操作部分开始
function moveTag() {

    var currentTag = $(".tagViews .tagItem.active");
    // console.log(currentTag.index())
    // console.log(currentTag.index());
    if (!currentTag.offset()) return;
    var left = currentTag.offset().left;
    var viewWidth = $(".tagViews").width();
    var currentWidth = currentTag.outerWidth();
    var currentLeft = $(".tagViews").scrollLeft();
    var nextWidth = currentTag.next().outerWidth();
    if ((nextWidth + left + currentWidth - viewWidth) > 0) {
        $(".tagViews").animate({ scrollLeft: currentLeft + (nextWidth + left + currentWidth - viewWidth) }, 500)
    }
    if (currentTag.prev().offset() && currentTag.prev().offset().left <= 0) {
        $(".tagViews").animate({ scrollLeft: currentLeft + currentTag.prev().offset().left }, 500)
    } else {
        if (left <= 0) {
            $(".tagViews").animate({ scrollLeft: 0 }, 500)
        }
    }

    $(".frameViewBox iframe").hide();
    $(".frameViewBox iframe").eq(currentTag.index()).show();

}

function moveView(index) {
    $(".tagViews .tagItem").removeClass("active").addClass("border");
    $(".tagViews .tagItem").eq(index).prev().removeClass("border");
    $(".tagViews .tagItem").eq(index).addClass("active").removeClass("border");
    moveTag();

}



function cheackTag(data) {
    var check_index = null;
    //检测传入的tag是否是已经打开的tag
    $(".frameViewBox iframe").each(function(index, item) {
        if ($(item).attr("src") == data.path) {
            // console.log(index, "当前的iframe 打开的地方")
            check_index = index;
        }

    })
    return check_index;
}

function createIframeView(data) {
    var { title, path, id } = data;
    var frame = $(`<iframe style="width:100%;height:100%;display:none;" src=${path}  frameborder="0"></iframe>`);
    $(".frameViewBox").append(frame);
    console.log("加载中")
    frame.load(function() {

        console.log(frame.index(), "加载完成")
    })
}

function addTagView(data) {
    let cheackIndex = cheackTag(data);
    if (typeof cheackIndex == "number") { moveView(cheackIndex); return };
    let { title, path, id } = data;
    $(".tagViews .tagItem").removeClass("active").addClass("border");
    let newTag = $(`<span class="tagItem active" data-id="${id}" data-path="${path}">${title}<span class="close" title="关闭标签页">✖</span></span>`);
    $(".tagViews").append(newTag);
    $(newTag).prev().removeClass("border");
    createIframeView(data);
    moveTag();

}

function TagView(opt) {
    //初始化布局
    this.data = $.extend({}, opt);
    var data = this.data;
    var tagDom = "";
    var layOut = "";
    var viewBox = ""
    var frames = "";
    var activeIndex = ""
    if (data.tagList) {
        $.each(data.tagList, function(index, val) {
            let { title, path, id, active, isAffix, } = val;
            if (active) {
                activeIndex = index;
            }
            tagDom += `<span class="tagItem ${active?"active":""}"  data-path="${path}">${title}${isAffix?"":'<span class="close" title="关闭标签页">✖</span></span>'}`
            frames += `<iframe style="width:100%;height:100%;display:${index==activeIndex?"block":"none"};" src=${path}  frameborder="0"></iframe>`
        })
        viewBox = `<div class="frameViewBox" style="width:100%;height:100%;overflow:hidden;">${frames}</div>`
        layOut = `<div class="tagBox"><div class="tagViews">${tagDom}</div></div>`
    } else {
        layOut = `<div class="tagBox"><div class="tagViews"></div></div>`
        viewBox = '<div class="frameViewBox" style="width:100%;height:100%;overflow:hidden;"></div>'
    }

    $(function() {
        $(data.el).append(layOut);
        $(data.frameEl).append(viewBox);
        $(".tagViews").on('click', ".tagItem", function() {
            $(".tagViews .tagItem").removeClass("active").addClass("border");
            $(this).prev().removeClass("border");
            $(this).addClass("active").removeClass("border");
            moveTag();
        });
        $(".tagViews").on('click', ".tagItem .close", function(event) {
            event.stopPropagation();
            var currentTag = $(this).parent();
            if (currentTag.hasClass("active")) {

                if ($(this).parent().index() == $(".tagViews .tagItem").length - 1) {
                    currentTag = $(this).parent().prev();
                    $(".tagViews .tagItem").removeClass("active").addClass("border");

                    currentTag.prev().removeClass("border")
                    currentTag.addClass("active").removeClass("border");
                } else {
                    currentTag = $(this).parent().next();
                    $(".tagViews .tagItem").removeClass("active").addClass("border");
                    console.log(currentTag.prev()[0], "当前删除的元素")
                    $(this).parent().prev().removeClass("border")
                    currentTag.addClass("active").removeClass("border");
                }

            }
            moveTag();
            $(".frameViewBox iframe").eq($(this).parent().index()).remove();
            $(this).parent().remove();

        })
    })
}

TagView.prototype = {
    constructor: TagView,
    addTagView(title, path) {
        //添加
        tagData = {
            title: title,
            path: path,
            id: Math.round().toString(16).slice(2)
        }
        addTagView(tagData, this);
    },
    next() {
        //下一页
        var currentLeft = $(".tagViews").scrollLeft();
        $(".tagViews").stop().animate({ scrollLeft: currentLeft + $(".tagViews").width() }, 500);
    },
    prev() {
        //上一页
        var currentLeft = $(".tagViews").scrollLeft();
        $(".tagViews").stop().animate({ scrollLeft: currentLeft - $(".tagViews").width() }, 500);
    },
    refresh() {
        //刷新
        var index = $(".tagViews .tagItem.active").index();
        var frame = $(".frameViewBox iframe").eq(index);
        frame.attr("src", frame.attr("src"));
        console.log("刷新中");
        moveTag();
    }
}

new TagView({
    el: ".Nav",
    frameEl: ".frameBox",
    tagList: [{
        path: "https://wwww.baidu.com",
        title: "百度一下",
        active: true,
        isAffix: true,
    }]
})


// $(".tagViews").on('click', ".tagItem", function() {
//     $(".tagViews .tagItem").removeClass("active").addClass("border");
//     $(this).prev().removeClass("border");
//     $(this).addClass("active").removeClass("border");
//     moveTag();
// })
$(".next").on('click', function() {
    var currentLeft = $(".tagViews").scrollLeft();
    $(".tagViews").stop().animate({ scrollLeft: currentLeft + $(".tagViews").width() }, 500)
})
$(".prev").on('click', function() {
    var currentLeft = $(".tagViews").scrollLeft();
    $(".tagViews").stop().animate({ scrollLeft: currentLeft - $(".tagViews").width() }, 500)
})
$(".addTag").click(function() {
    addTagView({ title: $(this).text().trim(), path: $(this).data("url").trim() })
})
$(".reload").click(function() {
        var index = $(".tagViews .tagItem.active").index();
        var frame = $(".frameViewBox iframe").eq(index);
        frame.attr("src", frame.attr("src"));
        console.log("刷新中");
        moveTag();
        // console.log("加载中1")
    })
    // $(".tagViews").on('click', ".tagItem .close", function(event) {
    //         event.stopPropagation();
    //         var currentTag = $(this).parent();
    //         if (currentTag.hasClass("active")) {

//             if ($(this).parent().index() == $(".tagViews .tagItem").length - 1) {
//                 currentTag = $(this).parent().prev();
//                 $(".tagViews .tagItem").removeClass("active").addClass("border");

//                 currentTag.prev().removeClass("border")
//                 currentTag.addClass("active").removeClass("border");
//             } else {
//                 currentTag = $(this).parent().next();
//                 $(".tagViews .tagItem").removeClass("active").addClass("border");
//                 console.log(currentTag.prev()[0], "当前删除的元素")
//                 $(this).parent().prev().removeClass("border")
//                 currentTag.addClass("active").removeClass("border");
//             }

//         }
//         moveTag();
//         $(".frameViewBox iframe").eq($(this).parent().index()).remove();
//         $(this).parent().remove();

//     })
//dom 操作部分结束

export default TagView;