/**
* This component allows the adding of dynamically sized content
* to the top of a FlatList without causing any visual jumps that
* interrupt the user's browsing experience.
* @author Kole Nunley
* @date November 9, 2018
*/
import React, {PureComponent} from 'react';
import {View, FlatList} from 'react-native';
import PropTypes from 'prop-types';
class BiDirectionalAddList extends PureComponent {
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
    this.onFlatListRef = this.onFlatListRef.bind(this);
    this.onContentSizeChange = this.onContentSizeChange.bind(this);
    this.onLayout = this.onLayout.bind(this);
  }
  /**
  * Consume frame height for last-item visibility calculation. Passes
  * the event along to prop function.
  */
  onLayout(event){
    this.frameHeight = event.nativeEvent.layout.height;
    this.props.onLayout && this.props.onLayout(event);
  }
  /**
  * Consume content height for last-item visibility calculation. Passes
  * width and height along to prop function.
  */
  onContentSizeChange(w,h){
    this.contentHeight = h;
    this.props.onContentSizeChange && this.props.onContentSizeChange(w,h);
  }
  /**
  * Consume scroll events and then pass events along to prop function.
  */
  onScroll(event){
    this.contentOffset =  event.nativeEvent.contentOffset.y;
    this.props.onScroll && this.props.onScroll(event);
  }
  /**
  * Assign FlatList reference to local variable and then pass the reference
  * along to prop ref function if one exists. This way, parents of this component
  * may still access internal FlatList reference.
  */
  onFlatListRef(ref){
    this.list = ref;
    this.props.ref != null && this.props.ref(ref);
  }
  /**
  * When the data prop changes this component determines how
  * many new items were added to the beginning of the array.
  *
  * This logic will only work if the data array is treaded
  * as immutable. In other words, it will not work if new items
  * are added to the same instance of the array. Use the getNumberAddedToTop
  * prop if your array is treated as mutable.
  */
  componentWillReceiveProps(nextProps){
    if(typeof this.props.getNumberAddedToTop == 'function'){
      this.numberAddedToTop = this.props.getNumberAddedToTop();
    }else if(this.props.data.length < nextProps.data.length && this.props.data.length > 0 && this.contentOffset > this.props.minScrollPositionToMaintain){
      let diff = nextProps.data.length - this.props.data.length;
      let numberAddedToTop = 0;
      for(let i = 0; i < diff; i++){
        let item1 = this.props.data[i-numberAddedToTop];
        let item2 = nextProps.data[i];
        if(this.props.keyExtractor(item1, i) != this.props.keyExtractor(item2, i)){
          numberAddedToTop++;
        }else{
          break;
        }
      }
      this.numberAddedToTop = numberAddedToTop;
    }

    this.numberHiddenOnTop = this.numberAddedToTop;
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
    this.numberAddedToTop--;
    if(this.numberAddedToTop <= 0 && this.list){
      let offset = this.contentOffset + this.newItemContentOffset;
      this.numberAddedToTop = 0;
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
    }else if(args.index < this.numberAddedToTop && this.numberAddedToTop > 0){
      return (
        <View style={{position: 'absolute', opacity: 0}} onLayout={this.onNewItemLayout}>
          {this.props.renderItem(args)}
        </View>
      );
    }else{
      return this.props.renderItem(args);
    }
  }
  /**
  * onScroll, renderItem, onLayout, and onContentSizeChange are extended.
  * All other FlatList props are passed in from the parent.
  */
  render(){
    return (
      <FlatList {...this.props}
        ref={this.onFlatListRef}
        onLayout={this.onLayout}
        onContentSizeChange={this.onContentSizeChange}
        renderItem={this.renderItem}
        onScroll={this.onScroll} />
    );
  }
}

BiDirectionalAddList.propTypes = {
  /**
  * Controls how far down the user must be scrolled before
  * scroll position is maintained when new items are added to the top.
  * Generally you only need to set this when using the list header component.
  * In that case, you would set this prop equal to the height of the header.
  */
  minScrollPositionToMaintain: PropTypes.number,
  /**
  * A function that returns the number of new items added to the beginning
  * of the data array and is called before rerender and after data is changed.
  * This is only to be used if the data array is not immutable (i.e. new items
  * are added to the data array without creating a new array instance).
  */
  getNumberAddedToTop: PropTypes.func,
}
BiDirectionalAddList.defaultProps = {
  minScrollPositionToMaintain: 0
}

export default BiDirectionalAddList;
