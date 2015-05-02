(function ($) {
    function wheelStep(evt, step) {
        evt = evt || event;
        if (!step) {
            step = 3;
        }
        var d = (-evt.originalEvent.detail || evt.originalEvent.wheelDelta || evt.wheelDelta || -evt.detail);
        if (d > 0) {
            return step;
        } else if (d < 0) {
            return -step;
        } else {
            return 0;
        }
    }
    function singleTouch(c, e) {
        var history = List();
        var r = {};
        r.$initial$ = { px: e.pageX, py: e.pageY, cx: e.clientX, cy: e.clientY };
        if (c.mouse) {
            r.updatePos = function (evt) {
                var m = this;
                m.px = evt.pageX;
                m.py = evt.pageY;
                m.cx = evt.clientX;
                m.cy = evt.clientY;
                m.ox = m.cx - m.$initial$.cx;
                m.oy = m.cy - m.$initial$.cy;
            };
        } else {
            r.updatePos = function (evt) {
                var m = this;
                m.px = evt.pageX;
                m.py = evt.pageY;
                m.cx = evt.clientX;
                m.cy = evt.clientY;
                m.ox = m.cx - m.$initial$.cx;
                m.oy = m.cy - m.$initial$.cy;
            };
        }
        return r;        
    }
    var touchlist = List();
    var reglist = List();
    var touches = {
        origin:[0,0]
        , wheelStep: wheelStep
        , register: function (o) {
            reglist.add(o);
        }
        , recognize: function () {
            if (reglist.length < 1 || touchlist.length < 1) {
                return;
            }
            var c = { mode: touchlist.length };
            for (var i = 0; i < reglist.length; i++) {
                var el = reglist[i];
                if (c.mode == 1 && el.tmove) {
                    el.tmove(touchlist[0]);
                }
            }
        }
        , addtouch: function (e, c) {
            if (!e) {
                return;
            }
            if (!c) {
                c = { mouse: true };
            }
            if (c.mouse) {
                var tc = singleTouch(c, e);
                tc.updatePos(e);
                touchlist.add(tc);
            } else if (e.changedTouches && e.changedTouches.length > 0) {
                for (var i = 0; i < e.changedTouches.length; i++) {
                    var ee = e.changedTouches[i];
                    var tc = singleTouch(c, ee);
                    tc.updatePos(ee);
                    touchlist.add(tc);
                }
            }            
        }, identify: function (e, callback) {
            if (!callback || !touchlist || touchlist.length < 1) {
                return;
            }
            var ox = 999999;
            var oy = 999999;
            var r = null;
            for (var i = 0; i < touchlist.length; i++) {
                var tc = touchlist[i];
                var cox = Math.abs(e.clientX - tc.cx);
                var coy = Math.abs(e.clientY - tc.cy);
                if (cox < ox && coy < oy) {
                    ox = cox;
                    oy = coy;
                    r = tc;
                }
            }
            if (r != null) {
                callback(r, e);
            }
        }, deltouch: function (e) {
            this.identify(e, function (tc, evt) {
                var c = { mode: touchlist.length };
                for (var i = 0; i < reglist.length; i++) {
                    var el = reglist[i];
                    if (c.mode == 1 && el.tdrop) {
                        el.tdrop(touchlist[0]);
                    }
                }
                touchlist.del(tc);
            });
        }
    };
    joy.input = touches;

    $(function () {
        $(document).mousedown(function (e) {
            if (touchlist.length < 1) {
                touches.addtouch(e, { mouse: true });
            }
        });
        $(document).mousemove(function (e) {
            var evt = e || event;
            touches.origin[0] = evt.clientX;
            touches.origin[1] = evt.clientY;
            touches.identify(evt, function (tc, evt) {
                tc.updatePos(evt);
            });
            touches.recognize();
            //var s = '';
            //for (var i = 0; i < touchlist.length; i++) {
            //    var it = touchlist[i];
            //    s += '[' + (it.cx - it.$initial$.cx) + ',' + (it.cy - it.$initial$.cy) + ']';
            //}
            //joy.debug(s);
        });
        $(document).mouseup(function (e) {
            touches.deltouch(e);
        });
    });
})(jQuery);