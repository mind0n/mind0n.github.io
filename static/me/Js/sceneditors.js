(function () {
    window.scenebag.editors.concept = {
        tag: 'div'
        , className: 'concepteditor'

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
            scene.$edtconcept = el;
            cursors.bind(el.$bdel, { onmouseup: true, ontouchend: true }, function (event) {
                this.$root.$scene.cancelEdit();
                var scene = this.$root.$scene;
                var cel = this.$root.target;
                scene.removeconcept(cel);
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
        , ename: 'concept'
        , activate: function (scene, cel) {
            var el = this;
            scene.editor = el;
            el.target = cel;
            if (cel.editor != 'concept') {
                debugger;
            }
            el.$box.value = cel.$box.innerText || cel.$box.textContent;
            el.style.display = '';
            cel.activate();
            el.$box.focus();
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
            , {
                tag: 'div', className: 'assistarea'
            }
        ]
    };
    window.scenebag.editors.link = {
        tag: 'div'
        , className: 'concepteditor'
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
            scene.$edtlink = el;
            cursors.bind(el.$bdel, { onmouseup: true, ontouchend: true }, function (event) {
                this.$root.$scene.cancelEdit();
                var scene = this.$root.$scene;
                var cel = this.$root.target;
                if (cel) {
                    scene.removelink(cel);
                }
            });
            cursors.bind(el.$bacc, { onmouseup: true, ontouchend: true }, function (event) {
                var cel = this.$root.target;
                if (cel) {
                    cel.ischanged = true;
                    cel.isdirty = true;
                    cel.$label.innerHTML = this.$root.$box.value.replace(/\n/g, '<br />');
                }
                this.$root.$scene.cancelEdit(true);
            });
            scene.appendChild(el);
        }
        , ename: 'link'
        , activate: function (scene, cel) {
            var el = this;
            scene.editor = el;
            el.target = cel;
            if (cel.editor != 'link') {
                debugger;
            }
            el.$box.value = (cel.$label.innerText || cel.$label.textContent).trim();
            el.style.display = '';
            el.$box.focus();
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
                    , { tag: 'div', $: 'Delete', alias: 'bdel', className: 'del btn' }
                ]
            }
            , {
                tag: 'div', className: 'assistarea'
            }
        ]
    };
})();
