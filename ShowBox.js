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
         *   }
 *      或者 new ShowBox('#ID',{ interactive:'dialogBox', targetLayer:'#targetID',animateClass:className, callBackFn:fun,beforeFn:fun  })
 *      支持可选参数：{
         *              maskLayer:false,                    //是否出现背景;下拉层不支持此属性；
         *              speed:300,                         //速度
         *              animate : true                     //是否需要动画
         *              className:                         //下拉表列点击对象变化样式
         *       }
 *  Created by Qi.Huang on 15-4-7.
 */

var ShowBox =(function(w,doc,$){
    //获取一个DOM对象并返回它;
   /* var w = arguments[0],
        doc = arguments[1],
        $ = arguments[2];*/
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
        this.defaults = { maskLayer:false, speed:300,animate : false, className:undefined };
        this.maskLayer = $('<div id="shownBg" class="shown-bg container-fluid"></div>');
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
                    targetLayer = arguments[2];
                if(typeof callBackFn === 'function'){
                    callBackFn(obj,targetLayer);
                }
            },
            closeFn:function(targetLayer){
                targetLayer.off('click.a').on('click.a','.close-js',function(e){
                    //isToCallBack = false;
                    // container.css({'height':null,'overflow':null});
                    targetLayer.hide();
                    //body.removeAttr('style');
                    // container.css({'height':'auto'}).css({'overflow':'auto'});
                    getDom("shownBg").hide();
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
                    var body = $('body');
                    //clientH =clientH/window.devicePixelRatio;
                    //var styleOpts = {'height':clientH+'px'};
                    //alert(clientH/window.devicePixelRatio);
                    if(setting.maskLayer && setting.maskLayer == true){
                        targetLayer.unwrap('shownBg');
                        targetLayer.wrap(this.maskLayer);
                    }
                    if(setting.animateClass && typeof setting.animateClass === 'string'){

                        targetLayer.addClass(setting.animateClass).show();//.css(styleOpts);
                        publicMethod.callBack(setting.callBackFn,obj,targetLayer);
                        // isToCallBack = true;
                    }else{

                        body.trigger('click.cancel');
                        targetLayer.show();//.css(styleOpts);
                        publicMethod.callBack(setting.callBackFn,obj,targetLayer);
                        //isToCallBack = true;
                    }
                    publicMethod.closeFn(targetLayer);
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
                        publicMethod.callBack(setting.callBackFn,obj,targetLayer);
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
                    }else if(setting.targetLayer.indexOf('.')===0){
                        var index = obj.index();
                        //targetLayer.hide();
                        $(targetLayer[index]).show().siblings(setting.targetLayer).hide();

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
})(window,document,jQuery);

