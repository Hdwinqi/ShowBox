# ShowBox
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
