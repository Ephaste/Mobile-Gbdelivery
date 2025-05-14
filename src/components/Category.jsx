import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const Category = ({ title, isSelected, onSelect }) => {
  return (
    <TouchableOpacity onPress={onSelect} style={styles.category}>
      <Text
        style={[
          styles.categoryText,
          { backgroundColor: isSelected ? '#FF4500' : '#808080' },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Category;

const styles = StyleSheet.create({
  category: {
    paddingHorizontal: 5,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 10,
    paddingHorizontal: 20,
    textAlign: 'center',
    borderRadius: 16,
  },
});
