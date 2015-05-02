(function ($) {
    var svgcreator = joy.creators.svg;
    var tagcreator = joy.creators.tag;
    svgcreator.package = function (c, cs) {
        var json = {
            svg: 'g', $: {
                svg: 'p'
                , alias: 'pkg'
            }
        };
        c.svg = null;
        joy.extend(json, c, { excludes: 'svg' });
        var el = joy.jbuilder(json, cs);
        el.add = function (json) {
            var cel = json;
            if (!cel.tagName) {
                cel = joy.jbuilder(json, { root: this.$root, group: this.$group$, parent: this.$parent$ });
            }
            if (json.alias) {
                var grp = this;
                grp['$' + json.alias] = cel;
            }
            joy.append(this.$pkg, cel, true);
            return this;
        };
        return el;
    };
    svgcreator.ellipseBox = function (c, cs) {
        var p = joy.jbuilder({ svg: 'package' }, cs);
        p.add({ svg: 'ellipse', alias: 'box', ry: 12, rx: 32, cy: 0, cx: 0, style: { stroke: '#fff', fill: '#aabbcc' } })
         .add({ svg: 'text', alias: 'text', x: 0, y: 0, style: { textAnchor: 'middle', font: '12px Helvetica', opacity: 1, fill: 'blue' }, $: { svg: 'tspan', dy: 4.5, $: 'Json text' } });
        joy.extend(p, c);
        return p;
    };
    svgcreator.rectBox = function (c, cs) {
        var p = joy.jbuilder({ svg: 'package' }, cs);
        p.add({ svg: 'rect', alias: 'box', x: 0, y: 0, rx:15, ry:15, width: 64, height: 24, style: { stroke: '#fff', fill: '#aabbcc' } })
         .add({ svg: 'text', alias: 'text', x: 0, y: 0, style: { textAnchor: 'middle', font: '12px Helvetica', opacity: 1, fill: 'blue' }, $: { svg: 'tspan', dy: 4.5, $: 'Json text' } });
        joy.extend(p, c);
        p.$box.translate2(-32, -12);
        return p;
    };
    svgcreator.point = function (c, cs) {
        var json = { svg: 'circle', cy: 0, cx: 0, r: 1, style: { stroke: '#fff', fill: '#aabbcc' } };
        c.svg = null;
        joy.extend(json, c, { excludes: 'svg' });
        var el = joy.jbuilder(json, cs);
        return el;
    };
    tagcreator.region3d = {
        tag: 'div', style: { position:'absolute', transformStyle: 'preserve-3d', perspective: '1000px', left:'100px', top:'100px', width: '300px', height: '300px', background:'lightblue' }
        , $: { tag: 'div', style: { position: 'absolute', transformStyle: 'preserve-3d', perspective: '1000px', left:'0px;', top:'0px', width: '300px', height: '300px', background: 'yellow' } }
    };
    svgcreator.svglayer = function (c) {
        var json = {
            svg: 'svg'
            , style: {
                overflow: 'visible'
            }
            , version: "1.1"
            , $: { svg: 'circle', alias: 'pt', r: 5, style: { zIndex: 999, display: '' } }
        };
        c.svg = null;
        joy.extend(json, c, { excludes: 'svg' });
        var el = joy.jbuilder(json);
        return el;
    };
    tagcreator.scene = function (c) {
        var json = {
            tag: 'div', className: 'scene', style: { transformStyle: 'preserve-3d', perspective: '1200px', width: '100%', height: '100%' }
            , $: {
                tag: 'div', alias: 'svgroup', style: { width: '100%', height: '100%' }
                , tmove: function (tc) {
                    this.translate3(tc.ox, tc.oy, 0, false);
                }
                , tdrop: function (tc) {
                    this.translate3(tc.ox, tc.oy, 0, true);
                }
                , $: {
                    tag: 'div', alias: 'sclgroup', $:[
                        {
                            svg: 'svglayer'
                            , alias: 'shapelayer'
                        }
                    ]
                }
            }
            , getContainer: function (layer) {
                var r = layer && this['$' + layer] ? this['$' + layer] : this.$shapelayer;
                return r;
            }
            , add: function (json, layer, isprepend, switchToChild) {
                var r = this.getContainer(layer).append(json, switchToChild, isprepend);
                return switchToChild ? r : this;
            }
            , appendTo: function (target, switchToParent) {
                var sp = [0, 0];
                var par = joy.appendTo.call(this, target, true);
                var that = this.getContainer();
                var scene = this;
                var svgroup = this.$svgroup;
                var sclgroup = this.$sclgroup;
                //function adjustPt(target, mx, my) {
                //    if (mx == 0 && my == 0) {
                //        return [0, 0];
                //    }
                //    var sp = svg.toSvgPoint([mx, my]);
                //    var globalToLocal = target.getTransformToElement(svg).inverse();
                //    var inObjectSpace = sp.matrixTransform(globalToLocal);
                //    var p = [inObjectSpace.x, inObjectSpace.y];
                //    if (target.$transform$) {
                //        var s = target.$transform$.scale;
                //        if (s && s.length > 1) {
                //            if (s[0] != 0) {
                //                p[0] /= s[0];
                //            }
                //            if (s[1] != 0) {
                //                p[1] /= s[1];
                //            }
                //        }
                //    }
                //    return p;
                //}
                function adjustPoint(target, mx, my) {
                    if (mx == 0 && my == 0) {
                        return [0, 0];
                    }
                    var rt = target.rect();
                    var s = [sclgroup.$transform$.scale[0], sclgroup.$transform$.scale[1]];
                    var p = [(mx - rt.left) / s[0], (my - rt.top) / s[1]];
                    return p;
                }
                $(par).bind('mousewheel DOMMouseScroll', function (event) {
                    event.preventDefault();
                    var d = joy.input.wheelStep(event);
                    var p = adjustPoint.call(this, sclgroup, sp[0], sp[1]);
                    scene.$sclgroup.scale3(d * 2, d * 2, 0, [0, 0], function (boundary) {
                        if (!boundary) {
                            scene.$svgroup.translate3(-p[0] / d / 2, -p[1] / d / 2, 0, true, true);
                        }
                    });
                    return false;
                });
                $(scene).bind('mousemove', function (e) {
                    //var evt = e || event;
                    //var p = adjustPoint(sclgroup, sp[0], sp[1]);
                    //scene.$pt.translate2(p[0], p[1]);
                });
                $(scene).bind('mouseup', function (e) {
                    var evt = e || event;
                    sp[0] = joy.input.origin[0];
                    sp[1] = joy.input.origin[1];
                    //debugger;
                    var p = adjustPoint(sclgroup, sp[0], sp[1]);
                    scene.$shapelayer.$pt.translate2(p[0], p[1]);
                });
                return switchToParent ? par : this;
            }
            , built: function (json) {
            }
        };
        c.tag = null;
        joy.extend(json, c, { excludes: 'tag' });
        var el = joy.jbuilder(json);
        return el;
    }
})(jQuery);