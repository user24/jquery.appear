/*jslint browser:true, devel:true, sloppy:true */
/*global jQuery */

/*
 * jQuery appear plugin
 *
 * Copyright (c) 2012 Andrey Sidorov
 * licensed under MIT license.
 *
 * https://github.com/morr/jquery.appear/
 *
 * Version: 0.3.3
 */
(function ($) {
    var selectors = [],
        check_binded = false,
        check_lock = false,
        defaults = {
            "interval": 250,
            "force_process": false
        },
        $window = $(window),
        $prior_appeared;

    function process() {
        var index,
            length = selectors.length,
            $appeared,
            $disappeared;

        check_lock = false;
        
        function isAppeared() {
            return $(this).is(':appeared');
        }

        for (index = 0; index < length; index += 1) {
            $appeared = $(selectors[index]).filter(isAppeared);

            $appeared.trigger('appear', [$appeared]);

            if ($prior_appeared) {
                $disappeared = $prior_appeared.not($appeared);
                $disappeared.trigger('disappear', [$disappeared]);
            }
            $prior_appeared = $appeared;
        }
    }

    // "appeared" custom filter
    $.expr[':'].appeared = function (element) {
        var $element = $(element),
            window_left,
            window_top,
            offset,
            left,
            top;

        if (!$element.is(':visible')) {
            return false;
        }
        window_left = $window.scrollLeft();
        window_top = $window.scrollTop();
        offset = $element.offset();
        left = offset.left;
        top = offset.top;

        if (top + $element.height() >= window_top &&
                top - ($element.data('appear-top-offset') || 0) <= window_top + $window.height() &&
                left + $element.width() >= window_left &&
                left - ($element.data('appear-left-offset') || 0) <= window_left + $window.width()) {
            return true;
        } else {
            return false;
        }
    };

    $.fn.extend({
        // watching for element's appearance in browser viewport
        "appear": function (options) {
            var opts,
                selector,
                on_check;
            opts = $.extend({}, defaults, options || {});
            selector = this.selector || this;
            if (!check_binded) {
                on_check = function () {
                    if (check_lock) {
                        return;
                    }
                    check_lock = true;

                    setTimeout(process, opts.interval);
                };

                $(window).scroll(on_check).resize(on_check);
                check_binded = true;
            }

            if (opts.force_process) {
                setTimeout(process, opts.interval);
            }
            selectors.push(selector);
            return $(selector);
        }
    });

    $.extend({
        // force elements's appearance check
        "force_appear": function () {
            if (check_binded) {
                process();
                return true;
            }
            return false;
        }
    });
}(jQuery));