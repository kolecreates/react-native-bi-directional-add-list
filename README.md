
<img alt="Component Demo" src="https://kolenunley.com/portfolio/img/RNBidirectionalAddFlatList.gif" width="200">

# Get Started
### NPM package coming soon! :)
- `git clone` or download this project.
- Copy BiDirectionalAddList component from lib folder to your project.
- `import BiDirectionalAddList from 'path/to/component';`
- Inside your container component's render function:
  ```javascript
   <BiDirectionalAddList
          keyExtractor={(item, index)=> item.key}
          data={this.state.items}
          renderItem={(data)=> <CustomListItem data={data}/>}
          minScrollPositionToMaintain={0}
          getNumberAddedToTop={this.getNumberAddedToTop}/>
   ```
   
#### Props
  
Name | Type | Default | Description
------------ | ------------ | ------------ | -------------
minScrollPositionToMaintain | number | 0 | Controls how far down the user must be scrolled before scroll position is maintained when new items are added to the top. Generally you only need to set this when using the list header component. In that case, you would set this prop equal to the height of the header.
getNumberAddedToTop | function | null | A function that returns the number of new items added to the beginning of the data array. It is called just before re-render whenever data changes. This is only to be used if the data array is not immutable (i.e. new items are added to the data array without creating a new array instance).

# Known Issues
- Can break with short & very performant lists.
- Can break when items are added rapidly. 
