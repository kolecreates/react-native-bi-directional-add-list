import React, {PureComponent} from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default class CustomListItem extends PureComponent {
  constructor(props){
    super(props);
    this.badgeColor = BADGE_COLORS[Math.floor(Math.random()*BADGE_COLORS.length)];
  }

  render(){
    let { index, item } = this.props.data;

    return (
      <View style={[styles.container, {height: item.height}]}>
        <View style={[styles.badge, {backgroundColor: this.badgeColor}]}>
          <Text style={styles.badgeText}>{index}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.infoText}>{item.height || 0}</Text>
        </View>
      </View>
    )
  }
}

const BADGE_COLORS = ["#4527A0", "#283593", "#1565C0", "#0277BD", "#00838F",
"#00695C", "#2E7D32", "#FFEB3B", "#EF6C00", "#4E342E", "#424242", "#C62828"];
const styles = StyleSheet.create({
  container: {
    //padding: 5,
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
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    opacity: .81
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
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: 'flex-start',
    backgroundColor: '#F5F5F5',
    elevation: 2,
  },
  infoText: {
    fontSize: 20,
    color: '#000',
    opacity: .81
  }

});
