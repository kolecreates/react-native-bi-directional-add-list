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
  /**
  * This component does not use a state. Only several values are
  * stored in the component instance to track information across
  * functions and renders.
  */
  constructor(props){
    super(props);
    this.contentOffset = 0;
    this.newItemContentOffset = 0;
    this.onScroll = this.onScroll.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.onLastItemLayout = this.onLastItemLayout.bind(this);
    this.onNewItemLayout = this.onNewItemLayout.bind(this);
  }
  onScroll(event){
    this.contentOffset =  event.nativeEvent.contentOffset.y;
    this.props.onScroll && this.props.onScroll(event);
  }
  scrollToIndex(...args){
    this.list && this.list.scrollToIndex(...args);
  }
  /**
  * When the data prop changes this component determines how
  * many new items were added to the beginning of the array.
  *
  * This logic will only work if the data array is treaded
  * as immutable. In other words, it will not work if new items
  * are added to the same instance of the array. Use the getNumberAddedToFront
  * prop if your array is treated as mutable.
  */
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
      this.numberHiddenOnTop = this.numberAddedToFront;
    }
  }
  /**
  * Called when the bottom item is rendered. The height of the bottom item
  * is needed to determine if the bottom item is in-frame.
  */
  onLastItemLayout(event){
    this.lastItemHeight = event.nativeEvent.layout.height;
  }
  /**
  * Measures the height of new items on the top when they are first rendered.
  * This function then sets up the scroll position adjustment once all new items are measured.
  *
  * Notice how the position adjustment logic is different when the bottom item is viewable.
  * This is because scroll/render behavior is subtley different when scrolled near the bottom.
  * Without careful attention here, the position will not be updated properly, resulting in
  * unwanted visual jumps or flickering.
  */
  onNewItemLayout(event){
    let height = event.nativeEvent.layout.height;
    this.newItemContentOffset += height;
    this.numberAddedToFront--;
    if(this.numberAddedToFront <= 0 && this.list){
      let offset = this.contentOffset + this.newItemContentOffset;
      this.numberAddedToFront = 0;
      this.newItemContentOffset = 0;
      this.contentOffset = offset;
      let lastItemInView = this.contentOffset + this.frameHeight >= this.contentHeight - 5;
      if(lastItemInView){
        this.forceUpdate();
        setTimeout(()=> this.list.scrollToOffset({animated: false, offset: offset }));
        this.numberHiddenOnTop = 0;
        return;
      }
      /*
        Set up an adjustment function to be called upon render
      */
      this.adjustPosition = ()=> {
        this.adjustPosition = null;
        this.numberHiddenOnTop = 0;
        this.list.scrollToOffset({animated: false, offset: offset });
      }
      this.forceUpdate();
    }
  }
  /**
  * Adjust the scroll position before the new items are rendered on top.
  */
  componentWillUpdate(){
    this.adjustPosition != null && this.adjustPosition();
  }
  /**
  * Perform neccesary wrapping to measure the size of the last list item
  * or hide new items added to the top until their size is measured and can
  * be considered in the scroll offset.
  */
  renderItem(args){
    if(args.index == this.props.data.length -1 && this.props.data.length > 1){
      return (
        <View onLayout={this.onLastItemLayout}>
          {this.props.renderItem(args)}
        </View>
      );
    }else if(args.index < this.numberAddedToFront && this.numberAddedToFront > 0){
      return (
        <View style={{position: 'absolute', opacity: 0}} onLayout={this.onNewItemLayout}>
          {this.props.renderItem(args)}
        </View>
      );
    }else{
      return this.props.renderItem(args);
    }
  }
  render(){
    return (
      <FlatList {...this.props}
        ref={(ref)=> this.list = ref}
        onLayout={(event)=> this.frameHeight = event.nativeEvent.layout.height}
        onContentSizeChange={(w,h)=> this.contentHeight = h}
        renderItem={this.renderItem}
        onScroll={this.onScroll} />
    );
  }
}
