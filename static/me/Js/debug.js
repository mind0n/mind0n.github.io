(function () {
    var isdbg = true;
    var del = null;
    function val(o, sl) {
        if (o) {
            var t = typeof (o);
            if (t == 'object') {
                if (o.tagName) {
                    return dumptag(o);
                }
                return dumpobj(o, sl);
            } else {
                return o;
            }
        } else {
            return null;
        }
    }
    function dumpobj(o, singleline, v) {
        v = v || val;
        if (o && typeof (o) == 'object') {
            var s = '';
            if (o.length || o instanceof Array) {
                for (var i = 0; i < o.length; i++) {
                    if (typeof (o[i]) == 'function') {
                        s += '[...]';
                        continue;
                    }
                    if (singleline) {
                        s += val(o[i]) + ' ; ';
                    } else {
                        s += i + '=' + val(o[i]) + '\r\n';
                    }
                }
                s += '\r\n';
            } else {
                for (var i in o) {
                    if (typeof (o[i]) == 'function') {
                        s += '{...}';
                        continue;
                    }
                    s += i + '=' + val(o[i]) + '\r\n';
                }
            }
            return s;
        }
        return '';
    }
    function dumptag(o) {
        var ss = '<';
        ss += o.tagName + ' ';
        for (var i = 0; i < o.attributes.length; i++) {
            var at = o.attributes[i];
            ss += at.name + '=' + at.value + ' ';
        }
        ss += '>\r\n';
        return ss;
    }
    window.d = function (s, sl) {
        if (isdbg) {
            if (!s) {
                return;
            }
            var t = typeof (s);
            if (t == 'object') {
                if (s.tagName) {
                    s = dumptag(s);
                } else {
                    s = dumpobj(s, sl);
                }
            }
            document.body.oncontextmenu = function () {
                return false;
            }
            console.log(s);
            if (!del) {
                del = document.createElement('div');
                del.style.position = 'fixed';
                del.style.height = '200px';
                del.style.right = '100px';
                del.style.bottom = '100px';
                del.style.width = '200px';
                del.style.border = 'solid 1px darkred';
                del.style.overflow = 'auto';
                del.onmousedown = function (event) {
                    if (event.button == 2) {
                        this.innerHTML = '';
                        console.clear();
                    }
                    return false;
                }
                del.ontouchstart = function (event) {
                    this.innerHTML = '';
                    console.clear();
                    return false;
                }
                del.style.zIndex = 9999999;
                document.body.appendChild(del);
            }
            s = s.replace(/\</g, '&lt;');
            del.innerHTML += s.replace(/\r\n/g, '<br/>') + '<br/>';
            del.scrollTop = del.scrollHeight;
        }
    }
})();