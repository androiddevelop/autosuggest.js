/*
 * @name jQuery.auto-suggest
 * @projectDescription Lightweight AJAX auto-suggest for Bootstrap 3
 * @author  | https://github.com/androiddevelop/auto-suggest
 * @version 1.0
 * @license MIT License
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
            //prevent to send an useless query
            if ((keyCode >= 37 && keyCode <= 40) || keyCode == 13) {
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

        function searchQuery() {
            var query = $(that).val();

            var queryName = settings.queryParamName;

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
                                results += '<a href="#" class="list-group-item ' + alignClass + '" data-id="' + j.id + '" data-label="'
                                    + j.label + '">' + j.label + '</a>';
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

                            if ($(that).next().css("display") == 'none' && keyCode != 13) {
                                return;
                            }

                            //up arrow
                            if (keyCode == 38) {
                                $(".as-selected").removeClass("as-selected");
                                selectIndex = (selectIndex + suggestionsNum - 1) % suggestionsNum;
                                $(that).next().children().eq(selectIndex).addClass("as-selected");
                                upDownOperate = true;

                                event.preventDefault();
                                return;
                            }

                            //down arrow
                            if (keyCode == 40) {
                                $(".as-selected").removeClass("as-selected");
                                selectIndex = (selectIndex + 1) % suggestionsNum;
                                $(that).next().children().eq(selectIndex).addClass("as-selected");
                                upDownOperate = true;
                                return;
                            }

                            //enter
                            if (keyCode == 13) {
                                //suggestion component is visible after the operation up and down arrows
                                if (upDownOperate) {
                                    $(that).val($(".as-selected").data('label'));
                                    $(that).next('.' + settings.menuClass).hide();
                                    upDownOperate = false ;
                                } else {
                                    if (settings.nextStep != null && $(that).val().length > 0) {
                                        settings.nextStep();
                                    }
                                }
                            }
                        });

                    }
                });
            }
        }


        //do something after select menu
        function selectResult() {
            $(that).val($(this).data('label'));
            $(that).next('.' + settings.menuClass).hide();
            $(that).focus();
            return false;
        }

        return this;
    };

}(jQuery));
