/**
* This component allows the adding of dynamically sized content
* to the top of a FlatList without causing any visual jumps that
* interrupt the user's browsing experience.
* @author Kole Nunley
* @date November 9, 2018
*/
import React, {PureComponent} from 'react';
import {View, FlatList} from 'react-native';


export default class BiDirectionalAddList extends PureComponent {
  constructor(props){
    super(props);
    this.contentOffset = 0;
    this.newItemContentOffset = 0;
    this.onScroll = this.onScroll.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.onNewItemLayout = this.onNewItemLayout.bind(this);
  }
  componentWillReceiveProps(nextProps){
    if(this.props.data.length < nextProps.data.length && this.props.data.length > 0 && this.contentOffset > this.props.minScrollPositionToMaintain){
      let diff = nextProps.data.length - this.props.data.length;
      let numberAddedToFront = 0;
      for(let i = 0; i < diff; i++){
        let item1 = this.props.data[i-numberAddedToFront];
        let item2 = nextProps.data[i];
        if(this.props.keyExtractor(item1, i) != this.props.keyExtractor(item2, i)){
          numberAddedToFront++;
        }else{
          break;
        }
      }
      this.numberAddedToFront = numberAddedToFront;
    }
  }
  onNewItemLayout(event){
    let height = event.nativeEvent.layout.height;
    this.newItemContentOffset += height;
    this.numberAddedToFront--;
    if(this.numberAddedToFront <= 0 && this.list){
      let offset = this.contentOffset + this.newItemContentOffset;
      this.numberAddedToFront = 0;
      this.newItemContentOffset = 0;
      let adjustPosition = ()=> { this.list.scrollToOffset({animated: false, offset: offset }); adjustPosition = null; };
      try {
        this.forceUpdate(adjustPosition);
        setTimeout(adjustPosition);
      }catch(e){
        console.log(e);
      }

    }
  }
  renderItem(args){
    if(args.index < this.numberAddedToFront && this.numberAddedToFront > 0){
      return (
        <View style={{position: 'absolute', opacity: 0}} onLayout={this.onNewItemLayout}>
          {this.props.renderItem(args)}
        </View>
      );
    }else{
      return this.props.renderItem(args);
    }
  }
  onScroll(event){
    this.contentOffset =  event.nativeEvent.contentOffset.y;
    this.props.onScroll && this.props.onScroll(event);
  }
  scrollToIndex(...args){
    this.list && this.list.scrollToIndex(...args);
  }
  render(){
    return (
      <FlatList {...this.props} ref={(ref)=> this.list = ref} onContentSizeChange={()=> 1 /* slow render */ } renderItem={this.renderItem} onScroll={this.onScroll} />
    );
  }
}
