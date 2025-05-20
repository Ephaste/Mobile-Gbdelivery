// src/components/ProductCard.js

import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ProductCard = ({ item }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const productId = item.id;
    if (!productId) {
      setLoading(false);
      return;
    }

    (async () => {
      const formData = new FormData();
      formData.append('action', 'GET_PRODUCT_IMAGES_API');
      formData.append('product_id', productId);

      try {
        const response = await fetch(
          'https://gbdelivering.com/action/select.php',
          {
            method: 'POST',
            headers: { 'Content-Type': 'multipart/form-data' },
            body: formData,
          }
        );
        const json = await response.json();
        // json[0] might already be a full URL:
        const raw = json[0]?.trim();
        const fullUrl = raw
          ? raw.startsWith('http')
            ? raw
            : `https://gbdelivering.com/uploads/${raw}`
          : null;
        setImageUrl(fullUrl);
      } catch (error) {
        console.error('Image fetch error for product:', productId, error);
        setImageUrl(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [item]);

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('ProductDetails', {
          product: item,
          imageUrl,
        })
      }
    >
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#FF4500"
          style={styles.loader}
        />
      ) : (
        <Image
          source={{
            uri:
              imageUrl ||
              'https://gbdelivering.com/uploads/38427b190dfcd7c7a5a8aa2b81f2565c0e9b9b333127f84c0661d78e04278593Boni Tricolore 2.jpg',
          }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      )}

      <TouchableOpacity
        style={styles.likeContainer}
        onPress={() => setIsLiked((v) => !v)}
      >
        <AntDesign
          name={isLiked ? 'heart' : 'hearto'}
          size={20}
          color="#E55B5B"
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>{item.name || item.title}</Text>
        <Text style={styles.price}>
          {item.price ? `${item.price} Rwf` : '—'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 4,
    overflow: 'hidden',
    maxWidth: '48%',
  },
  coverImage: {
    width: '100%',
    height: 180,
  },
  loader: {
    height: 180,
    justifyContent: 'center',
  },
  likeContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
    zIndex: 10,
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  price: {
    fontSize: 14,
    color: '#FF4500',
    marginTop: 4,
  },
});
