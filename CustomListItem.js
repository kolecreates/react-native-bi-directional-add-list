import React, {PureComponent} from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default class CustomListItem extends PureComponent {
  constructor(props){
    super(props);
  }

  render(){
    let { index, item } = this.props.data;

    return (
      <View style={[styles.container, {height: item.height}]}>
        <View style={[styles.badge, {backgroundColor: item.color}]}>
          <Text style={styles.badgeText}>{index}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.infoText}>{item.height || 0}</Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    width: '20%',
    height: '100%',
    backgroundColor: '#555',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    opacity: .81,
  },
  badgeText: {
    fontSize: 18,
    color: '#FFF',
  },
  info: {
    width: '80%',
    height: '100%',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    justifyContent: 'flex-start',
    backgroundColor: '#F1F1F1',
  },
  infoText: {
    fontSize: 20,
    color: '#000',
    opacity: .81
  }

});
