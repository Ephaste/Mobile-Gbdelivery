import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ProductCard = ({ item }) => {
  const [isLiked, setIsLiked] = useState(false);
  const navigation = useNavigation();

  const handleLikeToggle = () => {
    setIsLiked((prev) => !prev);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={() => navigation.navigate("PRODUCT_DETAILS", { product: item })}
  //     onPress={() =>
  // navigation.navigate("HomeTab", {
  //   screen: "ProductDetails",
  //   params: { product: item },
 // })
//}

    >
      <Image
        source={{ uri: item.image }}
        style={styles.coverImage}
        resizeMode="cover"
      />
      <TouchableOpacity style={styles.likeContainer} onPress={handleLikeToggle}>
        <AntDesign name={isLiked ? "heart" : "hearto"} size={20} color="#E55B5B" />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>{item.price} Rwf</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  coverImage: {
    height: 180,
    width: '100%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 16,
    color: '#444',
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  likeContainer: {
    height: 34,
    width: 34,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 17,
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    elevation: 3,
  },
});
