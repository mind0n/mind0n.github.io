(function () {
    if (!window.scenecfg) {
        return;
    }
    window.scenebag.editors.group = {
        tag: 'div'
        , className: 'groupeditor'

        , cancel: function () {
            this.style.display = 'none';
            if (this.target && this.target.cancel) {
                this.target.cancel();
            }
            if (this.target && !this.target.isdirty) {
                erase(this.target);
                this.target = null;
            }
        }
        , init: function (scene) {
            var el = this;
            el.$scene = scene;
            scene.$edtgroup = el;
            cursors.bind(el.$bdel, { onmouseup: true, ontouchend: true }, function (event) {
                this.$root.$scene.cancelEdit();
                var scene = this.$root.$scene;
                var cel = this.$root.target;
                scene.removegroup(cel);
            });
            cursors.bind(el.$bacc, { onmouseup: true, ontouchend: true }, function (event) {
                var cel = this.$root.target;
                if (cel) {
                    cel.ischanged = true;
                    cel.isdirty = true;
                    cel.$box.innerHTML = this.$root.$box.value.replace(/\n/g, '<br />');
                    cel.update();
                }
                this.$root.$scene.cancelEdit(true);
            });
            scene.appendChild(el);
        }
        , ename: 'group'
        , activate: function (scene, cel) {
            var el = this;
            scene.editor = el;
            el.target = cel;
            if (cel.editor != 'group') {
                debugger;
            }
            el.$box.value = cel.$box.innerText || cel.$box.textContent;
            el.style.display = '';
            el.$box.focus();
            cel.activate();
        }
        , $: [
            {
                tag: 'div', className: 'boxarea', $: {
                    tag: 'textarea', alias: 'box'
                }
            }
            , {
                tag: 'div', className: 'cmdarea', $: [
                    { tag: 'div', alias: 'bacc', className: 'acc btn', $: 'Accept' }
                    , { tag: 'div', alias: 'bdel', className: 'del btn', $: 'Delete' }
                ]
            }
            , { tag: 'div', className: 'assistarea' }
        ]
    };
    window.scenecfg.removegroup = function (cel) {
        var scene = this;
        if (cel) {
            for (var i in scene.cache.groups) {
                if (i == cel.$uid) {
                    delete scene.cache.groups[i];
                    break;
                }
            }
            if (cel.dispose) {
                cel.dispose();
                erase(cel);
            }
        }
    };
    window.scenecfg.addGroup = function (mevt, c, isload) {
        // Group element
        var cpt = {
            tag: 'div', className: 'group noselect',
            ischanged: false,
            isgroup:true,
            isdirty: false,
            getData: function (json) {
                var rect = this.getBoundingClientRect();
                var s = window.getComputedStyle ? window.getComputedStyle(this) : this.currentStyle;
                rect.w = parseInt(s.width);
                rect.h = parseInt(s.height);
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
                //if (!this.links) {
                //    this.links = {};
                //}
                //this.links[lel.$uid] = lel;
            }
            , dispose: function () {
                //var scene = this.$scene;
                //if (this.links) {
                //    for (var i in this.links) {
                //        scene.removelink(this.links[i]);
                //    }
                //}
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
                this.showrz(true);
            }
            , activate: function () {
                this.showrz();
            }
            , $: [
                {
                    tag: 'div', className: 'cntgroup', alias: 'box', $: 'Group'
                }
                , { tag: 'div', className: 'resizer dynDiv_resizeDiv_tl', alias: 'rztl' }
                , { tag: 'div', className: 'resizer dynDiv_resizeDiv_br', alias: 'rzrb' }
            ]
            , accept: function (s) {
                console.log('accept');
                this.$box.innerHTML = s;
                $(this.$rzrb).hide();
            }
            , cancel: function () {
                this.showrz(true);
            }
            , showrz: function (hide) {
                if (hide) {
                    $(this.$rzrb).hide();
                    $(this.$rztl).hide();
                } else {
                    $(this.$rzrb).show();
                    $(this.$rztl).show();
                }
            }
        };
        var scene = this;
        var el = joy.jbuilder(cpt);
        el.$scene = this;
        el.$uid = c ? c.uid : joy.uid();
        el.editor = 'group';
        el.zindex = 1000;
        el.style.minWidth = '100px';
        el.style.minHeight = '100px';
        if (c) {
            el.setData(c.text);
            el.isdirty = true;
            el.ischanged = false;
        }
        this.$elayer.insertBefore(el, this.$svg);
        ByRei_dynDiv.reinit();

        //this.$bglayer.appendChild(el);
        if (!c) {
            this.beginEdit(el);
        }
        if (isload) {
            //debugger;
        }
        offset.call(this, el, mevt, this.$layers, isload);
        cursors.bind(el, { onmouseup: true, ontouchend: true }, function (event) {
            if (this.$scene.mode() == 'group') {
                this.$scene.beginEdit(this);
            } else {
                this.$scene.beginEdit(this, true);
            }
        });
        scene.cache.groups[el.$uid] = el;
    };
})();
