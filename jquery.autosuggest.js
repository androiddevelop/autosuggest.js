/*
 * @name jQuery.auto-suggest
 * @projectDescription AJAX auto-suggest for Bootstrap 3
 * @author  | https://github.com/androiddevelop/auto-suggest
 * @version 1.0
 * @license Apache License
 *
 */
(function ($) {
        $.fn.autosuggest = function (options) {
            var defaults = {
                url: "/search",
                method: 'get',
                wrapperClass: "as-wrapper",
                menuClass: "as-menu",
                minLength: 2,
                maxNum: 10,
                align: "left",
                queryParamName: 'query',
                split: null,
                extra: {},
                nextStep: null
            };

            var settings = $.extend({}, defaults, options);

            $(this).attr('autocomplete', 'off');
            $(this).wrap('<div class="' + settings.wrapperClass + '"></div>');

            $('<div class="' + settings.menuClass + ' list-group"></div>').insertAfter($(this));

            var xhr;
            var that = $(this);

            var alignClass = ' as-align-left ';
            if (settings.align == 'center') {
                alignClass = ' as-align-center';
            } else if (settings.align == 'right') {
                alignClass = ' as-align-right';
            }

            $(this).on("keyup", function (event) {
                var keyCode = event.keyCode;

                //方向键与空格按下时不发送联想查询
                if ((keyCode >= 37 && keyCode <= 40) || keyCode == 13) {
                    return;
                }

                var query = $(that).val();
                if (query == null || query.length == 0) {
                    return;
                }

                //处理分隔符,分隔符为最后一个字符时,隐藏建议框
                if (settings.split != null && query.charAt(query.length - 1) == settings.split) {
                    $(that).next('.' + settings.menuClass).html('');
                    $(that).next('.' + settings.menuClass).hide();
                    return;
                }

                searchQuery();
            });

            //hide auto-suggest component when lose focus
            $(this).blur(function () {
                setTimeout(function () {
                    $(that).next('.' + settings.menuClass).hide();
                }, 200);
            });

            //查询
            function searchQuery() {
                var query = $(that).val();

                var queryName = settings.queryParamName;

                //是否进行多词提示
                if (settings.split != null) {
                    var index = query.lastIndexOf(settings.split);
                    if (index != -1) {
                        query = query.substring(index + settings.split.length);
                    }
                }

                var data = {};
                data[queryName] = query;

                $.each(settings.extra, function (k, v) {
                    data[k] = v;
                });

                if (!query) {
                    $(that).next('.' + settings.menuClass).html('');
                    $(that).next('.' + settings.menuClass).hide();
                }

                if (query.length >= settings.minLength) {

                    if (xhr && xhr.readyState != 4) {
                        xhr.abort();
                    }

                    xhr = $.ajax({
                        type: settings.method,
                        url: settings.url,
                        data: data,
                        dataType: "json",
                        success: function (json) {
                            var results = '';

                            var selectIndex = -1;
                            var suggestionsNum = 0;

                            $.each(json, function (i, j) {
                                if (settings.maxNum > i) {
                                    results += '<span href="#" class="list-group-item ' + alignClass + '" data-id="' + j.id + '" data-label="'
                                        + j.label + '">' + j.label + '</span>';
                                    suggestionsNum++;
                                }
                            });

                            $(that).next('.' + settings.menuClass).html(results);
                            $(that).next('.' + settings.menuClass).children().on("click", selectResult);

                            //do not show when lose focus
                            if ($(that).is(":focus")) {
                                $(that).next('.' + settings.menuClass).show();
                            }

                            $(that).unbind("keydown");
                            $(".as-selected").removeClass("as-selected");
                            var upDownOperate = false;  //has up or down operate
                            $(that).keydown(function (event) {
                                var keyCode = event.keyCode;

                                if ($(that).next('.' + settings.menuClass).css("display") == 'none' && keyCode != 13) {
                                    return;
                                }

                                //up arrow
                                if (keyCode == 38) {
                                    $(".as-selected").removeClass("as-selected");
                                    selectIndex = (selectIndex + suggestionsNum - 1) % suggestionsNum;
                                    $(that).next('.' + settings.menuClass).children().eq(selectIndex).addClass("as-selected");
                                    upDownOperate = true;

                                    //阻止光标移至输入框最前面
                                    event.preventDefault();
                                    return;
                                }

                                //down arrow
                                if (keyCode == 40) {
                                    $(".as-selected").removeClass("as-selected");
                                    selectIndex = (selectIndex + 1) % suggestionsNum;
                                    $(that).next('.' + settings.menuClass).children().eq(selectIndex).addClass("as-selected");
                                    upDownOperate = true;
                                    return;
                                }

                                //enter
                                if (keyCode == 13) {
                                    //suggestion component is visible after the operation up and down arrows
                                    if (upDownOperate) {
                                        $(that).val(getRealText($(".as-selected").data('label')));
                                        $(that).next('.' + settings.menuClass).hide();
                                        upDownOperate = false;
                                    } else {
                                        if (settings.nextStep != null && $(that).val().length > 0) {
                                            $(that).next('.' + settings.menuClass).hide();
                                            settings.nextStep();
                                            //防止多余请求
                                            xhr.abort();
                                        }
                                    }
                                }
                            });

                            //鼠标悬浮事件
                            $(that).next('.' + settings.menuClass).children().each(function (index) {
                                $(this).on("mouseenter", function () {
                                    $(".as-selected").removeClass("as-selected");
                                    $(this).addClass("as-selected");
                                    selectIndex = index;
                                });
                            });
                        }
                    });
                }
            }


            //do something after select menu
            function selectResult() {
                $(that).val(getRealText($(this).data('label')));
                $(that).next('.' + settings.menuClass).hide();
                $(that).focus();
                return false;
            }

            //返回组合后的文本
            function getRealText(selectedValue) {
                //没有分割府的话直接返回
                if (settings.split == null) {
                    return selectedValue;
                }

                var query = $(that).val();
                var result = selectedValue;
                var index = query.lastIndexOf(settings.split);
                if (index != -1) {
                    result = query.substring(0, index) + settings.split + selectedValue;
                }
                return result;
            }

            return this;
        };

    }(jQuery)
);
