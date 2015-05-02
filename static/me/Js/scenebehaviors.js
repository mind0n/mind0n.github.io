(function () {
    var a = null, b = null;
    window.scenebag.behaviors.line = function (mevt, target) {
        var scene = this;
        if (target.islayer) {
            a = null; b = null;
            scene.cancelEdit();
            return;
        } else if (target.isconcept) {
            if (a == null) {
                a = target;
            } else if (b == null && a != target) {
                b = target;
            }
            if (a != null && b != null) {
                scene.line(a, b);
                a = b;
                b = null;
            }
        }
    };
    window.scenebag.behaviors.concept = function (mevt, target) {
        var el = this;
        if (!el.editing && target.islayer) {
            el.addConcept(mevt);
        } else if (el.editing && el.editingel) {
            if (target.islayer) {
                el.cancelEdit();
            }
        }
    };
    window.scenebag.behaviors.group = function (mevt, target) {
        var el = this;
        if (!el.editing && target.islayer) {
            el.addGroup(mevt);
        } else if (el.editing && el.editingel) {
            if (target.islayer) {
                el.cancelEdit();
            }
        }
    };
    window.scenebag.behaviors.readonly = function (mevt, target) {
        var scene = this;
        scene.cancelEdit();
    }
})();
