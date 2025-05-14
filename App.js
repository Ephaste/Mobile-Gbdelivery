import React, { useContext } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import {
  Entypo,
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from './src/screens/HomeScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import Login from './src/screens/auth/Login';
import Register from './src/screens/auth/Register';
import AccountScreen from './src/screens/AccountScreen';

import { CartContext, CartProvider } from './src/context/CartContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/** ✅ Home Stack: Home -> Product Details */
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="PRODUCT_DETAILS" component={ProductDetailsScreen} />
  </Stack.Navigator>
);

/** ✅ Cart Stack: Cart -> Checkout */
const CartStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="CHECKOUT" component={CheckoutScreen} />
  </Stack.Navigator>
);

/** ✅ Auth Stack: Login -> Register */
const AuthStack = () => (
  <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Register" component={Register} />
     <Stack.Screen name="Account" component={AccountScreen} /> 
  </Stack.Navigator>
);

/** ✅ Cart Icon with badge */
const CartTabIcon = ({ size, color }) => {
  const { carts } = useContext(CartContext);

  return (
    <View>
      <MaterialCommunityIcons name="cart" size={size} color={color} />
      {carts.length > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{carts.length}</Text>
        </View>
      )}
    </View>
  );
};

/** ✅ Dummy Reorder screen component (no inline) */
const ReorderScreen = () => (
  <View style={styles.screenCenter}>
    <Text>Reorder</Text>
  </View>
);

/** ✅ Bottom Tabs */
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarActiveTintColor: '#E96E6E',
    }}
  >
    <Tab.Screen
      name="HomeTab"
      component={HomeStack}
      options={{
        tabBarIcon: ({ size, color }) => (
          <Entypo name="home" size={size} color={color} />
        ),
      }}
    />

    <Tab.Screen
      name="ReorderTab"
      component={ReorderScreen} // ✅ NO inline component
      options={{
        tabBarIcon: ({ size, color }) => (
          <MaterialIcons name="reorder" size={size} color={color} />
        ),
      }}
    />

    <Tab.Screen
      name="CartTab"
      component={CartStack}
      options={{
        tabBarIcon: CartTabIcon,
      }}
    />

    <Tab.Screen
      name="AccountTab"
      component={AuthStack}
      options={{
        tabBarIcon: ({ size, color }) => (
          <FontAwesome name="user" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <MainTabNavigator />
      </NavigationContainer>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  cartBadge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 16,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  screenCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
