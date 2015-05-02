(function ($) {
    joy.Form = function (c) {
        var tagcreator = joy.creators.tag;
        tagcreator.FormFactory = function (c, jsononly) {
            var json = {
                tag: 'div'
                , className: 'formarea'
                , build: function (ds, c) {
                    if (!c) {
                        c = {};
                    }
                    var area = this;
                    area.$ds$ = ds;
                    area.$items$ = [];
                    for (var i in ds) {
                        var t = typeof (ds[i]);
                        if (t != 'function' && t != 'object') {
                            var editor = { tag: 'FormRowEditor' };
                            if (c.editors) {
                                if (c.editors[i]) {
                                    var t = typeof (c.editors[i]);
                                    if (t == 'string') {
                                        editor.tag = c.editors[i];
                                    } else if (t == 'object') {
                                        editor = c.editors[i];
                                    } else if (t == 'function') {
                                        editor = c.editors[i](ds[i]);
                                    }
                                }
                            }
                            var l = joy.jbuilder(editor);
                            l.$root = area;
                            area.$items$.push(l);
                            l.val(i, ds[i]);
                            area.appendChild(l);
                        }
                    }
                    area.update = function () {
                        for (var i = 0; i < this.$items$.length; i++) {
                            var item = this.$items$[i];
                            item.update();
                        }
                        return this.$ds$;
                    };
                    return area;
                }
            };
            c.tag = null;
            joy.extend(json, c);
            if (jsononly) {
                return json;
            }
            var el = joy.jbuilder(json);
            if (el.formbuilt) {
                el.formbuilt();
            }
            return el;
        };
        tagcreator.FormRowEditor = function (c, jsononly) {
            var json = {
                tag: 'div'
                , className: 'linearea'
                , val: function (n, v) {
                    this.$field$ = n;
                    this.$label.innerHTML = n.replace(/_/ig, '&nbsp;');
                    this.$editor.value = v;
                }
                , update: function () {
                    ds = this.$root.$ds$;
                    if (ds) {
                        ds[this.$field$] = this.$editor.value;
                    }
                }
                , $: [
                    { tag: 'div', alias: 'label', className: 'labelarea' }
                    , { tag: 'div', alias: 'edarea', className: 'editorarea'
                        , $: { tag: 'input', alias:'editor', type: 'text' }
                    }
                ]
            };
            c.tag = null;
            joy.extend(json, c);
            if (jsononly) {
                return json;
            }
            var el = joy.jbuilder(json);
            return el;
        };
        tagcreator.FormRowCheckbox = function (c) {
            var json = tagcreator.FormRowEditor({}, true);
            json.$[1].$.type = 'checkbox';
            json.val = function (n, v) {
                this.$field$ = n;
                this.$label.innerHTML = n.replace(/_/ig, '&nbsp;');
                var checked = false;
                var t = typeof (v);
                if (t == 'boolean') {
                    checked = v;
                } else if (t == 'string') {
                    checked = t.toLowerCase() == 'true';
                }
                this.$editor.checked = checked;
            };
            json.update = function () {
                ds = this.$root.$ds$;
                if (ds) {
                    ds[this.$field$] = this.$editor.checked;
                }
            };
            c.tag = null;
            joy.extend(json, c);
            var el = joy.jbuilder(json);
            return el;
        };
        function build(ds, c) {
            if (!c) {
                c = {};
            }
            var area = null;
            if (!c.area) {
                area = document.createElement('div');
                area.className = 'formarea';
                document.body.appendChild(area);
            } else {
                area = document.getElementById(c.area);
            }
            area.$ds$ = ds;
            area.$items$ = [];
            for (var i in ds) {
                var t = typeof (ds[i]);
                if (t != 'function' && t != 'object') {
                    var editor = { tag: 'FormRowEditor' };
                    if (c.editors) {
                        if (c.editors[i]) {
                            var t = typeof (c.editors[i]);
                            if (t == 'string') {
                                editor.tag = c.editors[i];
                            } else if (t == 'object') {
                                editor = c.editors[i];
                            } else if (t == 'function') {
                                editor = c.editors[i](ds[i]);
                            }
                        }
                    }
                    var l = joy.jbuilder(editor);
                    l.$root = area;
                    area.$items$.push(l);
                    l.val(i, ds[i]);
                    area.appendChild(l);
                }
            }
            area.update = function () {
                for (var i = 0; i < this.$items$.length; i++) {
                    var item = this.$items$[i];
                    item.update();
                }
                return this.$ds$;
            };
            return area;
        }
        var r = {
            build: build
        };
        return r;
    }();
})(jQuery);
