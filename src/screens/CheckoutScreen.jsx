// src/screens/CheckoutScreen.js

import React, { useContext, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { CartContext } from "../context/CartContext";
import Spinner from "react-native-loading-spinner-overlay";

export default function CheckoutScreen({ navigation }) {
  const { userId, cartItems, clearCart } = useContext(CartContext);

  const [phone, setPhone] = useState("");
  const [orderDesc, setOrderDesc] = useState("");
  const [processing, setProcessing] = useState(false);
  const [polling, setPolling] = useState(false);
  const [message, setMessage] = useState("");
  const orderIdRef = useRef(null);
  const intervalRef = useRef(null);

  // Compute total
  const total = cartItems.reduce(
    (sum, i) => sum + i.cart_item_price * i.cart_item_product_quantity,
    0
  );

  // Trigger MoMo flow
  const handleMoMo = async () => {
    if (!phone.trim()) {
      Alert.alert("Validation", "Please enter your phone number.");
      return;
    }

    setProcessing(true);
    setMessage("Creating order...");

    // 1️⃣ Create the order
    try {
      const form = new FormData();
      form.append("action", "ORDER_CHECKOUT_API");
      form.append("customer_id", userId);
      form.append("order_description", orderDesc);
      form.append("pay_phone_no", phone);

      const res = await fetch(
        "https://gbdelivering.com/action/insert.php",
        { method: "POST", body: form }
      );
      const text = await res.text();
      console.log("Order Creation Response:", text);

      const json = JSON.parse(text);
      const status = json[0]?.status;
      const order_id = json[0]?.order_id;

      if (status !== "SUCCESS" || !order_id) {
        throw new Error(status || "Order creation failed");
      }

      orderIdRef.current = order_id;
      setMessage("Requesting payment...");
    } catch (err) {
      console.error("Order creation error:", err);
      setProcessing(false);
      Alert.alert("Error", `Order creation failed: ${err.message}`);
      return;
    }

    // 2️⃣ Request MoMo payment via Paypack
    try {
      const form = new FormData();
      form.append("action", "PAYMENT_REQUEST");
      form.append("order_id", orderIdRef.current);
      form.append("grand_total", total.toString());
      form.append("phone_no", phone);

      const res = await fetch(
        "https://gbdelivering.com/action/insert.php",
        { method: "POST", body: form }
      );
      const text = await res.text();
      console.log("Payment Request Response:", text);

      // Backend echoes "FAILED_PAYMENT" on failure, nothing on success
      if (text.includes("FAILED_PAYMENT")) {
        throw new Error("Payment request failed on backend");
      }

      setMessage("Waiting for payment confirmation...");
      setPolling(true);
    } catch (err) {
      console.error("Payment request error:", err);
      setProcessing(false);
      Alert.alert("Error", `Payment request failed: ${err.message}`);
      return;
    }
  };

  // 3️⃣ Poll for payment status
  useEffect(() => {
    if (!polling) return;

    intervalRef.current = setInterval(async () => {
      try {
        const form = new FormData();
        form.append("action", "CHECK_PAYMENT_API");
        form.append("order_id", orderIdRef.current);

        const res = await fetch(
          "https://gbdelivering.com/action/select.php",
          { method: "POST", body: form }
        );
        const json = await res.json();
        console.log("Check Payment Response:", json);

        const status = json[0]?.status;
        if (status === "SUCCESS") {
          clearInterval(intervalRef.current);
          setProcessing(false);
          setPolling(false);
          Alert.alert("Success", "Payment confirmed! Thank you.");
          clearCart();
          navigation.popToTop();
        } else if (status === "ACCOUNT_NOT_FOUND" || status === "FAILED") {
          clearInterval(intervalRef.current);
          setProcessing(false);
          setPolling(false);
          Alert.alert(
            "Payment Failed",
            status === "ACCOUNT_NOT_FOUND"
              ? "Account not found."
              : "Transaction failed."
          );
        }
      } catch (err) {
        console.error("Polling error:", err);
        // continue polling on transient errors
      }
    }, 3000);

    return () => clearInterval(intervalRef.current);
  }, [polling]);

  return (
    <SafeAreaView style={styles.safe}>
      <Spinner visible={processing} textContent={message} />
      <View style={styles.container}>
        <Text style={styles.title}>MoMo Checkout</Text>
        <Text style={styles.total}>Total: {total.toFixed(2)} Rwf</Text>

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <TextInput
          style={[styles.input, styles.desc]}
          placeholder="Order description (optional)"
          multiline
          value={orderDesc}
          onChangeText={setOrderDesc}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleMoMo}
          disabled={processing}
        >
          <Text style={styles.buttonText}>
            {processing
              ? "Processing..."
              : polling
              ? "Waiting for confirmation..."
              : "Pay with MoMo"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  total: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
  desc: {
    height: 80,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#FF4500",
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
