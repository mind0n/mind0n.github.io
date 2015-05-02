(function ($) {
    var rels = List();
    var handlers = List();
    handlers.add({
        touchstart: function (mevt) { }
        , touchmove: function (mevt) { }
        , touchend: function (mevt) { }
        , touched: function (mevt) { }
        , dragstart: function (mevt) { }
        , dragging: function (mevt) { }
        , dragend: function (mevt) { }
    });

    function updatePos(o, event) {
        if (o && event) {
            o.px = event.pageX;
            o.py = event.pageY;
            o.cx = event.clientX;
            o.cy = event.clientY;
        } else {
            console.log('Null cursor cannot update position.')
            debugger;
        }
    }

    function within(el, evt) {
        if (!el.tagName) {
            if (el.el) {
                el = el.el;
            } else {
                return false;
            }
        }
        
        var rect = el.getBoundingClientRect();
        var x = evt.cx;
        var y = evt.cy;
        if (x >= rect.left && x <= rect.right && y <= rect.bottom && y >= rect.top) {
            return true;
        }
        return false;
    }
    
    function Toucher() {
        var gl = null;
        var tq = List();
        var gq = List();
        function parseAct(tq) {
            var sl = tq[tq.length - 3];
            var pl = tq[tq.length - 2];
            var cl = tq[tq.length - 1];
            if (!sl) {
                sl = {};
            }
            if (!pl) {
                pl = {};
            }
            if (!cl) {
                cl = {};
            }
            if (tq.length >= 2 && pl.length == 1 && cl.length == 1) {
                if (pl.act == 'touchstart' && cl.act == 'touchend' || (sl.act=='touchstart' && pl.act == 'touchmove' && cl.act=='touchend')) {
                    //cl.act = 'touched';
                    gl = spawn(cl);
                    gl.act = 'touched';
                } else if (pl.act == 'touchstart' && cl.act == 'touchmove') {
                    gl = spawn(cl);
                    gl.act = 'dragstart';
                } else if (gl && gl.act == 'dragstart' && cl.act == 'touchmove') {
                    //debugger;
                    gl = spawn(cl);
                    gl.act = 'dragging';
                } else if (gl && gl.act == 'dragging' && cl.act == 'touchmove') {
                    gl = spawn(cl);
                    gl.act = 'dragging';
                } else if (gl && gl.act == 'dragging' && cl.act == 'touchend') {
                    gl = spawn(cl);
                    gl.act = 'dragend';
                } else {
                    gl = null;
                }
                //console.log(pl.act + '|' + cl.act + '|' + ((gl != null) ? gl.act : ''));
            }
        }
        var ismousedown = false;
        var r = {
            fire: function (list) { // list: group of mevt
                if (!list) {
                    return;
                }
                var h = handlers[list.length - 1][list.act];
                if (h) {
                    for (var j = 0; j < rels.length; j++) {
                        var rel = rels[j];
                        if (rel.h && rel.h.length >= list.length && rel.h[list.length - 1][list.act]) {
                            h = rel.h[list.length - 1][list.act];
                        }
                        var bubble = true;
                        for (var i = 0; i < list.length; i++) {
                            var it = list[i];
                            if (it.act == 'touchstart' && within(rel, it)) {
                                rel.$cursortarget$ = true;
                            } else if (it.act == 'touchstart') {
                                rel.$cursortarget$ = false;
                            }
                            if (rel.$cursortarget$) {
                                it.o = rel; // o: cfg object registed
                                //d(it.act);
                                if (list.length == 1) {
                                    bubble = h(it);
                                } else {
                                    bubble = h(list);
                                }
                                if (!bubble) {
                                    break;
                                }
                            }
                            if (it.act == 'touchend' || it.act == 'touchcancel') {
                                rel.$cursortarget$ = false;
                            }
                        }
                        if (!bubble) {
                            break;
                        }
                    }
                }
            }
            , update: function (event, act, ismouse) {
                var list = List();
                if (!ismouse) {
                    if (event && event.changedTouches && event.changedTouches.length > 0) {
                        ths = event.changedTouches;
                        list.act = act;
                        for (var i = 0; i < ths.length; i++) {
                            var th = ths[i];
                            list.add({
                                act: act
                                , target: event.target || event.srcElement
                                , i: i
                                , px: th.pageX, py: th.pageY
                                , cx: th.clientX, cy: th.clientY
                            });
                        }
                    }
                } else {
                    // Simulate touch event with mouse event.
                    act = act.toLowerCase();
                    if (act == 'mousedown') {
                        ismousedown = true;
                        act = 'touchstart';
                    } else if (act == 'mouseup') {
                        ismousedown = false;
                        act = 'touchend';
                    } else if (act == 'mousemove' && ismousedown) {
                        act = 'touchmove';
                    } else {
                        return;
                    }
                    list.act = act;
                    if (event) {
                        list.add({
                            act: act
                            , target: event.target || event.srcElement
                            , i: 0
                            , px: event.pageX, py: event.pageY
                            , cx: event.clientX, cy: event.clientY
                        });
                    }
                }
                tq.add(list);
                if (tq.length >= 4) {
                    tq.splice(0, 1);
                }
                console.log(act);
                if (act == 'touchmove') {
                    //debugger;
                }
                parseAct(tq);
                if (gl) {
                    this.fire(gl);
                    //gl = null;
                } else {
                    this.fire(tq[tq.length - 1]);
                }
            }
        };
        return r;
    }
    window.cursors = {
        unregist: function (category) {
            if (category) {
                var news = List();
                for (var i = 0; i < rels.length; i++) {
                    var rel = rels[i];
                    if (!rel.category || rel.category != category) {
                        news.add(rel);
                    }
                }
                rels = news;
            }
        }
        , regist: function (c) {
            var el = c.el || c;
            var z = c.zindex || 1;
            var i = 0;
            for (i = 0; i < rels.length; i++) {
                var rel = rels[i];
                if (!rel.zindex) {
                    rel.zindex = z;
                }
                if (rel.zindex <= z) {
                    break;
                }
            }
            rels.splice(i, 0, c);
        }, bind: function (el, fs, cb) {
            if (el && fs && cb) {
                for (var i in fs) {
                    el[i] = cb;
                }
            }
        }
    };
    var touches = Toucher();
    $(function () {
        $(document).mouseup(function (event) {
            touches.update(event, 'mouseup', true);
            //event.preventDefault();
        });
        $(document).mousedown(function (event) {
            touches.update(event, 'mousedown', true);
            //event.preventDefault();
        });
        $(document).mousemove(function (event) {
            touches.update(event, 'mousemove', true);
            //event.preventDefault();
        });

        $(document)[0].ontouchstart = function (event) {
            touches.update(event, 'touchstart');
            //event.preventDefault();
        };
        $(document)[0].ontouchmove = function (event) {
            touches.update(event, 'touchmove');
            if (navigator.userAgent.match(/Android/i)) {
                event.preventDefault();
            }
        };
        $(document)[0].ontouchend = function (event) {
            touches.update(event, 'touchend');
            //event.preventDefault();
        };
    });
})(jQuery);