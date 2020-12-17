import "./index.less";
//dom 操作
function moveTag(currentTag) {
    //传入当前的current
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
}

function addTagView(data) {
    let { title, path, id } = data;
    $(".tagViews .tagItem").removeClass("active").addClass("border");
    let newTag = $(`<span class="tagItem active" data-id="${id}" data-path="${path}">${title}<span class="close">✖</span></span>`);
    $(".tagViews").append(newTag);
    $(newTag).prev().removeClass("border");
    moveTag(newTag)
}

function delTagView(data) {

}

$(".tagViews").on('click', ".tagItem", function() {
        $(".tagViews .tagItem").removeClass("active").addClass("border");
        $(this).removeClass("border");
        $(this).addClass("active").removeClass("border");
        moveTag($(this));
    })
    // setTimeout(() => { $(".tagViews").animate({ scrollLeft: $(".tagViews .active").offset().left }, 300) }, 2000)
    //左右滚动
$(".next").on('click', function() {
    // console.log($(".tagViews").scrollLeft());
    var currentLeft = $(".tagViews").scrollLeft();
    $(".tagViews").stop().animate({ scrollLeft: currentLeft + $(".tagViews").width() }, 500)
})
$(".prev").on('click', function() {
    var currentLeft = $(".tagViews").scrollLeft();
    $(".tagViews").stop().animate({ scrollLeft: currentLeft - $(".tagViews").width() }, 500)
})

$(".addTag").click(function() {
    addTagView({ title: "新标签-" + $(".tagViews .tagItem").length, path: "/", id: $(".tagViews .tagItem").length })
})

$(".tagViews").on('click', ".tagItem .close", function(event) {
    event.stopPropagation();
    // $(this).parent().remove();
    // console.log($(this).parent().prev()[0])
    var currentTag = $(this).parent().prev();
    moveTag(currentTag);
    // console.log(currentTag.index())
    //判断是否是最后一个tag
    if ($(this).parent().index() == $(".tagViews .tagItem").length - 1) {
        $(".tagViews .tagItem").removeClass("active").addClass("border");
        currentTag.prev().removeClass("border")
        currentTag.addClass("active").removeClass("border");
    } else {

    }

    $(this).parent().remove();
    //关闭点击的tag
})