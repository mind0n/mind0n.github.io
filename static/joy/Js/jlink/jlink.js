(function ($) {
    var builders = {};
    var queues = {};
    function clear(name) {
        if (!name) {
            //debugger;
            return;
        }
        if (queues[name]) {
            delete queues[name];
        }
    }
    function enqueue(name, tel) {
        var q = queues[name];
        if (!q) {
            q = [];
            queues[name] = q;
        }
        q.push({ el: tel });
    }
    function each(name, f, reset) {
        if (f) {
            var q = queues[name];
            if (q && q.length > 0) {
                for (var i = 0; i < q.length; i++) {
                    var item = q[i];
                    f(item);
                }
                if (reset) {
                    clear(name);
                }
            }
        }
    }
    function parseUrl(el) {
        var url = el;
        var view = null;
        var js = null;
        if (typeof (el) == 'object' && el.tagName) {
            var q = $(el);
            url = q.attr('url');
            view = q.attr('view');
            js = q.attr('js');
        }
        if (url[url.length - 1] != '/') {
            url += '/';
        }
        var list = url.split(/\//ig);
        var name = list.length > 1 ? list[list.length - 2] : '';
        var r = { name: name };
        if (view) {
            r.view = url + view;
        } else {
            r.view = url + 'view.html';
        }
        if (js) {
            r.js = url + js;
        } else {
            r.js = url + 'build.js';
        }
        return r;
    }
    function build(ctx) {
        var f = window[ctx.url.name + 'Builder'];
        f(ctx.target);
        if (!builders[ctx.url.name]) {
            ctx.builder = f;
            builders[ctx.url.name] = ctx;
        }
    }
    function template(ctx, msg) {
        if (msg) {
            ctx.html = msg;
        } else {
            msg = ctx.html;
        }
        var div = document.createElement('div');
        div.innerHTML = msg;
        var target = div.firstChild;
        ctx.el.parentNode.insertBefore(div.firstChild, ctx.el);
        div.innerHTML = '';
        div.appendChild(ctx.el);
        div.innerHTML = '';
        ctx.target = target;
        return ctx;
    }
    function context(tel, url) {
        return { el: tel, url: url };
    }
    function ctrl(el) {
        var urlattr = $(el).attr('url');
        var cnattr = $(el).attr('cn');
        if (cnattr) {
            //debugger;
            if (builders[cnattr]) {
                var ctx = builders[cnattr];
                template(ctx);
                build(ctx);
            } else {
                enqueue(cnattr, el);
            }
            return;
        }
        if (urlattr) {
            var url = parseUrl(el);
            var ctx = { url: url, el: el };
            if (url.view) {
                $.ajax({
                    type: "get", url: url.view, context: ctx, cache: true, success: function (msg) {
                        var ctx = template(this, msg);
                        var url = ctx.url;
                        //debugger;
                        each(url.name, function (i) {
                            i.url = url;
                            template(i, msg);
                        });
                        if (url.js && (!window[url.name + 'Builder'] || typeof (window[url.name + 'Builder']) != 'function')) {
                            $.ajax({
                                type: "get", url: url.js, context: ctx, cache: true, success: function (msg) {
                                    var ctx = this;
                                    var url = ctx.url;
                                    eval(msg);
                                    build(ctx);
                                    each(url.name, function (i) {
                                        build(i);
                                    }, true);
                                }
                            });
                        } else {
                            build(ctx);
                            each(url.name, function (i) {
                                build(i);
                            }, true);
                        }
                    }
                });
            }
        }
    }
    function preload(ctx) {
        function verify(ctx) {

            if (!builders[ctx.url.name]) {
                builders[ctx.url.name] = ctx;
            }

            if (ctx.html && ctx.builder) {
                debugger;
                var url = ctx.url;
                var html = ctx.html;
                var builder = ctx.builder;
                
                each(url.name, function (i) {
                    i.url = url;
                    i.html = html;
                    i.builder = builder;
                    template(i);
                    build(i);
                }, true);
            }

        }
        if (typeof (ctx) == 'string') {
            ctx = { url: ctx };
        }
        var url = ctx.url;        
        if (typeof (url) == 'string') {
            url = parseUrl(url);
            ctx.url = url;
        }

        if (url) {
            if (url.view) {
                $.ajax({
                    type: "get", url: url.view, context: ctx, cache: true, success: function (msg) {
                        var ctx = this;
                        ctx.html = msg;
                        verify(ctx);
                    }
                });
            }
            if (url.js && !window[url.name + 'Builder'] || typeof (window[url.name + 'Builder']) != 'function') {
                $.ajax({
                    type: "get", url: url.js, context: ctx, cache: true, success: function (msg) {
                        
                        var ctx = this;
                        eval(msg);
                        ctx.builder = window[url.name + 'Builder'];
                        verify(ctx);
                    }
                });
            }
            //if (url.view && url.js) {
            //    $.ajax({ type: "get", url: url.view, context: ctx, cache: true, success: function (msg) {
            //            var ctx = this;
            //            ctx.html = msg;
            //            var url = ctx.url;
            //            if (!window[url.name + 'Builder'] || typeof (window[url.name + 'Builder']) != 'function'){
            //                $.ajax({ type: "get", url: url.js, context: ctx, cache: true, success: function (msg) {
            //                        var ctx = this;
            //                        var url = ctx.url;
            //                        eval(msg);
            //                        each(url.name, function (i) {
            //                            i.url = url;
            //                            template(i);
            //                            build(i);
            //                        }, true);
            //                    }
            //                });
            //            } else {
            //                each(url.name, function (i) {
            //                    i.url = url;
            //                    template(i);
            //                    build(i);
            //                }, true);
            //            }
            //        }
            //    });
            //} else {

            //}
        }
    }

    function jlink() {
        var r = {};
        r.preload = preload;
        r.ctrl = ctrl;
        return r;
    }
    window.jlink = jlink();
    $(function () {
        var ctrls = $('ctrl');
        for (var i = 0; i < ctrls.length; i++) {
            var el = ctrls[i];
            ctrl(el);
        }
    });
})(jQuery);
