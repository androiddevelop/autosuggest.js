/*
 * @name jQuery.auto-suggest
 * @projectDescription AJAX auto-suggest for Bootstrap
 * @author | https://github.com/androiddevelop/auto-suggest
 * @version 1.1.1
 * @license Apache License
 */
(function ($) {
    $.fn.autosuggest = function (options) {
        const defaults = {
            url: "/search",
            method: 'get',
            wrapperClass: "as-wrapper",
            menuClass: "as-menu",
            minLength: 2,
            maxNum: 10,
            align: "left",
            queryParamName: 'query',
            split: null,
            highlight: true,
            extra: {},
            nextStep: null,
            open: null,
            close: null,
            immediate: false,
            data: null,
            firstSelected: false, //第一个被选中
            dataCallback: null, //接口数据转换方法
            dataType: 'json',
            onSelect: null //选中项方法，返回选中项jQuery对象
        };

        const settings = $.extend({}, defaults, options);

        $(this).attr('autocomplete', 'off');
        $(this).wrap('<div class="' + settings.wrapperClass + '"></div>');

        $('<div class="' + settings.menuClass + ' list-group"></div>').insertAfter($(this));

        let xhr;
        const that = $(this);

        let alignClass = ' as-align-left';
        if (settings.align === 'center') {
            alignClass = ' as-align-center';
        } else if (settings.align === 'right') {
            alignClass = ' as-align-right';
        }

        $(".as-menu").css("top", $(that).outerHeight());
        let lastText = "";
        let lock = false;

        setInterval(checkInput, 200);

        //检测输入
        function checkInput() {
            const query = $(that).val();
            if (lock || query === lastText) {
                return;
            }

            lastText = query;

            if (query == null) {
                closeComponent($(that).next('.' + settings.menuClass));
                return;
            }

            if (query.length < settings.minLength) {
                closeComponent($(that).next('.' + settings.menuClass));
                return;
            }

            //处理分隔符,分隔符为最后一个字符时,隐藏建议框
            if (settings.split != null && query.charAt(query.length - 1) === settings.split) {
                $(that).next('.' + settings.menuClass).html('');
                closeComponent($(that).next('.' + settings.menuClass));
            }

            searchQuery();
        }

        //hide auto-suggest component when lose focus
        $(this).blur(function () {
            setTimeout(function () {
                closeComponent($(that).next('.' + settings.menuClass));
            }, 200);
        });

        //查询
        function searchQuery() {
            let query = $(that).val();
            const queryName = settings.queryParamName;

            //是否进行多词提示
            query = getRealQuery(query);

            const data = {};
            data[queryName] = query;

            $.each(settings.extra, function (k, v) {
                data[k] = v;
            });

            if (!query) {
                $(that).next('.' + settings.menuClass).html('');
                closeComponent($(that).next('.' + settings.menuClass));
            }

            if (query.length >= settings.minLength) {

                if (xhr && xhr.readyState !== 4) {
                    xhr.abort();
                }

                xhr = $.ajax({
                    type: settings.method,
                    url: settings.url,
                    data: data,
                    dataType: settings.dataType,
                    success: function (json) {
                        if (settings.dataCallback) {
                            json = settings.dataCallback(json);
                        }
                        let results = '';

                        let selectIndex = -1;
                        let suggestionsNum = 0;

                        $.each(json, function (i, j) {
                            if (settings.maxNum > i) {
                                if (settings.highlight) {
                                    const matchText = getRealQuery(query);
                                    results += '<span href="javascript:void(0)" class="list-group-item ' + alignClass + '" data-id="' + j.id + '" data-value="' + j.value + '" data-label="'
                                        + j.label + '">' + getStrongText(j.value, matchText) + '</span>';
                                } else {
                                    results += '<span href="javascript:void(0)" class="list-group-item ' + alignClass + '" data-id="' + j.id + '" data-value="' + j.value + '"  data-label="'
                                        + j.label + '">' + j.value + '</span>';
                                }
                                suggestionsNum++;
                            }
                        });

                        let ele = $(that).next('.' + settings.menuClass);
                        ele.html(results);
                        ele.children().on("click", selectResult);

                        //do not show when lose focus
                        if ($(that).is(":focus")) {
                            openComponent($(that).next('.' + settings.menuClass));
                        }

                        //close component when there is no data.
                        if (suggestionsNum === 0 && $(that).next('.' + settings.menuClass).is(':visible') && settings.close != null) {
                            closeComponent($(that).next('.' + settings.menuClass));
                        }

                        $(that).unbind("keydown");
                        $(".as-selected").removeClass("as-selected");
                        let upDownOperate = false;  //has up or down operate

                        if (settings.firstSelected) {
                            selectIndex = (selectIndex + 1) % suggestionsNum;
                            $(that).next('.' + settings.menuClass).children().eq(selectIndex).addClass("as-selected");
                            if (suggestionsNum > 0) {
                                upDownOperate = true;
                            }
                        }

                        $(that).keydown(function (event) {
                            const keyCode = event.keyCode;

                            if ($(that).next('.' + settings.menuClass).css("display") === 'none' && keyCode !== 13) {
                                return;
                            }

                            //up arrow
                            if (keyCode === 38) {
                                $(".as-selected").removeClass("as-selected");
                                selectIndex = (selectIndex + suggestionsNum - 1) % suggestionsNum;
                                $(that).next('.' + settings.menuClass).children().eq(selectIndex).addClass("as-selected");
                                if (suggestionsNum > 0) {
                                    upDownOperate = true;
                                }

                                //阻止光标移至输入框最前面
                                event.preventDefault();
                                return;
                            }

                            //down arrow
                            if (keyCode === 40) {
                                $(".as-selected").removeClass("as-selected");
                                selectIndex = (selectIndex + 1) % suggestionsNum;
                                $(that).next('.' + settings.menuClass).children().eq(selectIndex).addClass("as-selected");
                                if (suggestionsNum > 0) {
                                    upDownOperate = true;
                                }
                                return;
                            }

                            //enter
                            if (keyCode === 13) {
                                //suggestion component is visible after the operation up and down arrows
                                if (upDownOperate) {
                                    lock = true;
                                    lastText = getRealText($(".as-selected").data('value'));
                                    $(that).val(lastText);
                                    lock = false;
                                    closeComponent($(that).next('.' + settings.menuClass));

                                    if (settings.immediate && settings.nextStep != null) {
                                        settings.nextStep($(".as-selected"));
                                    } else {
                                        upDownOperate = false;
                                    }
                                    settings.onSelect && settings.onSelect($(".as-selected"));
                                } else {
                                    if (settings.nextStep != null && $(that).val().length > 0) {
                                        closeComponent($(that).next('.' + settings.menuClass));
                                        settings.nextStep($(".as-selected"));
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

        //建议框关闭
        function closeComponent(ele) {
            if (ele.is(':visible')) {
                ele.hide();
                if (settings.close != null) {
                    settings.close();
                }
            }
        }

        //建议框打开
        function openComponent(ele) {
            if (!ele.is(':visible')) {
                ele.show();
                if (settings.open != null) {
                    settings.open();
                }
            }
        }

        //do something after select menu
        function selectResult() {
            lock = true;
            lastText = getRealText($(this).data('value'));
            $(that).val(lastText);
            lock = false;

            closeComponent($(that).next('.' + settings.menuClass));
            $(that).focus();

            if (settings.immediate && settings.nextStep != null) {
                settings.nextStep($(".as-selected"));
            }
            settings.onSelect && settings.onSelect($(this));
            return false;
        }

        //返回组合后的文本
        function getRealText(selectedValue) {
            //没有分割府的话直接返回
            if (settings.split == null) {
                return selectedValue;
            }

            const query = $(that).val();
            let result = selectedValue;
            const index = query.lastIndexOf(settings.split);
            if (index !== -1) {
                result = query.substring(0, index) + settings.split + selectedValue;
            }
            return result;
        }

        //获取真实查询内容
        function getRealQuery(query) {
            if (settings.split != null) {
                const index = query.lastIndexOf(settings.split);
                if (index !== -1) {
                    query = query.substring(index + settings.split.length);
                }
            }
            return query;
        }

        //对文本加入高亮操作
        function getStrongText(text, matchText) {
            if (text === undefined) {
                return "";
            }
            if (matchText === undefined) {
                return text;
            }
            let searchStartPosition = 0;
            const textTmp = text;
            let result = "";
            const length = matchText.length;
            text = text.toLowerCase();
            matchText = matchText.toLowerCase();
            let index = text.indexOf(matchText, searchStartPosition);
            while (-1 !== index) {
                result = result + textTmp.substring(searchStartPosition, index) + "<strong>" + textTmp.substr(index, length) + "</strong>";
                searchStartPosition = index + length;
                index = textTmp.indexOf(matchText, searchStartPosition);
            }
            result = result + textTmp.substring(searchStartPosition);
            return result;
        }

        return this;
    };

}(jQuery));