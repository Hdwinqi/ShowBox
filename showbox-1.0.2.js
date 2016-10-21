//弹层
/** For show details plugin
 *      支持可选择是弹窗和点击下拉显示两种方式；
 *      <!--<button class="menu-js" data-shown={ interactive:'dialogBox', targetLayer:'#targetID',animateClass:className, callBackFn:fun,beforeFn:fun }></button>-->
 *      new ShowBox(".menu-js");
 *      弹窗、点击下拉层：响应事件标签设置 data-shown=
 *      {            interactive:'dialogBox/dropMenu',      //提取交互方式
         *               targetLayer:'targetID',            //目标层ID
         *               beforeFn:fun                       //执行前回回调
         *               callBackFn : fun                   //执行后回调
         *               lockScroll: boolean                //是否锁定滚动条
         *   }
 *      或者 new ShowBox('#ID',{ interactive:'dialogBox', targetLayer:'#targetID',animateClass:className, callBackFn:fun,beforeFn:fun  })
 *      支持可选参数：{
         *              maskLayer:false,                    //是否出现背景;下拉层不支持此属性；
         *              speed:300,                         //速度
         *              animate : true                     //是否需要动画
         *              className:                         //下拉表列点击对象变化样式
         *       }
 *      使用方法
 *       var openSchoolLayer = function (e) {
                var that  = $(this);
                new ShowBox(that, e,{
                    interactive:'dialogBox',
                    targetLayer:'#schoolPanel',
                    maskLayer:true,
                    animate : true,
                    //className:'on',
                    beforeFn: function(){                                //数据加载前回调
                        //alert('1');
                    },
                    callBackFn: function(){                             //数据加载后回调
                       //alert('2');
                    }
                });
                //isSelectSchool = true;
                e.stopPropagation();
            };
         $('#school').on('click',openSchoolLayer);
 *
 *  Created by Qi.Huang on 16-10-21.
 */

define(['jquery'],function($){
    var w = window;
    var doc = document;
    function getDom(d){
        if(typeof d=="string"){
            d = (d[0]==="#" || d[0]===".") ? $(d) : $(doc.getElementById(d));
        }
        //return jquery object;
        return $(d);
    }
    //获取DOM定义Attr,编译成json object;
    function getAttrToJSON(ele,attr){
        var data = $(ele).attr(attr);
        if(ele && attr && data!==undefined){
            try{
                data = eval("("+data+")");
            } catch (err) {
                alert(attr+" 属性JSON格式错误!");
            }
        } /*else {
         alert(attr+" 属性不存在!");
         }*/
        return data ? data : null;
    }

    var ShowBox = function(obj,evt,opts){
        //this.options = $.extend({},{bg:false,speed:300},opts);
        //debugger;
        this.evtType =evt.type;
        this.opts = opts;
        this.obj = getDom(obj);
        this.defaults = {
            maskLayer:false,
            speed:300,
            animate : false,
            className:undefined,
            lockScroll:false
        };
        this.maskLayer = $('<div id="shownBg" class="shown-bg clearfix"></div>');
        this.int();
    };

    ShowBox.prototype = {
        int : function(){
            // debugger;
            var self = this,
                obj = self.obj;

            var shownParams = $.extend(getAttrToJSON(obj[0], 'data-shown'), self.opts,{});
            //console.log(self.opts);
            self.toggleLayer(obj, shownParams);
            /*for(var i=0; i< len; i++){
             var thisObj = $(obj[i]);
             if (thisObj.is(that)) {

             }
             //evt = shownParams.setEvent,

             //console.log(thisObj);
             /!* if( evt && typeof evt === 'string'){
             thisObj.off(evt).on(evt, function(e) {

             e.stopPropagation();
             });
             }else{
             return ;
             }*!/
             //var thatParams = $.extend(getAttrToJSON($(this)[0], 'data-shown'), self.opts,{});

             }*/
        },
        publicMethod:{     //setting.callBackFn  setting.callBackFn(obj,targetLayer);
            callBack:function(){
                if (arguments.length===0)
                    return;
                var callBackFn = arguments[0],
                    obj = arguments[1],
                    targetLayer = arguments[2],
                    evt = arguments[3];
                if(typeof callBackFn === 'function'){
                    if(evt){
                        $(doc).off(evt+'.a').on(evt+'.a',function(e){
                            if( !$(e.target).is(targetLayer) ) {
                                targetLayer.hide();
                            }
                            e.stopPropagation();
                        });
                    }
                    callBackFn(obj,targetLayer);
                }
            },
            closeFn:function(targetLayer,callBack,sanimate){
                targetLayer.off('click.a').on('click.a','.close-js',function(e){
                    //isToCallBack = false;
                    var hideBg = function(){
                        targetLayer.animate({
                            width: 'toggle',
                            height: 'toggle',
                            left:'+='+ targetLayer.actual('outerWidth')/ 2 +'px',
                            top:'+='+ targetLayer.actual('outerHeight')/ 2 +'px',
                            opacity: 'toggle'
                           } ,200, 'easeOutExpo');
                        if (getDom("shownBg").length>0 && getDom("shownBg").is(':visible')) {
                            getDom("shownBg").animate({opacity: ['hide', 'swing']},1, 'easeOutExpo');
                        }
                    };
                    var normalHide = function(){
                        targetLayer.hide();
                        getDom("shownBg").hide();
                    };
                    sanimate ? hideBg() : normalHide();
                    if (callBack && typeof callBack === 'function') {
                        callBack();
                    }
                    e.stopPropagation();
                });
            }
        },
        toggleLayer : function(obj,opt){
            var type = opt.interactive,
                self = this,
                evt  = self.evtType,
                targetLayer = getDom(opt.targetLayer),
                publicMethod = self.publicMethod,
                setting = $.extend({},self.defaults, opt);
            if(targetLayer.length == 0) return;
            publicMethod.callBack(setting.beforeFn,obj,targetLayer); //执行前回调，通常用于装载数据

            switch (type){
                //弹窗类型
                case "dialogBox":
                    //var isToCallBack = false,
                    //debugger;
                    var body = $('body');
                    var clientH =body.actual('outerHeight'), clientW = $(window).actual('width'),tH = targetLayer.actual('outerHeight')/ 2, tW = targetLayer.actual('outerWidth')/2;
                    var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;  //页面文档顶部距离视窗顶部（即滚动高度）距离
                    scrollTop = scrollTop + $(window).actual('height')/2 - tH;
                    var styleOpts = {
                        'height': clientH + 'px',
                        'width' : clientW + 'px',
                        'position': 'fixed',
                        'left' : '0',
                        'top'  : '0',
                        'z-index' : '199',
                        'background': 'rgba(0,0,0,.4)',
                        'filter': 'progid:DXImageTransform.Microsoft.gradient(startColorstr=#66000000,endColorstr=#66000000)'
                    },
                    targetCss = {
                        'position' : 'absolute',
                        'z-index': '200',
                        'left': '0',
                        'top': scrollTop+'px',
                        'bottom:': '0',
                        'right' : '0',
                        'margin-left': 'auto',
                        'margin-right': 'auto'
                        /*'margin-top' : mt*/
                    };

                    if(setting.animate) {
                        targetCss.left = tW + 'px';
                        targetCss.top = (scrollTop + tH) + 'px';
                    }

                    if (setting.animateClass && typeof setting.animateClass === 'string'){
                        targetLayer.addClass(setting.animateClass);
                    }

                    function lockScroll(){                                                             //计算弹框出现后去除滚动条后应该偏移位置
                        var clientW1 = $(window).width();
                        $('html').addClass('lock-scrollBar');
                        var clientW2 = $(window).width();
                        clientW2 = (clientW2 - clientW1)+'px';
                        targetCss.left = clientW2;
                        $('html').css({'padding-right': clientW2});
                    }
                    function unlockScroll() {                                                        //计算恢复弹框后去除滚动条后应该偏移位置
                        $('html').removeClass('lock-scrollBar');
                        targetCss.left = 0;
                        $('html').removeAttr('style');
                    }
                    if (setting.lockScroll) {
                        lockScroll();
                    }
                   function shownBgAnimation () {
                        getDom("shownBg").animate({
                            opacity: 'show' },1, 'easeOutExpo')
                    }
                   function targetLayerAnimation () {
                        targetLayer.animate({
                            width: 'toggle',
                            height: 'toggle',
                            left:'-='+ tW +'px',
                            top:'-='+ tH +'px',
                            opacity: 'toggle'},200, 'easeInExpo', function(){
                            publicMethod.callBack(setting.callBackFn, obj, targetLayer);
                        })
                    }
                    targetLayer.removeAttr('style').css(targetCss);
                    if(setting.maskLayer && setting.maskLayer == true){
                        var mask = this.maskLayer;
                        mask.removeAttr('style').css(styleOpts);
                        //targetLayer.removeAttr('style').css(targetCss);
                        if( targetLayer.parent()[0].nodeName !="BODY" &&  $('#shownBg').length === 0 ){
                            body.append(mask);
                            body.append(targetLayer);
                        }
                        setting.animate ? targetLayerAnimation() : targetLayer.show();
                        setting.animate ? shownBgAnimation() : getDom("shownBg").show();
                    } else {
                        setting.animate ? targetLayerAnimation() : targetLayer.show();
                    }

                    publicMethod.closeFn(targetLayer, unlockScroll, setting.animate);
                    break;

                //下拉列表
                case "dropMenu" :
                    if(evt=='mouseover'){
                        targetLayer.show();
                        publicMethod.callBack(setting.callBackFn,obj,targetLayer);
                        obj.off('mouseout').on('mouseout',function(e){
                            targetLayer.hide();
                            e.stopPropagation();
                        });
                        targetLayer.hover(function(){
                            $(this).show();
                        },function(){
                            $(this).hide();
                        })
                    }else if(evt == 'click'){
                        targetLayer.toggle();
                        publicMethod.callBack(setting.callBackFn, obj, targetLayer,evt);
                        if(setting.className && typeof setting.className=='string'){
                            obj.toggleClass(setting.className);
                        }
                        publicMethod.closeFn(targetLayer);
                    }
                    break;
                //Tab
                case "tab" :
                    //debugger;
                    if(setting.targetLayer.indexOf('#')===0){
                        targetLayer.siblings().hide();
                        targetLayer.show();
                        publicMethod.callBack(setting.callBackFn,obj,targetLayer);
                    }else if(setting.targetLayer.indexOf('.')===0){
                        var index = obj.index();
                        //targetLayer.hide();
                        $(targetLayer[index]).show().siblings(setting.targetLayer).hide();
                        publicMethod.callBack(setting.callBackFn,obj,$(targetLayer[index]));
                    }
                    //debugger;
                    if(setting.className && typeof setting.className=='string'){
                        // debugger;
                        obj.addClass(setting.className).siblings().removeClass(setting.className);
                    }


            }

        }

    };
    return ShowBox;
});

