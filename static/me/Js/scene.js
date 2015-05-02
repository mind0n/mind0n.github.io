function offset(el, mevt, del, noAdjust) {
    var rect = this.getBoundingClientRect();
    var lrect = this.$layers;
    var drect = { left: 0, top: 0 };
    if (del) {
        drect = del.getBoundingClientRect();
    }
    var x = mevt.cx;// - rect.left;
    var y = mevt.cy;// - rect.top;
    var ww = mevt.cw;
    var hh = mevt.ch;
    var elrect = el.getBoundingClientRect();
    var os = { x: (elrect.left - elrect.right) / 2, y: (elrect.top - elrect.bottom) / 2 };
    if (!noAdjust) {
        el.style.left = x + os.x - drect.left + 'px';
        el.style.top = y + os.y - drect.top + 'px';
        //elrect = el.getBoundingClientRect();
    } else {
        el.style.left = x - drect.left + 'px';
        el.style.top = y - drect.top + 'px';
    }
    if (ww) {
        el.style.width = ww + 'px';
    }
    if (hh) {
        el.style.height = hh + 'px';
    }
    return { x: x - drect.left, y: y - drect.top };
}
function erase(targetel) {
    var dd = document.body.$ddel$;
    if (!dd || !dd.tagName) {
        dd = document.createElement('div');
        document.body.$ddel$ = dd;
    }
    if (targetel.$label) {
        erase(targetel.$label);
    }
    dd.appendChild(targetel);
    dd.innerHTML = '';
}
var tagcreator = joy.creators.tag;
tagcreator.colorpicker12 = function (j, c) {
    debugger;
};
window.pos = function (el, oel, del, type) {
    var r = { x: 0, y: 0 };
    var dr = { top: 0, left: 0 };
    if (del) {
        dr = del.getBoundingClientRect();
    }
    if (el) {
        var ra = el.getBoundingClientRect();
        var ro = oel ? oel.getBoundingClientRect() : { left: 0, top: 0 };
        var ox = 0;
        var oy = 0;
        if (type) {
            if (type == 1) {
                ox = (ra.right - ra.left) / 2;
                oy = (ra.bottom - ra.top) / 2;
            }
        }
        r.x = ra.left + ox - dr.left;
        r.y = ra.top + oy - dr.top;
    }
    return r;
}
if (!window.scenebag) {
    window.scenebag = {};
}
if (!window.scenebag.behaviors) {
    window.scenebag.behaviors = {};
}
if (!window.scenebag.editors) {
    window.scenebag.editors = {};
}
(function () {
    controllers.scene = function () {
        // Initialize this element
        var el = this;
        el.editing = false;
        el.editingel = null;
        el.$elayer.islayer = true;
        el.$bglayer.islayer = true;
        el.$svg.islayer = true;
        el.islayer = true;
        el.iscene = true;
    }
    var scenemode = 'concept';
    window.scenecfg = {
        zindex: 100
        , cache: {
            links: {}
            , concepts: {}
            , groups: {}
        }
        , mode: function (name) {
            if (name) {
                scenemode = name;
            }
            return scenemode;
        }
        , clear: function () {
            var scene = this;
            scene.$elayer.innerHTML = '';
            scene.$bglayer.innerHTML = '';
            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.islayer = true;
            scene.$elayer.appendChild(svg);
            scene.$svg = svg;
        }
        , removeconcept: function (cel) {
            var scene = this;
            if (cel) {
                for (var i in scene.cache.concepts) {
                    if (i == cel.$uid) {
                        delete scene.cache.concepts[i];
                        break;
                    }
                }
                if (cel.dispose) {
                    cel.dispose();
                    erase(cel);
                }
            }
        }
        , removelink: function (lel) {
            var scene = this;
            if (lel) {
                for (var i in scene.cache.links) {
                    if (i == lel.$uid) {
                        delete scene.cache.links[i];
                        break;
                    }
                }
                if (lel.dispose) {
                    lel.dispose();
                    erase(lel);
                }
            }
        }
        , addConcept: function (mevt, c, isload) {
            // Concept element
            var cpt = {
                tag: 'div', className: 'concept noselect',
                isconcept: true,
                ischanged: false,
                isdirty: false,
                getData: function (json) {
                    var rect = this.getBoundingClientRect();
                    var s = window.getComputedStyle ? window.getComputedStyle(this) : this.currentStyle;
                    rect.w = parseInt(s.width);
                    rect.h = parseInt(s.height);
                    //debugger;
                    var r = { uid: this.$uid, pos: rect, text: this.$box.innerText || this.$box.textContent }
                    return json ? r : JSON.stringify(r);
                }
                , setData: function (data) {
                    var box = this.$box;
                    if (box.innerText) {
                        box.innerText = data;
                    } else {
                        box.textContent = data;
                    }
                }
                , setlink: function (lel) {
                    if (!this.links) {
                        this.links = {};
                    }
                    this.links[lel.$uid] = lel;
                }
                , dispose: function () {
                    var scene = this.$scene;
                    if (this.links) {
                        for (var i in this.links) {
                            scene.removelink(this.links[i]);
                        }
                    }
                }
                , removelink: function (lel) {
                    if (this.links) {
                        for (var i in this.links) {
                            if (i == lel.$uid) {
                                delete this.links[i];
                                break;
                            }
                        }
                    }
                }
                , update: function () {
                    if (this.links) {
                        for (var i in this.links) {
                            var l = this.links[i];
                            if (l.islink && l.update) {
                                l.update();
                            }
                        }
                    }
                    this.showrz(true);
                }
                , activate: function () {
                    this.$box.focus();
                    this.showrz();
                }
                , $: [
                    {
                        tag: 'div', className: 'cntconcept', alias: 'box', $: 'Concept'
                    }
                    , { tag: 'div', className: 'resizer dynDiv_resizeDiv_tl', alias: 'rzlt' }
                    , { tag: 'div', className: 'resizer dynDiv_resizeDiv_br', alias: 'rzrb' }
                ]
                , accept: function (s) {
                    console.log('accept');
                    this.$box.innerHTML = s;
                    this.showrz(true);
                }
                , cancel: function () {
                    this.showrz(true);
                }
                , showrz: function (hide) {
                    if (hide) {
                        $(this.$rzrb).hide();
                        $(this.$rzlt).hide();
                    } else {
                        $(this.$rzrb).show();
                        $(this.$rzlt).show();
                    }
                }
            };
            var scene = this;
            var el = joy.jbuilder(cpt);
            el.$scene = this;
            el.$uid = c ? c.uid : joy.uid();
            el.editor = 'concept';
            el.zindex = 1000;
            if (c) {
                el.setData(c.text);
                el.isdirty = true;
                el.ischanged = false;
            }
            this.$elayer.appendChild(el);
            ByRei_dynDiv.reinit();
            if (!c) {
                this.beginEdit(el);
            }
            if (isload) {
                //debugger;
            }
            offset.call(this, el, mevt, this.$layers, isload);
            cursors.bind(el, { onmouseup: true, ontouchend: true }, function (event) {
                if (this.$scene.mode() == 'concept') {
                    this.$scene.beginEdit(this);
                } else {
                    this.$scene.beginEdit(this, true);
                }
            });
            scene.cache.concepts[el.$uid] = el;

        }
        , line: function (ea, eb, c) {
            var scene = this;
            var ra = pos(ea, scene, scene.$layers, 1);
            var rb = pos(eb, scene, scene.$layers, 1);
            var svg = scene.$svg;
            var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttributeNS(null, "stroke", "gray");
            path.setAttributeNS(null, "fill", "none");
            path.setAttributeNS(null, "stroke-width", "2");
            path.setAttributeNS(null, "d", "M " + ra.x + " " + ra.y + " L " + rb.x + " " + rb.y);
            path.update = function () {
                var scene = this.$scene;
                var ts = this.targets;
                var ea = ts[0];
                var eb = ts[1];
                var ra = pos(ea, scene, scene.$layers, 1);
                var rb = pos(eb, scene, scene.$layers, 1);
                this.pos = [{ x: ra.x, y: ra.y }, { x: rb.x, y: rb.y }, { x: (rb.x + ra.x) / 2, y: (rb.y + ra.y) / 2 }];
                this.setAttributeNS(null, "d", "M " + ra.x + " " + ra.y + " L " + rb.x + " " + rb.y);
                this.$label.style.left = this.pos[2].x + 'px';
                this.$label.style.top = this.pos[2].y + 'px';
            }
            path.dispose = function () {
                var ea = this.targets[0];
                var eb = this.targets[1];
                ea.removelink(this);
                eb.removelink(this);
            }
            path.targets = [ea, eb];
            path.$uid = c ? c.uid : joy.uid();
            if (c) {
                path.isdirty = true;
            }
            path.islink = true;
            path.pos = [{ x: ra.x, y: ra.y }, { x: rb.x, y: rb.y }, { x: (rb.x + ra.x) / 2, y: (rb.y + ra.y) / 2 }];
            path.editor = 'link';
            path.fromel = ea;
            path.toel = eb;
            path.$scene = scene;
            cursors.bind(path, { onmouseup: true, ontouchend: true }, function (event) {
                if (this.$scene.mode() == 'line') {
                    this.$scene.beginEdit(this);
                }
            });
            svg.appendChild(path);
            var rp = path.pos[2];
            var rs = scene.getBoundingClientRect();
            var label = document.createElement('span');
            path.$label = label;
            label.$uid = c && c.labelid ? c.labelid : joy.uid();
            label.$scene = scene;
            label.$line = path;
            label.className = 'linklabel'
            label.style.position = 'absolute';
            label.style.left = rp.x + 'px';
            label.style.top = rp.y + 'px';
            //if (label.innerText) {
            //    label.innerText = c ? c.text : '       ';
            //} else {
            //    label.textContent = c ? c.text : '       ';
            //}
            label.innerHTML = c ? c.text.replace(/\n/g, '<br />') : '&nbsp&nbsp&nbsp&nbsp;';
            scene.$elayer.appendChild(label);
            cursors.bind(label, { onmouseup: true, ontouchend: true }, function (event) {
                if (this.$scene.mode() == 'line') {
                    this.$scene.beginEdit(this.$line);
                }
            });
            path.getData = function (json) {
                var rect = this.getBoundingClientRect();
                var r = { uid: this.$uid, pos: rect, text: this.$label.innerText || this.$label.textContent, fromid: ea.$uid, toid: eb.$uid, labelid: this.$label.$uid };
                return json ? r : JSON.stringify(r);
            };
            scene.cache.links[path.$uid] = path;
            ea.setlink(path);
            eb.setlink(path);
        }
        , loadeditor: function (cel) {
            var edt = null;
            var scene = this;
            if (cel.editor) {
                if (scene['$edt' + cel.editor]) {
                    edt = scene['$edt' + cel.editor];
                } else {
                    edt = joy.jbuilder(window.scenebag.editors[cel.editor]);
                    edt.init(scene);
                    //scene['$edt' + cel.editor] = edt;
                }
            }
            return edt;
        }
        , beginEdit: function (cel, hideditor) {
            var scene = this;
            if (scene.editingel) {
                $(scene.editingel).removeClass('selected');
            }
            scene.editing = true;
            scene.editingel = cel;
            $(cel).addClass('selected');
            if (!hideditor) {
                window.setTimeout(function (scene) {
                    var cel = scene.editingel;
                    var edt = scene.loadeditor(cel);
                    if (edt) {
                        edt.activate(scene, cel);
                        if (scene.onedit) {
                            scene.onedit(edt);
                        }
                    }
                }, 100, this);
            }
            if (!hideditor) {
                cursors.regist({
                    el: cel, zindex: 1000, category:'concept', h: [{
                        dragstart: function (mevt) {
                            var cel = mevt.o.el;
                            var spos = cel.getBoundingClientRect();
                            spos.rx = mevt.cx;
                            spos.ry = mevt.cy;
                            cel.$cursorspos$ = spos;
                            console.log('dragstart');
                        }, dragging: function (mevt) {
                            var cel = mevt.o.el;
                            var spos = cel.$cursorspos$;
                            var scene = cel.$scene;
                            var rect = scene.getBoundingClientRect();
                            var cpos = scene.$layers.getBoundingClientRect();
                            //cpos.left -= rect.left;
                            //cpos.top -= rect.top;
                            var sx = spos.left;
                            var sy = spos.top;
                            var cx = mevt.cx;
                            var cy = mevt.cy;
                            var ox = cx - spos.rx;
                            var oy = cy - spos.ry;
                            cel.style.left = sx + ox - cpos.left + 'px';
                            cel.style.top = sy + oy - cpos.top + 'px';
                            cel.update();
                            console.log('dragging');
                        }, dragend: function (mevt) {
                            console.log('dragend');
                        }
                    }]
                });
            }
        }
        , cancelEdit: function (keepselected) {
            window.setTimeout(function (scene) {
                cursors.unregist('concept');
                scene.editing = false;
                if (!keepselected) {
                    $(scene.editingel).removeClass('selected');
                    scene.editingel = null;
                }
                if (scene.editor) {
                    scene.editor.cancel();
                    if (scene.onedithide) {
                        scene.onedithide(scene.editor);
                    }
                }
            }, 100, this);
        }
        , getLinkedConcepts: function (c) {
            var cache = this.cache;
            var fc = null, tc = null;
            var fid = c.fromid;
            var tid = c.toid;
            for (var i in cache.concepts) {
                var p = cache.concepts[i];
                if (p.isconcept) {
                    if (p.$uid == fid) {
                        fc = p;
                    }
                    if (p.$uid == tid) {
                        tc = p;
                    }
                }
            }
            return [fc, tc];
        }
        , setData: function (json) {
            var scene = this;
            scene.clear();
            var cache = JSON.parse(json);
            scene.cache = cache;
            var cs = cache.concepts;
            var ls = cache.links;
            var gs = cache.groups;
            for (var i in cs) {
                var c = cs[i];
                if (typeof(c) == 'object' && c.pos) {
                    scene.addConcept({ cx: c.pos.left, cy: c.pos.top, cw: c.pos.w, ch: c.pos.h }, c, true);
                }
            }
            for (var i in ls) {
                var lnk = ls[i];
                var duel = scene.getLinkedConcepts(lnk);
                if (duel.length >= 2 && duel[0] != null && duel[1] != null) {
                    scene.line(duel[0], duel[1], lnk);
                }
            }
            for (var i in gs) {
                var g = gs[i];
                if (typeof (g) == 'object' && g.pos) {
                    scene.addGroup({ cx: g.pos.left, cy: g.pos.top, cw: g.pos.w, ch: g.pos.h }, g, true);
                }
            }
        }
        , getData: function (json) {
            var scene = this;
            var r = { concepts: {}, links: {}, groups: {} };
            for (var i in scene.cache.groups) {
                var g = scene.cache.groups[i];
                if (g.isgroup && g.getData) {
                    var d = g.getData(true);
                    //debugger;
                    r.groups[g.$uid] = d;
                }
            }
            for (var i in scene.cache.concepts) {
                var c = scene.cache.concepts[i];
                if (c.isconcept && c.getData) {
                    var d = c.getData(true);
                    //debugger;
                    r.concepts[c.$uid] = d;
                }
            }
            for (var i in scene.cache.links) {
                var l = scene.cache.links[i];
                if (l.islink && l.getData) {
                    r.links[l.$uid] = l.getData(true);
                }
            }
            return json ? r : JSON.stringify(r);
        }
        , singleTouch: function (mevt) {
            var handlers = window.scenebag.behaviors;
            var m = this.mode();
            var h = handlers[m];
            if (h) {
                var target = document.elementFromPoint(mevt.cx, mevt.cy);
                if (target.$root) {
                    target = target.$root;
                }
                h.call(this, mevt, target);
            }
        }
    };
})();
