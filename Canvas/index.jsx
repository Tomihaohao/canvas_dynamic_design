import React from 'react'
import { Route, Switch, withRouter } from 'react-router-dom';
/**
 * 流程关注
 * */
import MainCanvas from './mainview/mainCanvasFabric'
class FlowWatch extends React.Component{
  state = {}
  constructor() {
    super()
  }
  componentDidMount(){
    console.log("router-------->")
  }
  render() {
    return (
      <div>
        <Switch>
          <Route path={this.props.match.url}  component={MainCanvas}/>
        </Switch>
      </div>
    )
  }
}
export default withRouter(FlowWatch);
