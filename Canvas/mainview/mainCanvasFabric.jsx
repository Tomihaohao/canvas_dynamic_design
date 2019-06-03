import React from 'react'
import {traverseData, objCopy,getDoc,traverseTreeCategory,iiHOC, getTableHeight,getStorage} from '@/utils'
import {api, testApi, APIS, Service2} from '@/bid/api';
import { superAPIS } from '@/api/config'
import {Icon, Button,Drawer,Popover,Radio, message,Card, Modal, Form, Select, Row, Col, Input, Divider,Badge, Upload, Layout, Tree,Affix,List,InputNumber,Slider,Tabs,Tooltip  } from 'antd';
import PageHeader from '@/components/Page/pageHeader'
import CSSModules from 'react-css-modules';
import styles from '../index.less'
import moment from 'moment';
const { Header, Footer, Sider, Content } = Layout;
import paper from 'paper';
import {fabric } from 'fabric';
import ImageListForm from '../component/imageList'
import initAligningGuidelines from './AligningGuidelines.js';
import {$M,$V,$L,$P} from './helper.js'
import {StringHelpers,StringBuffer} from './stringHelper'
import {controlExt} from './controlExt.js';
const ButtonGroup = Button.Group;
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
//
var identityMatrix = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
];
// let FromPoint =[
//   {x:0,y:0},
//   {x:0,y:100},
//   {x:100,y:0},
//   {x:100,y:100},
// ]
// let toPoint =[
//   {x:0,y:0},
//   {x:0,y:100},
//   {x:100,y:0},
//   {x:100,y:100},
// ]


@CSSModules(styles, {allowMultiple: true})
class CanvasMain extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      scaleNum:70,
      imgListVisible:false,
      EventObjStore:{
        ImgObj:null,
        ImgTarget:null,
        imgObjList:[]
      },
      marks:{
        0:'0',
        45:'45',
        90:'90',
        135:'135',
        180:'180',
        225:'225',
        270:'270',
        315:'315',
        360:'360'
      },
      SingalObj:{
      },
      SelectImgObj:null,
      ClipImgObj:null,
      ClipImgObjStatus:null,
      canvasObj:null,
      cloneObj:null,
      matrix:{
        a:1,
        b:0,
        c:0,
        d:1
      },
      ImgTransformvisible:false,
      matrix3d:{
        x:0,
        y:0,
        z:0
      },
      matrix3dStr:"",
      translationMatrix:[
        1,    0,    0,   0,
        0,    1,    0,   0,
        0,    0,    1,   0,
        0,    0,   0,    1
      ],
      scaleMatrix:[
        1,    0,    0,   0,
        0,    1,    0,   0,
        0,    0,    1,   0,
        0,    0,    0,   1
      ],
      FromPoint:[
        {x:0,y:0},
        {x:0,y:100},
        {x:100,y:0},
        {x:100,y:100},
      ],
      toPoint:[
        {x:0,y:0},
        {x:0,y:100},
        {x:100,y:0},
        {x:100,y:100},
      ],
      ktObject:{
        color:"",
        rx:""
      },
      dataUrlHttp:"",
      visibleDraw:true,
      SaveCanvasStatus:false,
      SaveObj:{
        jsonObj:"",
        svgObj:"",
        base64Obj:"",
      },
      AiLayer:null,
      budgetId:"",
      spaceId:"",
      SuCaiList:null,
      KongJianList:null,
      TabActivate:"0",
      FangAnName:"",
      FangAnDes:"",
      eleColor:"",
      eleTolerance:"",
      kou_imgData:"",
      kou_imgDataResult:"",
      rgbaPicker:[],
      imageResizeStatue:false,
      buttontabbar:null,
      buttontoolbar:true,
      cliptoolbar:true,
      transformtoolbar:true,
      canvasHistoryArr:[],
      canvasHistoryArrNum:-1,
    }

  }
  initCanvas=()=>{
    let that = this;
    let spaceId = getStorage('spaceId');
    let {KongJianList,canvasObj } = that.state;
    //let canvas = this.refs.myCanvas;
    //加载ext;
    controlExt();
    let canvas;

    if(!canvasObj){
       canvas = new fabric.Canvas("myCanvas",{
        width:1366,
        height:768,
        backgroundColor: '#dcdcdc',
        controlsAboveOverlay:true,
         preserveObjectStacking:true,
      });
      that.state.canvasObj =canvas;
    }else{
      canvas = canvasObj;
    }

    canvas.backgroundColor = 'transparent';
    canvas.controlsAboveOverlay = true;
    canvas.setOverlayImage('./static/svg/bg.png', canvas.renderAll.bind(canvas));

    window.onload=function(){

    }
    that.initDocumentMouseHandle(canvas);//初始化鼠标事件
    that.initCanvasMouseHandle(canvas); //初始化 paper鼠标事件
    initAligningGuidelines(canvas);//辅助线初始化
    if(KongJianList){
      if(!KongJianList[0]) return;
      if(KongJianList[0].canvasData){
        that.state.canvasObj.loadFromJSON(JSON.parse(KongJianList[0].canvasData));
        that.state.canvasObj.renderAll();
      }else{
        message.info("服务器 暂无数据 加载");
      }
    }
  }
  initCanvasMouseHandle=(canvas)=>{
    let that=this;
    let {EventObjStore,SelectImgObj,AiLayer,canvasObj,canvasHistoryArr,canvasHistoryArrNum} = that.state;
    canvas.on('mouse:down', function(options) {
      if (options.target) {

        //存入SelectImgObj
        if(options.target.name="svgimage"){
          AiLayer = options.target._objects;
        }else{
          AiLayer=null;
        }
        SelectImgObj=options.target;
        //边角样式
        SelectImgObj.borderColor='black';
        SelectImgObj.cornerColor='#fff';
        SelectImgObj.cornerStyle='circle';
        SelectImgObj.transparentCorners=false;
        SelectImgObj.cornerStrokeColor='#000';
        SelectImgObj.selectionBorderColor='rgba(255, 255, 255, 0.6)';
        SelectImgObj.selectionLineWidth=2;
        canvasObj.renderAll();
        that.setState({SelectImgObj,AiLayer});
      }
    });
    canvas.on('mouse:move', function(options) {
      if (options.target) {

      }
      if(EventObjStore.ImgObj){
        //let point = event.point;

        that.initRasterHandle(options,canvas);
      }
    });
    canvas.on('mouse:up', function(options) {

      if (options.target) {
        //每次鼠标操作后默认保存到本地 记录10次
        let jsonDom = canvas.toJSON();
        if(canvasHistoryArr.length>30){
          canvasHistoryArr.shift();
          canvasHistoryArr.push(jsonDom);
        }else{
          canvasHistoryArr.push(jsonDom)
        }
        canvasHistoryArrNum=canvasHistoryArr.length-1;
        that.setState({canvasHistoryArr,canvasHistoryArrNum});
      }
    });


  }
  initRasterHandle=(options,canvas)=>{
    let that=this;
    let { SingalObj,EventObjStore,AiLayer } =that.state;

    if(EventObjStore.ImgTarget.name=="svgimage"){
      fabric.loadSVGFromURL(EventObjStore.ImgObj, function (ob, op) {
        let shape = fabric.util.groupSVGElements(ob, op);
        shape.left=options.pointer.x;
        shape.top=options.pointer.y;
        shape.borderColor='black';
        shape.cornerColor='black';
        shape.cornerStrokeColor='black';
        shape.uniScaleTransform=true;
        shape.crossOrigin='anonymous';
        shape.name='svgimage';
        shape.src=EventObjStore.ImgObj;
        canvas.add(shape);
        EventObjStore.imgObjList.push(shape);
        EventObjStore.ImgObj=null;
        EventObjStore.ImgTarget=null;



        that.setState({AiLayer});
      });
    }else{
      //创建图片
      fabric.Image.fromURL(EventObjStore.ImgObj, function(oImg) {
        oImg.scale(0.5);
        oImg.left=options.pointer.x;
        oImg.top=options.pointer.y;
        oImg.borderColor='black';
        oImg.cornerColor='black';
        oImg.cornerStrokeColor='black';
        oImg.uniScaleTransform=true;
        oImg.crossOrigin='anonymous';
        oImg.width=EventObjStore.ImgTarget.naturalWidth;
        oImg.height = EventObjStore.ImgTarget.naturalHeight;
        oImg.src=EventObjStore.ImgObj;
        canvas.add(oImg);
        EventObjStore.imgObjList.push(oImg);
        EventObjStore.ImgObj=null;
        EventObjStore.ImgTarget=null;

      });
    }




  }
  initDocumentMouseHandle=(tool)=>{
    let that = this;
    let {EventObjStore,canvasObj} = that.state;
    document.addEventListener("drag", function(event) {
      if(event.target.className=="dragElement"){

      }

    }, false);

    document.addEventListener("dragstart", function(event) {
      if(event.target.className=="dragElement" ){

      }

    }, false);

    document.addEventListener("dragend", function(event) {
      // reset the transparency
      if(event.target.className=="dragElement"){
        event.target.style.opacity = "";

        EventObjStore.ImgObj=event.target.currentSrc;
        EventObjStore.ImgTarget = event.target;
      }
    }, false);

    /* events fired on the drop targets */
    document.addEventListener("dragover", function(event) {
      // prevent default to allow drop
      event.preventDefault();
      if(event.target.className=="dragElement"){


      }

    }, false);

    document.addEventListener("dragenter", function(event) {
      // highlight potential drop target when the draggable element enters it
      // if (event.target.className == "dropzone") {
      //   event.target.style.background = "purple";
      // }


    }, false);

    document.addEventListener("dragleave", function(event) {
      // reset background of potential drop target when the draggable element leaves it
      // if (event.target.className == "dropzone") {
      //   event.target.style.background = "";
      // }


    }, false);

    document.addEventListener("drop", function(event) {
      // prevent default action (open as link for some elements)
      event.preventDefault();



    }, false);

    document.addEventListener("keydown",function(event){
      if (46 === event.keyCode) {
        // 46 is Delete key
        //键盘删除操作
        if(!canvasObj) return;
        let SelectImgObj=canvasObj.getActiveObject();
        if(!SelectImgObj){
          message.info("请选择一个元素删除")
        }else{
          canvasObj.remove(SelectImgObj);
          SelectImgObj=null;
          canvasObj.renderAll();
          that.setState({SelectImgObj});
        }
      }
    },false)
  }

  componentWillReceiveProps(nextProps) {

    let that = this;
    //ID CHANGE 重新初始化 dadasd
    //that.loadOnce()
  }
  componentDidMount() {
    let that = this;
    that.initRequest().then(function(){
      that.initCanvas();
    });
    window.addEventListener('popstate', function(event) {
      that.loadOnce();
    });
  }
  loadOnce=()=>{
    let that = this;
    that.initRequest().then(function(KongJianList){

      let objList = that.state.canvasObj.getObjects();
      if(objList.length>0){
        objList.map((item,index)=>{
          that.state.canvasObj.remove(item);
        })
      }
      if(KongJianList){
        if(!KongJianList[0]) {
          message.info("服务器 暂无数据 加载");
          return;
        };
        if(KongJianList[0].canvasData){
          that.state.canvasObj.loadFromJSON(JSON.parse(KongJianList[0].canvasData));
          that.state.canvasObj.renderAll();
        }
      }
    });

  }
  initRequest=()=>{
    let that = this;
    let { SuCaiList,KongJianList } = that.state;
    return new Promise(function(resolve, reject) {
      //获取 budgetId 和 spaceId
      let href = window.location.href;
      let start = href.indexOf('=')+1;
      let end = href.indexOf('#');
      let bizopBudgetHeaderId = href.slice(start,end);
      let budgetId = bizopBudgetHeaderId;
      var index = href.lastIndexOf("\/");
      let spaceId = href.substring(index + 1,href.length);
      function isNumber(val){
        var regPos = /^\d+(\.\d+)?$/; //非负浮点数
        var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
        if(regPos.test(val) || regNeg.test(val)){
             window.sessionStorage.setItem('spaceId',val)
             return true;
        }else{
            return false;
        }
    }
    if(!isNumber(spaceId)){
      return;
    }

      that.setState({
        budgetId:budgetId,
        spaceId:spaceId
      });
      //获取素材列表
      api.get("... your url").then(function(res){

        SuCaiList = res.data.data;
        that.setState({
          SuCaiList
        })
      })
      //获取 当前空间列表方案
      api.get('your url').then(function(res){
        KongJianList = res.data.data;
        that.setState({
          KongJianList,
          TabActivate:"0"
        },function(){
          resolve(KongJianList);
        });
      })
    })

  }
  ScaleChange=(v)=>{
    let that= this;
    that.setState({
      scaleNum:v
    })
  }
  showImgList=()=>{
    let that= this;
    that.setState({
      imgListVisible:true
    })
  }
  imageListCallBack=(status)=>{
    let that= this;
    that.setState({
      imgListVisible:false
    });
  };
  layerUpDown=(param)=>{
    let that=this;
    let {SelectImgObj,canvasObj} = that.state;
    if(!SelectImgObj) return;
    let canvas = canvasObj;
    let myObject = SelectImgObj;
    if(param=='up'){

      canvas.bringForward(myObject)
    }
    if(param=='down'){

      canvas.sendBackwards(myObject)

    }
    if(param=='top'){

      canvas.bringToFront(myObject)
      canvasObj.discardActiveObject(myObject);
    }
    if(param=='bottom'){

      canvas.sendToBack(myObject)
      canvasObj.discardActiveObject(myObject);
    }
    canvasObj.renderAll();
  }
  rotateChange=(v)=>{
    //进行水平翻转
    let that = this;
    let {SelectImgObj,canvasObj} = that.state;
    if(!SelectImgObj) return;

    SelectImgObj.rotate(v);
    canvasObj.renderAll();
  }
  ImageFlip=(v)=>{
    let that = this;
    let {SelectImgObj,canvasObj} = that.state;
    if(!SelectImgObj) return;
    if(v=='x'){
      if(SelectImgObj.flipX){
        SelectImgObj.flipY=false;
        SelectImgObj.flipX=false;
      }else{
        SelectImgObj.flipY=false;
        SelectImgObj.flipX=true;
      }

    }
    if(v=='y'){
      if(SelectImgObj.flipY){
        SelectImgObj.flipX=false;
        SelectImgObj.flipY=false;
      }else{
        SelectImgObj.flipX=false;
        SelectImgObj.flipY=true;
      }

    }
    canvasObj.renderAll();
  }
  ImageCopy=(v)=>{
    let that = this;
    let {SelectImgObj,canvasObj,cloneObj} = that.state;
    if(!SelectImgObj) return;
    let _clipboard;
    let canvas = canvasObj;
    if(v=="copy"){
      canvas.getActiveObject().clone(function(cloned) {
        _clipboard = cloned;
        cloneObj=cloned;

        that.setState({cloneObj});
      });
    }
    if(v=="paste"){
      let _clipboard=cloneObj;

      if(!cloneObj){
        message.info("请先复制");
        return;
      }
      _clipboard.clone(function(clonedObj) {
        canvas.discardActiveObject();
        clonedObj.set({
          left: clonedObj.left + 20,
          top: clonedObj.top + 20,
          borderColor:'black',
          cornerColor:'black',
          cornerStrokeColor:'black',
          evented: true,
        });
        if (clonedObj.type === 'activeSelection') {
          // active selection needs a reference to the canvas.
          clonedObj.canvas = canvas;
          clonedObj.forEachObject(function(obj) {
            canvas.add(obj);
          });
          // this should solve the unselectability
          clonedObj.setCoords();
        } else {
          canvas.add(clonedObj);
        }
        _clipboard.top += 10;
        _clipboard.left += 10;
        canvas.setActiveObject(clonedObj);
        canvas.requestRenderAll();
      });
    }
  }
  layerDelete=()=>{
    let that = this;
    let {SelectImgObj,canvasObj} = that.state;
    if(!SelectImgObj) return;
    if(SelectImgObj._objects){
      SelectImgObj._objects.map((item)=>{
        canvasObj.remove(item);
      })
      canvasObj.remove(SelectImgObj);
    }else{
      canvasObj.remove(SelectImgObj);
    }

    canvasObj.renderAll();
  }
  layerDeleteAll=()=>{
    let that = this;
    let {SelectImgObj,canvasObj} = that.state;
    if(!canvasObj) return;
    Modal.confirm({
      title:"清空操作",
      content:"你确定清空整个画布吗？",
      onOk() {

        let objList = canvasObj.getObjects();
        if(objList.length>0){
          objList.map((item,index)=>{
            canvasObj.remove(item);
          })
        }
        canvasObj.renderAll();
        SelectImgObj=null;
        that.setState({SelectImgObj});
      },
    })
  }
  Imagelock=(v)=>{
    let that = this;
    let {SelectImgObj,canvasObj} = that.state;
    if(!SelectImgObj) return;
    if(v=='lock'){
      SelectImgObj.lockMovementX=true;
      SelectImgObj.lockMovementY=true;
      SelectImgObj.lockRotation=true;
      SelectImgObj.selectable=false;
      SelectImgObj.hoverCursor="not-allowed";
      SelectImgObj.lock=true;
    }
    if(v=='unlock'){
      SelectImgObj.lockMovementX=false;
      SelectImgObj.lockMovementY=false;
      SelectImgObj.lockRotation=false;
      SelectImgObj.selectable=true;
      SelectImgObj.hoverCursor="drag";
      SelectImgObj.lock=false;
      canvasObj.setActiveObject(SelectImgObj);
    }
    canvasObj.requestRenderAll();
  }
  clipImage=(state)=>{
    let that = this;
    let {SelectImgObj,canvasObj} = that.state;
    let activeObject = state.canvas.getActiveObject(); //获取当前激活 object

    if(!activeObject){
      activeObject = state;
    }
    state.isClipping = true; //设置裁剪状态
    if (activeObject.type === 'image') { //判断图片类型
      let clipBox = new fabric.Rect({//创建剪裁框
        left: activeObject.left,
        top: activeObject.top,
        width: activeObject.width,
        height: activeObject.height,
        strokeWidth: 1,
        fill: 'transparent',
        objectCaching: false,
        scaleX: activeObject.scaleX,
        scaleY: activeObject.scaleY,
        selectionBackgroundColor: 'rgba(255, 255, 255, 0)',
        padding: 0,
        angle: activeObject.angle,
        borderColor:'red',
        cornerColor:'red',
        cornerStrokeColor:'red',
        src:activeObject.src
      });
      state.clipBox = clipBox
      state.clipActiveObj = activeObject;
      // 区分是svg的img还是普通img
      //let url = activeObject.src ? activeObject.src : activeObject['xlink:href']
      let url = SelectImgObj.src
      //加载图片 赋值到剪裁框


      fabric.util.loadImage(url, function(img) {
        clipBox.fill = new fabric.Pattern({
          source: img,
          repeat: 'no-repeat',
          offsetX: 0,
          offsetY: 0,
        });
        state.canvas.add(clipBox);
        //设置选中Object 样式
        activeObject.set({
          selectable: false,
          hoverCursor: 'default',
          evented: false,
          hasControls: false,
          perPixelTargetFind: false,
        })
        //复制
        activeObject.clone(function (clonedObj) {
          state.canvas.discardActiveObject(); //取消选中
          clonedObj.set({//设置复制Object 样式
            left: clonedObj.left,
            top: clonedObj.top,
            evented: false,
            opacity: 0.5,
            backgroundColor:'rgba(0,0,0,0.4)'
          });
          clipBox.clipClone = clonedObj;
          state.canvas.add(clonedObj);
        });

        //显示当前Object
        activeObject.visible = false;

        state.canvas.renderAll();

        //注册事件
        state.clipBox.lockRotation=true;
        state.clipBox.on({
          'moving': () => {
            if (!state.isClipping) {
              clipBox.clipClone.left = clipBox.left - state.clipLeft
              clipBox.clipClone.top = clipBox.top - state.clipTop
              if(state.canvas){
                state.canvas.renderAll()
              }

              return
            }
            let left =clipBox.left - clipBox.clipClone.left;
            let top = clipBox.top - clipBox.clipClone.top;

            state.clipLeft = left
            state.clipTop = top
            clipBox.fill.offsetX = -left / clipBox.clipClone.scaleX
            clipBox.fill.offsetY = -top / clipBox.clipClone.scaleY
            if(state.canvas){
              state.canvas.renderAll()
            }
          },
          'scaling': () => {
            if (!state.isClipping) {
              clipBox.clipClone.left = clipBox.left - state.clipLeft
              clipBox.clipClone.top = clipBox.top - state.clipTop
              clipBox.clipClone.scaleX = clipBox.scaleX
              clipBox.clipClone.scaleY = clipBox.scaleY
              if(state.canvas){
                state.canvas.renderAll()
              }
              return
            }
            // let _width = clipBox.width / clipBox.
            let _width = clipBox.width * clipBox.scaleX / clipBox.clipClone.scaleX
            let _height = clipBox.height * clipBox.scaleY / clipBox.clipClone.scaleY
            let left =clipBox.left - clipBox.clipClone.left;
            let top = clipBox.top - clipBox.clipClone.top;
            state.clipLeft = clipBox.left
            state.clipTop = clipBox.top
            clipBox.fill.offsetX = -left / clipBox.clipClone.scaleX
            clipBox.fill.offsetY = -top / clipBox.clipClone.scaleX
            clipBox.scaleX = clipBox.clipClone.scaleX
            clipBox.scaleY = clipBox.clipClone.scaleY

            clipBox.width = _width
            clipBox.height = _height

            if(state.canvas){
              state.canvas.renderAll()
            }
          }
        })

        setTimeout(() => {
          //设置当前元素
          state.canvas.setActiveObject(state.clipBox);
          state.clipBox.clipClone.visible=true;
          state.clipBox.lockRotation=false;
          if(state.canvas){
            state.canvas.renderAll()
          }
        }, 500)
      })

    } else {
      //点击继续剪裁
      // activeObject.clipClone.visible = true;
      // state.canvas.renderAll();
      message.info("你已经剪裁过了");
    }
  }
  confirmClip=(status)=>{
    let that = this;
    let {ClipImgObj,canvasObj,ClipImgObjStatus} = that.state;
    if(!ClipImgObj) return;
    if(status=="finish"){
      let state = ClipImgObj;

      let activeObject = state.canvas.getActiveObject();

      state.isClipping = false
      activeObject.clipClone.visible = false;


      state.canvas.remove(state.clipActiveObj);

      activeObject.crossOrigin='anonymous';
      //canvasObj.remove(activeObject);
      //创建新的 移除原来的
    }else{
      let state = ClipImgObj;


      //还原创建新的
      let src = state.src;
      let top=state.top;
      let left=state.left;
      let scaleX=state.scaleX;
      let scaleY =state.scaleY;

      fabric.Image.fromURL(src, function(oImg) {
        oImg.left=left;
        oImg.top=top;
        oImg.borderColor='black';
        oImg.cornerColor='black';
        oImg.cornerStrokeColor='black';
        oImg.src=src;
        oImg.scaleX=scaleX;
        oImg.scaleY=scaleY;
        oImg.crossOrigin='anonymous';
        canvasObj.add(oImg);
        canvasObj.setActiveObject(oImg);
      });

      let activeObject = state.canvas.getActiveObject();
      activeObject.clipClone.visible = true;
      state.canvas.remove(state.clipBox);
      state.canvas.remove(state.clipBox.clipClone);
      state.canvas.remove(state.clipClone);
      state.canvas.remove(state.clipActiveObj);
      canvasObj.renderAll();
      //
    }
    ClipImgObjStatus=null;
    that.setState({ClipImgObjStatus})

  }
  ClipImage=()=>{
    let that = this;
    let {SelectImgObj,canvasObj,ClipImgObj,ClipImgObjStatus} = that.state;
    if(!SelectImgObj) return;

    that.setState({ClipImgObjStatus:true},function(){

    });
    if(SelectImgObj.type=="image"){
      ClipImgObj = SelectImgObj;
      that.setState({ClipImgObj});
      that.clipImage(SelectImgObj);
    }else{

      canvasObj.remove(SelectImgObj);
      canvasObj.add(ClipImgObj);
      that.clipImage(ClipImgObj);
    }


  }
  ImageResize=()=>{
    let that = this;
    let {SelectImgObj,canvasObj,matrix,FromPoint,toPoint,imageResizeStatue} = that.state;
    let activeObject = canvasObj.getActiveObject(); //获取当前激活 object
    if(!activeObject){
      message.info("请选择一个元素变形");
      return;
    }
    imageResizeStatue=true;
    //隐藏原来的；
    activeObject.visible=true;
    canvasObj.remove(activeObject);


    //记录坐标点 和图像大小
    let leftPoint = activeObject.left;
    let topPoint = activeObject.top;
    let srcUrl=activeObject.src;
    // let ActiveWidth = activeObject.width*activeObject.scaleX;
    // let ActiveHeight =activeObject.height* activeObject.scaleY;

    let ActiveWidth =  (activeObject.aCoords.tr.x-activeObject.aCoords.tl.x)<0?-(activeObject.aCoords.tr.x-activeObject.aCoords.tl.x):(activeObject.aCoords.tr.x-activeObject.aCoords.tl.x);
    let ActiveHeight = (activeObject.aCoords.tl.y-activeObject.aCoords.bl.y)<0?-(activeObject.aCoords.tl.y-activeObject.aCoords.bl.y):(activeObject.aCoords.tl.y-activeObject.aCoords.bl.y);
    let MatrixImg = that.refs.MatrixImg;
    let matrixBox = that.refs.matrixBox;

    let point1=this.refs.point1;
    let point2=this.refs.point2;
    let point3=this.refs.point3;
    let point4=this.refs.point4;
    //设置图像src;
    document.getElementById(MatrixImg.id).setAttribute("src",srcUrl);

    //设置盒子宽高
    document.getElementById(matrixBox.id).style.width = ActiveWidth+"px";
    document.getElementById(matrixBox.id).style.height = ActiveHeight+"px";
    document.getElementById(matrixBox.id).style.left=leftPoint+"px";
    document.getElementById(matrixBox.id).style.top=topPoint+"px";
    document.getElementById(matrixBox.id).style.display="block";

    //设置 点坐标
    document.getElementById("point1").style.top=0+'px';
    document.getElementById("point1").style.left=0+'px';

    document.getElementById("point2").style.top=ActiveHeight-20+"px";
    document.getElementById("point2").style.left=0+'px';

    document.getElementById("point3").style.top=0+'px';
    document.getElementById("point3").style.left=ActiveWidth-20+"px";

    document.getElementById("point4").style.top=ActiveHeight-20+"px";
    document.getElementById("point4").style.left=ActiveWidth-20+"px";

    //设置初始4坐标
    // FromPoint:[
    //   {x:0,y:0},
    //   {x:0,y:100},
    //   {x:100,y:0},
    //   {x:100,y:100},
    // ],
    // FromPoint[1]={x:0,y:MatrixImg.height};
    // FromPoint[2]={x:MatrixImg.width,y:0};
    // FromPoint[3]={x:MatrixImg.width,y:MatrixImg.height};
    //
    // toPoint[1]={x:0,y:MatrixImg.height};
    // toPoint[2]={x:MatrixImg.width,y:0};
    // toPoint[3]={x:MatrixImg.width,y:MatrixImg.height};
    FromPoint[1]={x:0,y:ActiveHeight};
    FromPoint[2]={x:ActiveWidth,y:0};
    FromPoint[3]={x:ActiveWidth,y:ActiveHeight};

    toPoint[1]={x:0,y:ActiveHeight};
    toPoint[2]={x:ActiveWidth,y:0};
    toPoint[3]={x:ActiveWidth,y:ActiveHeight};
    that.setState({
      FromPoint,toPoint,imageResizeStatue
    },function(){
    })

    // that.setState({
    //   ImgTransformvisible:true
    // })
    //获取当前 图片对象
    //创建modal;
  }
  ImageResizeFinish=()=>{
    let that = this;
    let {SelectImgObj,canvasObj,FromPoint,toPoint} = that.state;
    //完成变形添加当前图片到画布
    let MatrixImg = that.refs.MatrixImg;
    let matrixBox = that.refs.matrixBox;
    let ImgElement = document.getElementById(MatrixImg.id);
    let box = document.getElementById(matrixBox.id);
    let styles = ImgElement.style;
    let boxStyle = box.style;
    let width = box.style.width;
    let height = box.style.height;

    let point1 = document.getElementById("point1");
    let point2 = document.getElementById("point2");
    let point3 = document.getElementById("point3");
    let point4 = document.getElementById("point4");

    let point1_x=Number(point1.style.left.slice(0,-2));
    let point1_y=Number(point1.style.top.slice(0,-2));

    let point2_x=Number(point2.style.left.slice(0,-2));
    let point2_y=Number(point2.style.top.slice(0,-2));

    let point3_x=Number(point3.style.left.slice(0,-2));
    let point3_y=Number(point3.style.top.slice(0,-2));

    let point4_x=Number(point4.style.left.slice(0,-2));
    let point4_y=Number(point4.style.top.slice(0,-2));

    let height_1= (point2_y-point3_y)<0?-(point2_y-point3_y):(point2_y-point3_y);
    let height_2= (point2_y-point1_y)<0?-(point2_y-point1_y):(point2_y-point1_y);
    let height_3 = (point4_y-point1_y)<0?-(point4_y-point1_y):(point4_y-point1_y);
    let height_4 = (point4_y-point3_y)<0?-(point4_y-point3_y):(point4_y-point3_y);

    let array = [height_1,height_2,height_3,height_4];
    for(var i=0;i<array.length;i++){
      var temp =array[i];
      for(var j=i+1;j<array.length;j++){
        if(array[j]<array[i]){
          array[i]=array[j];
          array[j]=temp;
        }
      }
    }
    let max_height = array[3];

    let w_1= (point3_x-point1_x)<0?-(point3_x-point1_x):(point3_x-point1_x);
    let w_2= (point3_x-point2_x)<0?-(point3_x-point2_x):(point3_x-point2_x);
    let w_3 = (point4_x-point1_x)<0?-(point4_x-point1_x):(point4_x-point1_x);
    let w_4 = (point4_x-point2_x)<0?-(point4_x-point2_x):(point4_x-point2_x);
    let array_w = [w_1,w_2,w_3,w_4];
    for(var t=1;t<array_w.length;t++){
      var temp_t = array_w[t];
      var g = t;
      if(array_w[g-1]>temp_t){
        while(g>=1&&array_w[g-1]>temp_t){
          array_w[g]=array_w[g-1];
          g--
        }
      }
    }
    let max_w = array_w[3];

    let origin_x_min;
    if(point1_x<=point2_x){
      origin_x_min=point1_x
    }else{
      origin_x_min=point2_x
    }
    let origin_y_min
    if(point1_y<=point3_y){
      origin_y_min=point1_y
    }else{
      origin_y_min=point3_y
    }



      let src = ImgElement.getAttribute("src");
      let styless = MatrixImg.getAttribute("style");
      styless=MatrixImg.style.transform


      let base64 = that.getBase64(MatrixImg,max_w,max_height);
      let svgEle = that.convertSvg(max_w,max_height,base64,styless,Number(width.slice(0,-2)),Number(height.slice(0,-2)),origin_x_min,origin_y_min).then(function(img){
      //添加到 画布
      var imgInstance = new fabric.Image(img, {
        width:img.width,
        height:img.height,
        left: Number(box.style.left.slice(0,-2)),
        top: Number(box.style.top.slice(0,-2)),
        borderColor:'black',
        cornerColor:'black',
        cornerStrokeColor:'black',
        crossOrigin:'anonymous',
        src:img.src
      });
      canvasObj.add(imgInstance);
      canvasObj.setActiveObject(imgInstance);
      canvasObj.renderAll();
      //还原状态
      that.setState({
        SelectImgObj:imgInstance,
        FromPoint:[
          {x:0,y:0},
          {x:0,y:100},
          {x:100,y:0},
          {x:100,y:100},
        ],
        toPoint:[
          {x:0,y:0},
          {x:0,y:100},
          {x:100,y:0},
          {x:100,y:100},
        ],
        imageResizeStatue:false,
      });
      box.style.display="none";
      ImgElement.setAttribute("style","");
      ImgElement.setAttribute("src","");
      document.getElementById("point1").setAttribute("style","");
      document.getElementById("point2").setAttribute("style","");
      document.getElementById("point3").setAttribute("style","");
      document.getElementById("point4").setAttribute("style","");

    });

  }
  convertSvg=(w,h,s,stle,wb,hb,ox,oy)=>{

    var svgNS='http://www.w3.org/2000/svg';
    var xlinkNS='http://www.w3.org/1999/xlink';
    var svg = document.createElementNS(svgNS, 'svg'),
      defs = document.createElementNS(svgNS, 'defs'),
      style = document.createElementNS(svgNS, 'style'),
      g=document.createElementNS(svgNS, 'foreignObject'),
      div=document.createElement("div"),
      img = document.createElement("img");
      // image = document.createElementNS(svgNS, 'image');
      // image.setAttributeNS(xlinkNS, 'href', s);
      // image.setAttribute('width', wb);
      // image.setAttribute('height', hb);
      // image.setAttribute('x', 0);
      // image.setAttribute('y', 0);
      // image.setAttribute('id', "svgimg");
      //image.setAttribute('style','transform:'+stle+';transform-origin:0px 0px 0px;');
      //style.innerHTML = '#svgimg{transform:'+stle+';transform-origin:0px 0px 0px;}';

      g.setAttribute('width', w);
      g.setAttribute('height', h);
      g.setAttribute('x', 0);
      g.setAttribute('y', 0);
      g.setAttribute("viewbox",'0 0 '+w+' '+h+'');
      //g.setAttribute('style','transform:'+stle+';transform-origin:0px 0px 0px;');
      //g.appendChild(image);
      img.setAttribute('crossOrigin', "anonymous");
      img.setAttribute('width', wb);
      img.setAttribute('height', hb);
      img.setAttribute('src', s);
      img.setAttribute('style','transform:'+stle+';transform-origin:0px 0px 0px;margin:0 auto;display:block;position:absolute;left:'+-ox+'px;top:'+-oy+'px; ');
      div.setAttribute('style','width:100%;height:100%;position:releative;')
      div.appendChild(img);
      g.appendChild(div)
      svg.appendChild(g);
      svg.appendChild(defs);
      defs.appendChild(style);
      //svg.appendChild(image);
      svg.setAttribute('id', "FuckSvg");
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);

      //document.getElementById("svg_inner").innerHTML="";
      //document.getElementById("svg_inner").setAttribute("style","width:"+w+"px;height:"+h+"px; ");
      //document.getElementById("svg_inner").appendChild(svg);
      var svgStr = new XMLSerializer().serializeToString(svg);
      //var urls = URL.createObjectURL(new Blob([svgStr], {type:'image/svg+xml'}));
      var urls = URL.createObjectURL(new Blob([svgStr], {type:'image/svg+xml'}));
      urls = 'data:image/svg+xml;utf8,'+encodeURIComponent(svgStr);

      return new Promise(function(res, rej){
        var img = new Image();
        img.onload = function(){
          res(img);
          //document.getElementById("svg_inner").appendChild(img)
        };
        img.width=w;
        img.height=h;
        img.onerror = rej;
        img.src = urls;
        img.crossOrigin='anonymous';
      });
  }
  getBase64=(img,w,h)=>{
    img.crossOrigin="anonymous";
    if(img.src.indexOf('blob') != -1){
      img = new Image();
      img.src=this.state.dataUrlHttp;
    }else{
      this.state.dataUrlHttp = img.src;
    }
    var canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, 500, 500);
    var dataURL;
    dataURL = canvas.toDataURL("image/png");
    return dataURL
  }
  smallDown=(e)=>{
    let that = this;
    let {SelectImgObj,canvasObj,matrix,FromPoint,toPoint} = that.state;
    var obig = document.getElementById("canvasContainer");
    var osmall = document.getElementById(e.target.id);

    let id = e.target.id;
    if(id=="MatrixImg"){
      osmall = document.getElementById("martrixBox");
    }
    var e = e || window.event;
    /*用于保存小的div拖拽前的坐标*/
    osmall.startX = e.clientX - osmall.offsetLeft;
    osmall.startY = e.clientY - osmall.offsetTop;
    /*鼠标的移动事件*/
    document.onmousemove = function(e) {
      var e = e || window.event;
      let pointX = e.clientX - osmall.startX;
      let pointY = e.clientY - osmall.startY
      osmall.style.left = e.clientX - osmall.startX + "px";
      osmall.style.top = e.clientY - osmall.startY + "px";
      /*对于大的DIV四个边界的判断*/

      // if (e.clientX - osmall.startX <= 0) {
      //   osmall.style.left = 0 + "px";
      //   pointX=0
      // }
      // if (e.clientY - osmall.startY <= 0) {
      //   osmall.style.top = 0 + "px";
      //   pointY=0
      // }
      // if (e.clientX - osmall.startX >= obig.style.width.slice(0,-2)) {
      //   osmall.style.left = obig.style.width;
      //   pointX=MatrixImg.width-20;
      //
      // }
      // if (e.clientY - osmall.startY >= obig.style.height.slice(0,-2)) {
      //   osmall.style.top = obig.style.height;
      //   pointY=obig.style.height;
      // }

      //point to transform
      // let toPoint =[
      //   {x:0,y:0},
      //   {x:0,y:100},
      //   {x:100,y:0},
      //   {x:100,y:100},
      // ]
      if(id=="point1"){
        toPoint[0]={x:pointX,y:pointY}
      }
      if(id=="point2"){
        toPoint[1]={x:pointX,y:pointY}
      }
      if(id=="point3"){
        toPoint[2]={x:pointX,y:pointY}
      }
      if(id=="point4"){
        toPoint[3]={x:pointX,y:pointY}
      }
      that.setState({
        toPoint
      },function(){
        that.matrixTransform();
      })

    };
    /*鼠标的抬起事件,终止拖动*/
    document.onmouseup = function() {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  }
  matrixTransform=()=>{
    let that = this;
    let {SelectImgObj,canvasObj,matrix,FromPoint,toPoint} = that.state;
    var fromPts=FromPoint;
    var toPts = toPoint;


    var E = $M([
      [fromPts[0].x, fromPts[0].y, 1, 0, 0, 0, - fromPts[0].x * toPts[0].x, - fromPts[0].y * toPts[0].x],
      [0, 0, 0, fromPts[0].x, fromPts[0].y, 1, - fromPts[0].x * toPts[0].y, - fromPts[0].y * toPts[0].y],
      [fromPts[1].x, fromPts[1].y, 1, 0, 0, 0, - fromPts[1].x * toPts[1].x, - fromPts[1].y * toPts[1].x],
      [0, 0, 0, fromPts[1].x, fromPts[1].y, 1, - fromPts[1].x * toPts[1].y, - fromPts[1].y * toPts[1].y],
      [fromPts[2].x, fromPts[2].y, 1, 0, 0, 0, - fromPts[2].x * toPts[2].x, - fromPts[2].y * toPts[2].x],
      [0, 0, 0, fromPts[2].x, fromPts[2].y, 1, - fromPts[2].x * toPts[2].y, - fromPts[2].y * toPts[2].y],
      [fromPts[3].x, fromPts[3].y, 1, 0, 0, 0, - fromPts[3].x * toPts[3].x, - fromPts[3].y * toPts[3].x],
      [0, 0, 0, fromPts[3].x, fromPts[3].y, 1, - fromPts[3].x * toPts[3].y, - fromPts[3].y * toPts[3].y]

    ]);

    var E_inv = E.inverse();

    var vector = $V([toPts[0].x, toPts[0].y, toPts[1].x, toPts[1].y, toPts[2].x, toPts[2].y, toPts[3].x, toPts[3].y]);

    var r = E_inv.x(vector);

    var transform = $M([
      [r.e(1), r.e(2), 0, r.e(3)],
      [r.e(4), r.e(5), 0, r.e(6)],
      [0, 0, 1, 0],
      [r.e(7), r.e(8), 0, 1]
    ]);

    that.setCssTransform(transform)


  }
  setCssTransform=(m)=>{
    let that = this;
    var matrixCSS;
    var sb = new StringBuffer(),
      counter = 0;

    sb.append('matrix3d(');

    for (var i=1; i<=4; i++) {
      for (var j=1; j<=4; j++) {
        counter++;
        sb.append(StringHelpers.sprintf('%.8g', m.e(j, i)));
        if (i!=4 || j !=4) {
          sb.append(', ');
        }
        if ( counter % 4 == 0 && counter != 16) {
          sb.append('\n');
        }
      }
    }

    sb.append(')');
    matrixCSS=sb.toString();


    document.getElementById("MatrixImg").style.transform=matrixCSS;
  }
  SkewXChange=(v)=>{
    let that = this;
    let {SelectImgObj,canvasObj,SkewOrigin} = that.state;
    if(!SelectImgObj) return;
    SelectImgObj.originX="center"
    SelectImgObj.set('skewX', parseInt(v, 10)).setCoords();
    canvasObj.renderAll();
  }
  SkewYChange=(v)=>{
    let that = this;
    let {SelectImgObj,canvasObj,SkewOrigin} = that.state;
    if(!SelectImgObj) return;

    SelectImgObj.originY="center";
    SelectImgObj.set('skewY', parseInt(v, 20)).setCoords();
    canvasObj.renderAll();
  }
  matrixChange=(v,p)=>{

    let that = this;
    let {SelectImgObj,canvasObj,matrix} = that.state;
    let activeObject = canvasObj.getActiveObject(); //获取当前激活 object

    if(!activeObject) return;
    //let aCoordsObj = activeObject.aCoords;//获取4个坐标点
    //获取绑定矩形框
    if(v=='a'){
      matrix.a=p
    }
    if(v=='b'){
      matrix.b=p
    }
    if(v=='c'){
      matrix.c=p
    }
    if(v=='d'){
      matrix.d=p
    }
    activeObject.transformMatrix=[ matrix.a, matrix.b, matrix.c,matrix.d, 0, 0 ];
    activeObject.setCoords()
    canvasObj.renderAll();
  }
  ImageKTInit=()=>{
    let that = this;
    let {SelectImgObj,canvasObj} = that.state;
    if(!SelectImgObj){
      message.info("请选择一个元素");
      return;
    }

    let width =  SelectImgObj.width;
    let height = SelectImgObj.height;
    var canvas = document.getElementById('canvas_set');
    var context = canvas.getContext('2d');
    canvas.setAttribute('width',width);
    canvas.setAttribute('height',height);
    // 结果canvas
    var canvasResult = document.getElementById('canvas_result');
    var contextResult = canvasResult.getContext('2d');
    canvasResult.setAttribute('width',width);
    canvasResult.setAttribute('height',height);
    // 图片数据
    var imgData = null, imgDataResult = null;
    // 尺寸数据
    var w = width, h = height;
    // canvas上绘制图片
    var img = new Image();
    img.onload = function () {
      context.drawImage(this, 0, 0);
      contextResult.drawImage(this, 0, 0);
      // 获取像素信息数据
      imgData = context.getImageData(0, 0, w, h);
      imgDataResult = contextResult.getImageData(0, 0, w, h);
      that.setState({
        kou_imgData:imgData,
        kou_imgDataResult:imgDataResult
      })
    };
    img.src = SelectImgObj.src;


    // 取色
    var rgbaPicker = '[0,0,0,255]';
    canvas.addEventListener('click', function (event) {
      var rect = this.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;

      rgbaPicker = context.getImageData(x, y, 1, 1).data;
      // color输入框变化
      var strHex = '#';
      for (var i = 0; i < rgbaPicker.length - 1; i++) {
        var hex = rgbaPicker[i].toString(16);
        if (hex.length < 2) {
          hex = '0' + hex;
        }
        strHex += hex;
      }
      //eleColor.value = strHex;
      that.state.eleColor = strHex;
      that.setState({
        eleColor:strHex,
        rgbaPicker:rgbaPicker
      })
    });

  }
  TransformFinish=()=>{
    let that = this;
    // 像素点色值
    var rgba = that.state.rgbaPicker;
    // 容差大小
    var tolerance = that.state.eleTolerance;
    var imgData = that.state.kou_imgData;
    var imgDataResult = that.state.kou_imgDataResult;
    var canvasResult = document.getElementById('canvas_result');
    var contextResult = canvasResult.getContext('2d');
    // 基于原始图片数据处理
    for (var index = 0; index < imgData.data.length; index += 4) {
      var r = imgData.data[index];
      var g = imgData.data[index + 1];
      var b = imgData.data[index + 2];

      if (Math.sqrt(
        (r - rgba[0]) * (r - rgba[0]) +
        (g - rgba[1]) * (g - rgba[1]) +
        (b - rgba[2]) * (b - rgba[2])) <= tolerance
      ) {
        imgDataResult.data[index] = 0;
        imgDataResult.data[index + 1] = 0;
        imgDataResult.data[index + 2] = 0;
        imgDataResult.data[index + 3] = 0;
      } else {
        imgDataResult.data[index] = r;
        imgDataResult.data[index + 1] = g;
        imgDataResult.data[index + 2] = b;
        imgDataResult.data[index + 3] = imgData.data[index + 3];
      }
    }
    // put数据
    contextResult.putImageData(imgDataResult, 0, 0);
  }
  TransformReset=()=>{
    this.ImageKTInit();
  }
  ImgTransformhandleOk=()=>{
    //确定以后重新加载图片
    let that = this;
    let {SelectImgObj,canvasObj} = that.state;
    let leftp=SelectImgObj.left;
    let topp=SelectImgObj.top;
    var canvasResult = document.getElementById('canvas_result');

    var img = new Image();
    img.src=canvasResult.toDataURL("png");
    var imgInstance;
    img.onload=function(){
      imgInstance = new fabric.Image(img, {
        width:img.width,
        height:img.height,
        left: Number(leftp),
        top: Number(topp),
        borderColor:'black',
        cornerColor:'black',
        cornerStrokeColor:'black',
        crossOrigin:'anonymous',
        src:img.src
      });
      canvasObj.add(imgInstance);
      canvasObj.remove(SelectImgObj);
      canvasObj.setActiveObject(imgInstance);
      canvasObj.renderAll();
    }

    this.setState({
      ImgTransformvisible: false,
    });
  }
  ImgTransformhandleCancel=()=>{
    this.setState({
      ImgTransformvisible: false,
    });
  }
  KouTU=()=>{
    let that = this;
    this.setState({
      ImgTransformvisible: true,
    },function(){
      setTimeout(function(){
        that.ImageKTInit();
      },1000)

    });

  }
  translateMatrix=(v,p)=>{
    let that = this;
    let {matrix3d,translationMatrix,scaleMatrix} = that.state;

    if(v=="x"){
      translationMatrix[12]=p;
      scaleMatrix[0]=p
    }
    if(v=="y"){
      translationMatrix[13]=p;
      scaleMatrix[5]=p
    }
    if(v=="z"){
      translationMatrix[14]=p;
      scaleMatrix[10]=p
    }

    that.setState({translationMatrix},function(){
      let finalMatrix = that.multiplyMatrices(identityMatrix,scaleMatrix);
      let matrix3d_string = that.matrixArrayToCssMatrix(finalMatrix);

      that.setState({
        matrix3dStr:matrix3d_string
      })
    });

  }
  matrixArrayToCssMatrix=(array)=>{
    return "matrix3d(" + array.join(',') + ")";
  }
  multiplyMatrixAndPoint=(matrix, point)=>{
    // 给矩阵的每一部分一个简单的变量名, 列数（c）与行数（r）
    var c0r0 = matrix[ 0], c1r0 = matrix[ 1], c2r0 = matrix[ 2], c3r0 = matrix[ 3];
    var c0r1 = matrix[ 4], c1r1 = matrix[ 5], c2r1 = matrix[ 6], c3r1 = matrix[ 7];
    var c0r2 = matrix[ 8], c1r2 = matrix[ 9], c2r2 = matrix[10], c3r2 = matrix[11];
    var c0r3 = matrix[12], c1r3 = matrix[13], c2r3 = matrix[14], c3r3 = matrix[15];

    // 定义点坐标
    var x = point[0];
    var y = point[1];
    var z = point[2];
    var w = point[3];

    // 点坐标和第一列对应相乘, 再求和
    var resultX = (x * c0r0) + (y * c0r1) + (z * c0r2) + (w * c0r3);

    // 点坐标和第二列对应相乘, 再求和
    var resultY = (x * c1r0) + (y * c1r1) + (z * c1r2) + (w * c1r3);

    // 点坐标和第三列对应相乘, 再求和
    var resultZ = (x * c2r0) + (y * c2r1) + (z * c2r2) + (w * c2r3);

    // 点坐标和第四列对应相乘, 再求和
    var resultW = (x * c3r0) + (y * c3r1) + (z * c3r2) + (w * c3r3);

    return [resultX, resultY, resultZ, resultW]
  }
  multiplyMatrices=(matrixA, matrixB)=>{
    let that=this;
    // 将第二个矩阵按列切片
    var column0 = [matrixB[0], matrixB[4], matrixB[8], matrixB[12]];
    var column1 = [matrixB[1], matrixB[5], matrixB[9], matrixB[13]];
    var column2 = [matrixB[2], matrixB[6], matrixB[10], matrixB[14]];
    var column3 = [matrixB[3], matrixB[7], matrixB[11], matrixB[15]];

    // 将每列分别和矩阵相乘
    var result0 = that.multiplyMatrixAndPoint( matrixA, column0 );
    var result1 = that.multiplyMatrixAndPoint( matrixA, column1 );
    var result2 = that.multiplyMatrixAndPoint( matrixA, column2 );
    var result3 = that.multiplyMatrixAndPoint( matrixA, column3 );

    // 把结果重新组合成矩阵
    return [
      result0[0], result1[0], result2[0], result3[0],
      result0[1], result1[1], result2[1], result3[1],
      result0[2], result1[2], result2[2], result3[2],
      result0[3], result1[3], result2[3], result3[3]
    ]
  }
  showProper=(dom)=>{
    let that = this;
    let { buttontabbar,buttontoolbar,cliptoolbar,transformtoolbar } = that.state;

    if(dom=='clip'){
      buttontoolbar=true;
      transformtoolbar=true;
      cliptoolbar=false;
      that.setState({buttontoolbar,cliptoolbar,transformtoolbar});
      return;
    }
    if(dom=='transform'){
      buttontoolbar=true;
      transformtoolbar=false;
      cliptoolbar=true;
      that.setState({buttontoolbar,cliptoolbar,transformtoolbar});
      return;
    }
    if(dom){
      buttontoolbar=false;
      cliptoolbar=true;
      transformtoolbar=true;
      that.setState({buttontoolbar,cliptoolbar,transformtoolbar});
      buttontabbar=dom;
    }else{
      buttontabbar=<span></span>;
    }
    that.setState({buttontabbar})
  }
  savePPT=()=>{
    let that=this;
    let {canvasObj,SaveObj,FangAnName,FangAnDes,KongJianList,TabActivate} = that.state;
    //canvasObj.selection = false;
    canvasObj.backgroundColor='transparent';
    let Objs = canvasObj.getObjects();
    if(Objs){
      Objs.map((item)=>{
        canvasObj.discardActiveObject(item);
      })
    }
    canvasObj.renderAll();
    let jsonObj = canvasObj.toJSON();
    let svg = canvasObj.toSVG();
    let base64Png = canvasObj.toDataURL('png');

    SaveObj.jsonObj = jsonObj;
    SaveObj.svgObj = svg;
    SaveObj.base64Obj = base64Png;

    if(KongJianList){
      if(KongJianList[TabActivate]){
        FangAnName=KongJianList[TabActivate].title;
        FangAnDes=KongJianList[TabActivate].des;
      }
    }


    that.setState({
      SaveCanvasStatus:true,
      SaveObj,
      FangAnName,
      FangAnDes
    })
  }
  SaveCanvas=()=>{
    let that=this;
    let {SaveObj,FangAnName,FangAnDes,KongJianList,TabActivate} = that.state;
    let id="";
    let spaceId = getStorage('spaceId');
        Modal.confirm({
          title:"是否新增",
          content:"是否将当前方案作为新增方案",
          okText:"新增方案",
          cancelText:"修改当前方案",
          onOk() {

            return new Promise((resolve, reject) => {
              api.post('url',{data:{
                  id:id,
                  title:FangAnName,
                  des:FangAnDes,
                  roomTypesId:spaceId,
                  canvasData:JSON.stringify(SaveObj.jsonObj),
                  thumb:SaveObj.base64Obj
                }}).then(function(res){
                message.success(res.data.message);

              }).finally(function(){

                api.get('url').then(function(res){

                  KongJianList = res.data.data;
                  TabActivate="0";
                  that.setState({
                    KongJianList,
                    TabActivate
                  })
                });
                setTimeout(resolve, 0);
              });

            });
          },
          onCancel() {

            return new Promise((resolve, reject) => {
              if(KongJianList){
                if(KongJianList[TabActivate]){
                  id = KongJianList[TabActivate].id;
                  api.post('url',{data:{
                      id:id,
                      title:FangAnName,
                      des:FangAnDes,
                      roomTypesId:spaceId,
                      canvasData:JSON.stringify(SaveObj.jsonObj),
                      thumb:SaveObj.base64Obj
                    }}).then(function(res){
                    message.success(res.data.message);
                  }).then(function(){
                    api.get('url').then(function(res){

                      KongJianList = res.data.data;
                      TabActivate="0";
                      that.setState({
                        KongJianList,
                        TabActivate
                      })
                    });
                    setTimeout(resolve, 0);
                  })
                }
              }
            });
          },
          afterClose:function(){

          }
        });

    that.setState({
      SaveCanvasStatus:false
    })
  }
  SaveCancelCanvas=()=>{
    let that=this;
    that.setState({
      SaveCanvasStatus:false
    })
  }
  colorChange=(item,index,e)=>{
    let that = this;
    let {SelectImgObj,canvasObj} = that.state;

    if(item){
      item.setColor(e.target.value);
      canvasObj.renderAll();
    }
  }
  deleteTabs=()=>{
    let that=this;
    let { TabActivate,KongJianList} = that.state;
    if(KongJianList){
      if(KongJianList[TabActivate]){
        let id = KongJianList[TabActivate].id
        //执行删除
        api.delete('url').then(function(res){
          message.success(res.data.message);
          KongJianList.splice(TabActivate,1);
          TabActivate="0";
          that.setState({KongJianList,TabActivate})
          //重新加载数据
          that.state.canvasObj.loadFromJSON(JSON.parse(KongJianList[0].canvasData));
          that.state.canvasObj.renderAll();
        })
      }else{
        message.info("请选择空间");
      }
    }

  }
  Tabscallback=(v)=>{
    let that = this;

    let { TabActivate,KongJianList,canvasObj} = that.state;
    TabActivate=String(v);
    if(KongJianList){
      if(KongJianList[TabActivate]){
        //加载数据
        if(!canvasObj){
          message.info("画布对象丢失,请刷新")
        }else{
          if(KongJianList[TabActivate].canvasData){
            if(canvasObj.getObjects()){
              let objList = canvasObj.getObjects();
              if(objList.length>0){
                objList.map((item,index)=>{
                  canvasObj.remove(item);
                })
              }
            }
            canvasObj.loadFromJSON(JSON.parse(KongJianList[TabActivate].canvasData));
            canvasObj.renderAll();
          }else{
            message.info("服务器 暂无数据 加载");
          }

        }

      }
    }
    that.setState({
      TabActivate,
      canvasHistoryArr:[],
      canvasHistoryArrNum:-1,
    })
  }
  canvasBackAction=(type)=>{
    let that=this;
    let {canvasHistoryArr,canvasHistoryArrNum,canvasObj} = that.state;

    if(canvasHistoryArrNum==-1){
      return;
    }
    if(!canvasHistoryArr[canvasHistoryArrNum]){
      return;
    }
    if(type=='back'){
      canvasHistoryArrNum =canvasHistoryArrNum-1;
      if(canvasHistoryArrNum<=0){
        canvasHistoryArrNum=0
      }
    }else{
      canvasHistoryArrNum =canvasHistoryArrNum+1;
      if(canvasHistoryArrNum>=canvasHistoryArr.length){
        canvasHistoryArrNum=canvasHistoryArr.length-1
      }
    }

    if(canvasHistoryArr[canvasHistoryArrNum]){
      canvasObj.loadFromJSON(canvasHistoryArr[canvasHistoryArrNum],function(){
        canvasObj.renderAll();
      })
    }
    that.setState({canvasHistoryArrNum});
  }
  render(){
    let that = this;
    let {scaleNum,
      imgListVisible,
      marks,SingalObj,
      ClipImgObj,
      ClipImgObjStatus,
      matrix,
      matrix3dStr,
      SaveCanvasStatus,
      SaveObj,
      AiLayer,
      SuCaiList,
      KongJianList,
      FangAnName,
      FangAnDes,
      TabActivate,
      imageResizeStatue,
      buttontabbar,
    } = that.state;
    let CanvasStyle = {
      position:"relative",
      width: '1366px',
      height:'768px',
      maxWidth:"1600px",
      maxHeight:"900px",
      display:"block",
      left:"50%",
      margin:"0px auto 0px -676px",
      transform: "scale("+scaleNum/100+")",
      boxShadow:"0px 5px 20px rgba(0,0,0,0.5)"
    };
    let imgStyle={
      transformOrigin:"0px 0px 0px",
      width:"100%",
      height:"auto",
      display:"block",
      margin:"0 auto",
    }
    const ButtonStyle={
      display:"inline-block",
      margin:"5px 5px",
    }
    let LayOutcontent=(<div>
      <Button size={'small'} onClick={that.layerUpDown.bind(that,'up')} style={ButtonStyle}>上一层</Button>
      <Button size={'small'} onClick={that.layerUpDown.bind(that,'down')} style={ButtonStyle}>下一层</Button>
      <Button size={'small'} onClick={that.layerUpDown.bind(that,'top')} style={ButtonStyle}>置顶</Button>
      <Button size={'small'} onClick={that.layerUpDown.bind(that,'bottom')} style={ButtonStyle}>置底</Button>
    </div>)
    let FanZhuancontent=(
      <div>
        <Button size={'small'} onClick={that.ImageFlip.bind(that,'x')} style={ButtonStyle}>水平翻转</Button>
        <Button size={'small'} onClick={that.ImageFlip.bind(that,'y')} style={ButtonStyle}>垂直翻转</Button>
      </div>
    )
    let Copycontent=(
      <div>
        <Button size={'small'} onClick={that.ImageCopy.bind(that,'copy')} style={ButtonStyle}>复制</Button>
        <Button size={'small'} onClick={that.ImageCopy.bind(that,'paste')} style={ButtonStyle}>粘贴</Button>
      </div>
    )
    let Clipcontent=(
      <div>
        {
          !ClipImgObjStatus?
            <Button  size={'small'} onClick={that.ClipImage} style={ButtonStyle}>剪裁图片</Button>
            :""

        }
        {
          ClipImgObjStatus?
            <p>
              <Button size={'small'} onClick={that.confirmClip.bind(that,'finish')} style={ButtonStyle}>完成剪裁</Button>
              <Button size={'small'} onClick={that.confirmClip.bind(that,'cancel')} style={ButtonStyle}>取消剪裁</Button>
            </p>
            :""
        }
      </div>
    )

    let Transformcontent=(<div>
      {
        imageResizeStatue?
          <Button size={'small'} onClick={that.ImageResizeFinish} style={ButtonStyle}>完成变形</Button>
          : <Button size={'small'} onClick={that.ImageResize} style={ButtonStyle}>点击变形</Button>
      }


    </div>)
    let Skewcontent=(<div style={{width:300}}>
      <p>
        <span>倾斜 X轴：</span>
        <Slider
          size="small"
          min={0}
          max={360}
          tipFormatter={value => `${value}deg`}
          parser={value => value.replace('deg', '')}
          onChange={that.SkewXChange}
          step={1}
          style={{width:"100%"}}
          marks={marks}
        />
      </p>
      <p>
        <span>倾斜 Y轴：</span>
        <Slider
          size="small"
          min={0}
          max={360}
          tipFormatter={value => `${value}deg`}
          parser={value => value.replace('deg', '')}
          onChange={that.SkewYChange}
          step={1}
          style={{width:"100%"}}
          marks={marks}
        />
      </p>
      <p>
        <span>旋转：</span>
        <Slider
          size="small"
          min={0}
          max={360}
          tipFormatter={value => `${value}deg`}
          parser={value => value.replace('deg', '')}
          onChange={that.rotateChange}
          step={1}
          style={{width:"100%"}}
        />
      </p>
    </div>)
    let Scalecontent=(<div>
      <InputNumber
        defaultValue={scaleNum}
        size={"small"}
        min={0}
        max={100}
        formatter={value => `${value}%`}
        parser={value => value.replace('%', '')}
        onChange={that.ScaleChange}
        step={10}
      />
    </div>)

    let colorSetDom=null;
    if(AiLayer){
      colorSetDom = AiLayer.map((item,index)=>
        <Input type={"color"} defaultValue={item.fill} onChange={(e)=>{that.colorChange(item,index,e)}} style={{width:"60px"}} />
      )
    }
    let tabBaroperations=<a onClick={that.deleteTabs} size={"small"} >删除方案</a>;
    return(
      <div>
        <Layout style={{background: '#ffffff'}}>
          <Content>
            <Row  type="flex" gutter={24} align="middle">
              <Card  style={{ width: "100%",height:"100%",overflow:"auto",position:"releative" }}>
                <Affix offsetTop={100} className={styles.affixIndex} style={{zIndex:6 }}>
                  <div style={{display:"flex",width:"100%"}}>
                    <ButtonGroup style={{display:"block",margin:"0 auto",width:"auto"}}>
                      <Tooltip placement="top" title={"素材列表"}>
                        <Button size={"large"} icon={"menu-fold"} onClick={that.showImgList}></Button>
                      </Tooltip>
                      <Tooltip placement="top" title={"画布缩放操作"}>
                        <Button size={"large"} icon={"arrows-alt"} onClick={that.showProper.bind(that,Scalecontent)}></Button>
                      </Tooltip>
                      <Tooltip placement="top" title={"图层操作"}>
                        <Button size={"large"} icon={"diff"} onClick={that.showProper.bind(that,LayOutcontent)}></Button>
                      </Tooltip>
                      <Tooltip placement="top" title={"翻转操作"}>
                        <Button size={"large"} icon={"redo"} onClick={that.showProper.bind(that,FanZhuancontent)}></Button>
                      </Tooltip>
                      <Tooltip placement="top" title={"复制操作"}>
                        <Button size={"large"} icon={"copy"} onClick={that.showProper.bind(that,Copycontent)}></Button>
                      </Tooltip>
                      <Tooltip placement="top" title={"剪裁操作"}>
                        <Button size={"large"} icon={"scissor"} onClick={that.showProper.bind(that,'clip')}></Button>
                      </Tooltip>
                      <Tooltip placement="top" title={"变形操作"}>
                        <Button size={"large"} icon={"flag"} onClick={that.showProper.bind(that,'transform')}></Button>
                      </Tooltip>
                      <Tooltip placement="top" title={"倾斜操作"}>
                        <Button size={"large"} icon={"rise"} onClick={that.showProper.bind(that,Skewcontent)}></Button>
                      </Tooltip>
                      <Tooltip placement="top" title={"锁定操作"}>
                        <Button size={"large"} icon={"lock"} onClick={that.Imagelock.bind(that,'lock')} ></Button>
                      </Tooltip>
                      <Tooltip placement="top" title={"解锁操作"}>
                        <Button size={"large"} icon={"unlock"} onClick={that.Imagelock.bind(that,'unlock')} ></Button>
                      </Tooltip>
                      <Tooltip placement="top" title={"抠图操作"}>
                        <Button size={"large"} icon={"camera"} onClick={that.KouTU.bind(that,'unlock')} ></Button>
                      </Tooltip>
                      <Tooltip placement="top" title={"删除操作"}>
                        <Button size={"large"} icon={"delete"} onClick={that.layerDelete.bind(that,'delete')} ></Button>
                      </Tooltip>
                      <Tooltip placement="top" title={"清空操作"}>
                        <Button size={"large"} icon={"fire"} onClick={that.layerDeleteAll.bind(that,'delete')} ></Button>
                      </Tooltip>
                      <Tooltip placement="top" title={"撤销操作"}>
                        <Button size={"large"} icon={"swap-left"} onClick={that.canvasBackAction.bind(that,'back')} ></Button>
                      </Tooltip>
                      <Tooltip placement="top" title={"重做操作"}>
                        <Button size={"large"} icon={"swap-right"} onClick={that.canvasBackAction.bind(that,'front')} ></Button>
                      </Tooltip>
                      <Tooltip placement="top" title={"保存操作"}>
                        <Button size={"large"} icon={"hdd"} onClick={that.savePPT} ></Button>
                      </Tooltip>
                      {
                        !that.state.buttontoolbar?
                          <div className={"buttontoolbar"} style={{marginTop:"5px",width:"100%",background:"rgba(255,255,255,0.5)",padding:"5px"}}>
                            {buttontabbar?buttontabbar:""}
                          </div>
                          :""
                      }
                      {
                        !that.state.cliptoolbar?
                          <div className={"cliptoolbar"} style={{marginTop:"5px",width:"100%",background:"rgba(255,255,255,0.5)",padding:"5px"}}>
                            {Clipcontent}
                          </div>
                          :""
                      }
                      {
                        !that.state.transformtoolbar?
                          <div className={"transformtoolbar"} style={{marginTop:"5px",width:"100%",background:"rgba(255,255,255,0.5)",padding:"5px"}}>
                            {Transformcontent}
                          </div>
                          :""
                      }

                      <div className={"svgToolBar"} style={{marginTop:"10px"}}>
                          {
                            colorSetDom?colorSetDom:""
                          }
                      </div>
                    </ButtonGroup>
                  </div>
                </Affix>

                <div id={"canvasContainer"} className={"canvasContainer"} style={CanvasStyle} >
                  <canvas ref={"myCanvas"} style={{width:"100%",height:"100%"}}  id="myCanvas" />
                  <div id={"martrixBox"} ref={"matrixBox"} className={"martrixBox "+styles.martrixBox} onMouseDown={that.smallDown}>
                    <span className={"pointDrag "+styles.point} ref={"point1"}  id={"point1"} onMouseDown={that.smallDown}></span>
                    <span className={"pointDrag "+styles.point} ref={"point2"} id={"point2"}  onMouseDown={that.smallDown}></span>
                    <span className={"pointDrag "+styles.point} ref={"point3"} id={"point3"}  onMouseDown={that.smallDown}></span>
                    <span className={"pointDrag "+styles.point} ref={"point4"} id={"point4"}  onMouseDown={that.smallDown}></span>
                    <img crossOrigin={"Anonymous"} ref={"MatrixImg"} id={"MatrixImg"} className={styles.thumbImg} src={"https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"} style={imgStyle} />
                  </div>
                  <div id={"svg_inner"}></div>
                </div>

                <Drawer
                  width={350}
                  title="素材列表"
                  placement={"right"}
                  closable={true}
                  onClose={this.imageListCallBack}
                  visible={this.state.imgListVisible}
                  mask={false}
                  style={{position:"absolute",right:"0px"}}
                >
                  <div>
                    <ImageListForm imageDataHandle={that.initDocumentMouseHandle}  isShow={true} isShowFun={that.imageListCallBack} />
                  </div>
                </Drawer>

                  <div style={{position:"absolute",width:"300px",height:"400px",left:"30px",top:"100px",zIndex:7,background:"white"}}>
                    {
                      KongJianList?
                        <Tabs activeKey={TabActivate} onChange={that.Tabscallback} tabBarExtraContent={tabBaroperations}>
                          {
                            KongJianList.length>0?
                              KongJianList.map((item,index)=>{
                                return <TabPane tab={item.title} key={String(index)}><p>方案描述：{item.des} <a style={{display:"block"}} download target="_blank" href={item.thumb}>下载方案图片</a></p><p><img style={{width:"100%",display:"block"}} src={item.thumb} /></p><p></p></TabPane>
                              })
                              :<TabPane tab="方案" key="0">暂无</TabPane>
                          }
                        </Tabs>
                        :""
                    }

                  </div>
              </Card>

              <Modal
                width={600}
                title="保存方案"
                visible={SaveCanvasStatus}
                onOk={this.SaveCanvas}
                onCancel={this.SaveCancelCanvas}
              >
                <Row gutter={12} type="flex" justify="space-around" align="middle">
                  <Col span={12}>
                    <Col span={8}>方案名称:</Col>
                    <Col span={16}>
                      <Input type={"text"} value={FangAnName} onChange={(e)=>{FangAnName=e.target.value;that.setState({FangAnName})  }} placeholder={"填写方案名称"} />
                    </Col>
                  </Col>
                  <Col span={12}>
                    <Col span={8}>方案描述:</Col>
                    <Col span={16}>
                      <Input type={"text"} value={FangAnDes} onChange={(e)=>{FangAnDes=e.target.value;that.setState({FangAnDes})  }} placeholder={"填写方案描述"} />
                    </Col>
                  </Col>
                  <Col>
                    <img style={{width:"100%",height:"auto"}} src={SaveObj.base64Obj}  />
                  </Col>
                </Row>
              </Modal>

              <Modal
                width={1366}
                title="图片抠图"
                visible={this.state.ImgTransformvisible}
                onOk={this.ImgTransformhandleOk}
                onCancel={this.ImgTransformhandleCancel}
              >
                <Row gutter={24} type="flex" justify="space-around" align="middle">
                  <Col span={12}>
                    <p>原图：</p>
                    <canvas className={styles.canvasHover} style={{background:"#dcdcdc"}} id={"canvas_set"}></canvas>
                  </Col>
                  <Col span={12}>
                    <p>结果图：</p>
                    <canvas style={{background:"#dcdcdc"}} id={"canvas_result"}></canvas>
                  </Col>
                  <Col span={24}>
                    <p>取色色值：<Input style={{width:"150px"}} value={that.state.eleColor} type="color" /></p>
                    <p>容差范围：<InputNumber value={that.state.eleTolerance } onChange={(v)=>{ that.setState({eleTolerance:v })}}  min="0" max="255" step="1" /></p>
                    <p>
                      <Button onClick={that.TransformFinish} type={"primary"} >执行去色</Button>
                      <Button style={{marginLeft:"10px"}} onClick={that.TransformReset} type={"primary"} >重置</Button>
                    </p>
                  </Col>
                </Row>
              </Modal>
            </Row>
          </Content>
        </Layout>
      </div>
    )
  }

}
export default iiHOC(CanvasMain);
