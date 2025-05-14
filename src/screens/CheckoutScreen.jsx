import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Header from '../components/Header';
import { LinearGradient } from 'expo-linear-gradient';

const CheckoutScreen = () => {
    const handleCOD =()=>{
        alert ("Your order hasbeen Placed sucessfully");
    };
    const handleOnline =()=>{
        alert ("redirect to your payment gateway");
       // navigation.navigate("payment");
    }
  return (
    <LinearGradient colors={['#ffffff', '#ffffff']} style={styles.wrapper}>
      <Header title="Pay" />
      <View style={styles.container}>
        <Text style={styles.heading}>Payment Options</Text>
        <Text style={styles.price}>Total Amount: 5000 Rwf</Text>
        <View style={styles.paymentCard}>
          <Text style={styles.paymentHeading}>Select your payment mode</Text>
          <TouchableOpacity style={styles.paymentBtn} onPress={handleCOD}>
            <Text style={styles.paymentBtnText} >Cash on delivery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentBtn} onPress={handleOnline}>
            <Text style={styles.paymentBtnText}>Online (CREDIT | DEBIT CARD)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  heading: {
    fontSize: 25,
    marginVertical: 10,
  },
  price: {
    fontSize: 20,
    marginBottom: 10,
    color: "gray",
  },
  paymentCard: {
    backgroundColor: "#ff89ff",
    width: "90%",
    borderRadius: 10,
    padding: 30,
    marginVertical: 10,
  },
  paymentHeading: {
    color: "gray",
    marginBottom: 10,
  },
  paymentBtn: {
    backgroundColor: "#FF4500",
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    marginVertical: 10,
  },
  paymentBtnText: {
    color: "#ffffff",
    textAlign: "center",
  },
});
