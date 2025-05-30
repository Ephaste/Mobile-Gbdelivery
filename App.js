import React, { useContext } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Entypo, FontAwesome, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Add this import:
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Screens
import HomeScreen from "./src/screens/HomeScreen";
import ProductDetailsScreen from "./src/screens/ProductDetailsScreen";
import CartScreen from "./src/screens/CartScreen";
import CheckoutScreen from "./src/screens/CheckoutScreen";
import NewAddress from "./src/screens/NewAddress"; // Fixed typo
import DPO from "./src/screens/DPO";
import Login from "./src/screens/auth/Login";
import Register from "./src/screens/auth/Register";
import AccountScreen from "./src/screens/AccountScreen";

// Context
import { CartContext, CartProvider } from "./src/context/CartContext";

// Navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Home Stack
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    </Stack.Navigator>
  );
}

// Cart Stack
function CartStack() {
  return (
    <Stack.Navigator initialRouteName="Cart" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Newaddress" component={NewAddress} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="DPO" component={DPO} />
    </Stack.Navigator>
  );
}

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Account" component={AccountScreen} />
    </Stack.Navigator>
  );
}

// Separate ReorderScreen component (was inline)
function ReorderScreen() {
  return (
    <View style={styles.screenCenter}>
      <Text>Reorder</Text>
    </View>
  );
}

// Custom Cart Icon with Badge
function CartTabIcon({ size, color }) {
  const { cartItems } = useContext(CartContext);
  const count = cartItems.reduce(
    (sum, item) => sum + Number(item.cart_item_product_quantity || 0),
    0
  );

  return (
    
    <View style={styles.iconWrapper}>
      <MaterialCommunityIcons name="cart" size={size} color={color} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </View>
  );
}

// Bottom Tab Navigator
 function MainTabNavigator() {
   return (
     <Tab.Navigator
       initialRouteName="HomeTab"
       screenOptions={{
         headerShown: false,
         tabBarShowLabel: false,
         tabBarActiveTintColor: "#E96E6E",
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
        name="SearchTab"
        component={HomeStack}
        options={{
          tabBarIcon: ({ size, color }) => (
            <FontAwesome name="search" size={size} color={color} />
          ),
        }}
       initialParams={{ focusSearch: true }}
      />

       <Tab.Screen
         name="CartTab"
         component={CartStack}
         options={{
           tabBarIcon: ({ size, color }) => <CartTabIcon size={size} color={color} />,
         }}
       />
       <Tab.Screen
         name="AccountTab"
         component={AuthStack}
         options={{
           tabBarIcon: ({ size, color }) => <FontAwesome name="user" size={size} color={color} />,
         }}
       />
     </Tab.Navigator>
   );
 }


// App Entry Point with GestureHandlerRootView wrapping
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CartProvider>
        <NavigationContainer>
          <MainTabNavigator />
        </NavigationContainer>
      </CartProvider>
    </GestureHandlerRootView>
  );
}

// Styles
const styles = StyleSheet.create({
  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    right: -6,
    top: -3,
    backgroundColor: "red",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  screenCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
