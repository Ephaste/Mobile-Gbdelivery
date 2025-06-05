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

const ProductCard = ({ item, allProducts }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Pick whichever field holds your stock count:
 
  const isOutOfStock = item.stock_quantity <= 0;
  useEffect(() => {
    const productId = item.product_id ?? item.id;
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
            body: formData,
          }
        );
        const json = await response.json();
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
          allProducts,
        })
      }
    >
      <View>
        {loading ? (
          <ActivityIndicator size="large" color="#FF4500" style={styles.loader} />
        ) : (
          <Image
            source={{
              uri:
                imageUrl ||
                'https://gbdelivering.com/uploads/default-product.jpg',
            }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}

        {isOutOfStock && (
          <Text style={styles.outOfStockLabel}>Out of stock</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.likeContainer}
        onPress={() => setIsLiked(v => !v)}
      >
        <AntDesign
          name={isLiked ? 'heart' : 'hearto'}
          size={20}
          color="#E55B5B"
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>{item.product_name || item.name || item.title}</Text>
        <Text style={styles.price}>
          {item.product_price || item.price ? `${item.product_price || item.price} Rwf` : '—'}
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
  outOfStockLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'red',
    color: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    zIndex: 20,
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
