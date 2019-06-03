import React from 'react'
import  { Row,
  Col, Table,
  Alert, Icon,
  Card, Button,
  Tag, Rate,
  Tabs, Select,
  Modal,Input,
  message,Form,
  InputNumber,Switch,
  DatePicker,List,Carousel} from 'antd';
import {api, testApi, cassApi, APIS, Service2} from '@/bid/api';
import {getStorage} from '@/utils'
const { Meta } = Card;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
import CSSModules from 'react-css-modules';
import styles from '../index.less';
@CSSModules(styles, {allowMultiple: true})
class ImageList extends React.Component {
  constructor (props) {
    super(props)
    this.state={
      visible:false,
      isRun:false,
      imageData:[

      ],
      imageNum:0,
      imageArr:[]
    }

  }

  componentWillMount () {

  }

  componentDidMount () {
    let that = this;
    that.onSearchs("");
  }


  handleOk = (e) => {
    this.props.isShowFun(false);
  }
  handleCancel = (e) => {
    this.props.isShowFun(false);
  }
  InitModal=()=>{
    let that = this;
    let { isRun} = that.state;
    if(!isRun){
      isRun=true;
      that.setState({isRun})
    }
  }
  onSearchs=(v)=>{
    let that = this;
    let {imageData,imageArr} = that.state;
    let budgetId = getStorage('budgetId');
    let spaceId = getStorage('spaceId');
    api.get('/bidCommon/bizopBudgetHeader/finishedMaterList/'+budgetId+"/"+spaceId+"/"+"2?skuDesc="+v).then(function(res){

      if(res.data.data){
        if(res.data.data[0]){
          imageData=res.data.data[0].materList;
          for(let i=0;i<imageData.length;i++){
            imageArr.push(0);
          }
        }else{
          imageData=[];
        }
      }else{
        imageData=[];
      }

      that.setState({
        imageData
      },function(){
        that.props.imageDataHandle
      })
    })
  }
  imageSlide=(data,index)=>{
    let {imageNum,imageArr} = this.state;
    let that = this;
    let indexs=imageArr[index];

    let dom=<div>
      <img  className={"dragElement"}  src={data[indexs]} style={{
        width:"100%",
        height:"200px",
        marginBottom:"10px",
        objectFit: "contain",
        objectPosition:"center"
        }} />

      <Button style={{marginRight:"5px"}} onClick={()=>{if(indexs<=0) return;indexs=indexs-1;imageArr[index]=indexs;that.setState({imageArr}) }} size={"small"}>上一张</Button>
      <Button style={{marginRight:"5px"}} onClick={()=>{if(indexs>data.length) return;indexs=indexs+1;imageArr[index]=indexs;that.setState({imageArr}) }} size={"small"}>下一张</Button>
    </div>
    return dom
  }
  render () {
    let that = this;
    let visibleStatus=""
    if(this.props.isShow){
      that.InitModal()
      visibleStatus=true;
    }else{
      that.state.isRun=false;
      visibleStatus=false;
    }
    let {imageData,imageNum}=that.state;
    //imageData = that.props.SuCaiList;

    return (
      <div

      >
        <Row type="flex" gutter={24} align="middle" style={{width:"100%",padding:"10px",margin:"0px"}}>

          <Tabs defaultActiveKey="1" >
            <TabPane tab="素材" key="1">
              <div>
                <Search
                  placeholder="素材名称"
                  onSearch={ that.onSearchs }
                  enterButton
                  style={{marginBottom:"20px"}}
                />
                <List
                  grid={{gutter: 16, column: 2}}
                  dataSource={imageData?imageData:[]}
                  renderItem={(item,index) => (
                    <List.Item>
                      <div className={styles.listCard}>
                        {
                          item.skuMaxImages?
                            that.imageSlide(item.skuMaxImages,index)
                            :

                              <img style={{
                                width:"100%",
                                height:"200px",
                                objectFit: "contain",
                                objectPosition:"center"
                                }} className={"dragElement"} src={item.skuMaxImage} />

                        }
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            </TabPane>
            <TabPane tab="矢量" key="2">
              <div>
                <img name={"svgimage"} className={"dragElement"} style={{display:"inline-block",width:"250px",height:"250px",margin:"10px"}} src={"./static/svg/soft_1.svg"} />
                <img name={"svgimage"} className={"dragElement"} style={{display:"inline-block",width:"250px",height:"250px",margin:"10px"}} src={"./static/svg/soft_2.svg"} />
                <img name={"svgimage"} className={"dragElement"} style={{display:"inline-block",width:"250px",height:"250px",margin:"10px"}} src={"./static/svg/soft_3.svg"} />
                <img name={"svgimage"} className={"dragElement"} style={{display:"inline-block",width:"250px",height:"250px",margin:"10px"}} src={"./static/svg/soft_4.svg"} />
                <img name={"svgimage"} className={"dragElement"} style={{display:"inline-block",width:"250px",height:"250px",margin:"10px"}} src={"./static/svg/soft_5.svg"} />
                <img name={"svgimage"} className={"dragElement"} style={{display:"inline-block",width:"250px",height:"250px",margin:"10px"}} src={"./static/svg/soft_6.svg"} />
                <img name={"svgimage"} className={"dragElement"} style={{display:"inline-block",width:"250px",height:"250px",margin:"10px"}} src={"./static/svg/soft_7.svg"} />
                <img name={"svgimage"} className={"dragElement"} style={{display:"inline-block",width:"250px",height:"250px",margin:"10px"}} src={"./static/svg/soft_8.svg"} />
                <img name={"svgimage"} className={"dragElement"} style={{display:"inline-block",width:"250px",height:"250px",margin:"10px"}} src={"./static/svg/soft_9.svg"} />
                <img name={"svgimage"} className={"dragElement"} style={{display:"inline-block",width:"250px",height:"250px",margin:"10px"}} src={"./static/svg/soft_10.svg"} />
              </div>
            </TabPane>
          </Tabs>



        </Row>
      </div>
    )
  }
}

export default ImageList;

