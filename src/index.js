import "./index.less";
//dom 操作部分开始
function moveTag() {

    var currentTag = $(".tagViews .tagItem.active");
    console.log(currentTag[0])
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
    }


    $(".frameViewBox iframe").hide();
    $(".frameViewBox iframe").eq(currentTag.index()).show();



    // var currentTag = $(".tagViews .tagItem.active");
    // // console.log(currentTag.index());
    // if (!currentTag.offset()) return;
    // var left = currentTag.offset().left;
    // var viewWidth = $(".tagViews").width();
    // var currentWidth = currentTag.outerWidth();
    // var currentLeft = $(".tagViews").scrollLeft();
    // var nextWidth = currentTag.next().outerWidth();
    // if ((nextWidth + left + currentWidth - viewWidth) > 0) {
    //     $(".tagViews").animate({ scrollLeft: currentLeft + (nextWidth + left + currentWidth - viewWidth) }, 500)
    // }
    // if (currentTag.prev().offset() && currentTag.prev().offset().left <= 0) {
    //     $(".tagViews").animate({ scrollLeft: currentLeft + currentTag.prev().offset().left }, 500)
    // }


    // $(".frameViewBox iframe").hide();
    // $(".frameViewBox iframe").eq(currentTag.index()).show();

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
    this.data = $.extend({}, opt);
    var data = this.data;
    var tagDom = "";
    var layOut = "";
    var viewBox = '<div class="frameViewBox" style="width:100%;height:100%;overflow:hidden;"></div>'
    if (data.tagList) {
        $.each(data.tagList, function(index, val) {
            let { title, path, id, active } = val;
            tagDom += `<span class="tagItem ${active?"active":""}"  data-path="${path}">${title}<span class="close" title="关闭标签页">✖</span></span>`
        })
        layOut = `<div class="tagBox"><div class="tagViews">${tagDom}</div></div>`
    } else {
        layOut = `<div class="tagBox"><div class="tagViews"></div></div>`
    }


    $(data.el).append(layOut);
    $(data.frameEl).append(viewBox);


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
    }
}

new TagView({
    el: ".Nav",
    frameEl: ".frameBox",
})

$(".tagViews").on('click', ".tagItem", function() {
    $(".tagViews .tagItem").removeClass("active").addClass("border");
    $(this).prev().removeClass("border");
    $(this).addClass("active").removeClass("border");
    moveTag();
})
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
        console.log($(this).parent().index(), "index值")
        $(this).parent().remove();

        // $(".frameViewBox iframe").eq($(this).parent().index()).remove();
        // $(".tagViews .tagItem.active").prev().removeClass("border");

    })
    //dom 操作部分结束