import { Fontisto } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import data from '../assets/data/data.json'; // ✅ Import from JSON
import Category from '../components/Category';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';


const categories = ['Frequently asked', 'All', 'Fish', 'Meat', 'Biscuits'];


const HomeScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState(data.products);
const handleLiked = (item)=>{
  const newProducts = products.map((prod) =>{
    if (prod.id ===item.id){
      return{
        ...prod,
        isLiked: true,
      }
    }
    return prod;
  });
  setProducts(newProducts);
};
  return (
    <LinearGradient colors={['#ffffff', '#ffffff']} style={styles.container}>
      <Header />

      <FlatList
        numColumns={2}
        ListHeaderComponent={
          <>
            <Text style={styles.orderText}>Order your Favourites!</Text>

            {/* Input container */}
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} placeholder="Search" />
              <Fontisto name="search" size={20} color="#FF4500" style={styles.icon} />
            </View>

            {/* Category section */}
            <FlatList
              data={categories}
              renderItem={({ item }) => (
                <Category
                  title={item}
                  isSelected={item === selectedCategory}
                  onSelect={() => setSelectedCategory(item)}
                />
              )}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryList}
            />
          </>
        }
        data={products}
        renderItem={({ item, index }) => <ProductCard item={item} handleLiked={handleLiked} />}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </LinearGradient>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  orderText: {
    fontSize: 23,
    color: "#000000",
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    height: 50,
    borderWidth: 2,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderColor: '#FF4500',
    alignItems: 'center',
    marginTop: 20,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  icon: {
    marginLeft: 10,
  },
  categoryList: {
    marginTop: 20,
  },
});
