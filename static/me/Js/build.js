(function ($) {
    window.controllers = {};
    function enumnodes(el, c, exc, cs) {
        var cexc = null;
        if (!cs) {
            cs = { root: null, parent: null, unit: el };
        }
        if (el.tagName) {
            for (var i = 0; i < el.attributes.length; i++) {
                var at = el.attributes[i];
                if (c.cbattr) {
                    c.cbattr(at, el, cs);
                }
            }
            var grp = attr(el, 'unit');
            if (grp) {
                cs.unit = el;
            }
            if (exc) {
                for (var i in exc) {
                    el[i] = exc[i];
                }
            }
            for (var i = 0; i < el.childNodes.length; i++) {
                var ch = el.childNodes[i];
                if (c.cbchild) {
                    c.cbchild(ch, el, cs, c);
                }
                var ncs = { root: cs.root, parent: ch, unit: cs.unit };
                if (exc && exc.$) {
                    if (exc.$.length && exc.$.length > i) {
                        cexc = exc.$[i];
                    } else if (exc.$ && !exc.$.length) {
                        cexc = exc.$;
                    } else {
                        cexc = null;
                    }
                } else {
                    cexc = null;
                }
                enumnodes(ch, c, cexc, ncs);
            }
        } else {

        }
        if (c.built) {
            c.built(el);
        }
    }
    function inject(c) {
        var el = this;
        enumnodes(el, {
            cbattr: function (at, el, cs) {
                if (at.name == 'alias') {
                    cs.unit['$' + at.value] = el;
                }
            }, cbchild: function (ch, el, cs, c) {
            }, built: function (el) {
                var v = attr(el, 'control');
                if (v) {
                    var t = window.controllers[v];
                    if (t && typeof(t) == 'function') {
                        t.apply(el);
                    }
                }
            }
        }, c);
    }

    $.fn.extend({
        find: function (selector) {
            var i,
                ret = [],
                self = this,
                len = self.length;

            if (typeof selector !== "string") {
                return this.pushStack(jQuery(selector).filter(function () {
                    for (i = 0; i < len; i++) {
                        if (jQuery.contains(self[i], this)) {
                            return true;
                        }
                    }
                }));
            }

            for (i = 0; i < len; i++) {
                jQuery.find(selector, self[i], ret);
            }

            // Needed because $( selector, context ) becomes $( context ).find( selector )
            ret = this.pushStack(len > 1 ? jQuery.unique(ret) : ret);
            ret.selector = this.selector ? this.selector + " " + selector : selector;
            return ret;
        }
        , inject: function (c) {
            var that = this;
            for (var i = 0; i < that.length; i++) {
                var item = that[i];
                inject.apply(item, [c]);
            }
            return that;
        }
    });
})(jQuery);