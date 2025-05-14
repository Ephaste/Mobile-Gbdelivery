import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const Test = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ Test Screen is Working!</Text>
    </View>
  );
};

export default Test;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
});
