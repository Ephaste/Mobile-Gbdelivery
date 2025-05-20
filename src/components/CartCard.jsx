// src/components/CartCard.js

import { StyleSheet, Text, Image, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { FontAwesome6 } from '@expo/vector-icons';

const CartCard = ({ product: item, onRemove }) => (
  <View style={styles.container}>
    <Image
      source={
        item.image
          ? { uri: item.image }
          : require('../assets/icon.png')
      }
      style={styles.coverImage}
      resizeMode="cover"
    />
    <View style={styles.CardContent}>
      <Text style={styles.title}>{item.name || item.title}</Text>
      <Text style={styles.price}>
        {item.price} Rwf × {item.quantity} ={' '}
        {(item.price * item.quantity).toFixed(2)} Rwf
      </Text>
    </View>
    <TouchableOpacity onPress={() => onRemove(item.id)}>
      <FontAwesome6 name="trash" color="#F68CB5" size={25} />
    </TouchableOpacity>
  </View>
);

export default CartCard;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    paddingRight: 15,
    paddingLeft: 10,
  },
  coverImage: {
    height: 125,
    width: '30%',
    borderRadius: 8,
  },
  CardContent: {
    flex: 1,
    marginHorizontal: 10,
  },
  title: {
    color: '#444444',
    fontSize: 18,
    fontWeight: '500',
  },
  price: {
    color: '#797979',
    marginVertical: 10,
    fontSize: 16,
  },
});
