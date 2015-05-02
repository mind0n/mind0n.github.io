String.prototype.format = function () {
    var args = arguments;
    var s = this;
    if (!args || args.length < 1) {
        return s;
    }
    var r = s;
    for (var i = 0; i < args.length; i++) {
        var reg = new RegExp('\\{' + i + '\\}');
        r = r.replace(reg, args[i]);
    }
    return r;    
};
window.spawn = function (o) {
    var r = {};
    if (o instanceof Array || o.length) {
        r = [];
        for (var i = 0; i < o.length; i++) {
            r[r.length] = o[i];
        }
    }
    for (var i in o) {
        if (!r[i] && o[i]) {
            r[i] = o[i];
        }
    }
    return r;
};

function List(destroyer) {
    var a = new Array();
    a.add = function (o) {
        a[a.length] = o;
    };
    a.del = function (o) {
        var t = typeof (o);
        var index = -1;
        if (t == 'object') {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == o) {
                    index = i;
                    break;
                }
            }
        } else {
            index = parseInt(o);
            if (isNaN(index)) {
                index = -1;
            }
        }
        if (index >= 0 && index < this.length) {
            for (var j = i; j > 0; j--) {
                this[j] = this[j - 1];
            }
            this.pop();
        }
    };
    a.clear = function () {
        for (var i = 0; i < this.length; i++) {
            var item = this.pop();
            if (destroyer) {
                destroyer(item);
            }
            if (item) {
                delete item;
                item = null;
            }
        }
    };
    return a;
}

function Dict(destroyer) {
    var o = {};
    o.exist = function (key) {
        if (this[key]) {
            return true;
        }
        return false;
    }
    return o;
}

function attr(el, name, val) {
    if (el && el.tagName && name) {
        if (val) {
            el.setAttributeNS(null, name, val);
        } else {
            return el.getAttribute(name) || el.getAttributeNS(null, name) || el[name];
        }
    }
}



