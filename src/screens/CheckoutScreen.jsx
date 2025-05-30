import React, { useContext, useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { CartContext } from '../context/CartContext';
import Spinner from 'react-native-loading-spinner-overlay';
import { useRoute } from '@react-navigation/native';

export default function CheckoutScreen({ navigation }) {
  const { userId, cartItems, clearCart } = useContext(CartContext);
  const route = useRoute();
  const {
    amountToPay,
    productId,
    quantity,
    fromDetails,
    userEmail, // ← now comes in
    province,
    district,
    sector,
    cell,
    village,
    street,
    description,
  } = route.params || {};

  const [phone, setPhone] = useState('');
  const [orderDesc, setOrderDesc] = useState(description || '');
  const [processing, setProcessing] = useState(false);
  const [polling, setPolling] = useState(false);        // <-- Added this
  const [message, setMessage] = useState('');           // <-- Added this

  const orderIdRef = useRef(null);                       // <-- Added this
  const intervalRef = useRef(null);                      // <-- Added this

  const total = fromDetails
    ? amountToPay
    : cartItems.reduce(
        (sum, i) => sum + i.cart_item_price * i.cart_item_product_quantity,
        0
      );

  const handleCardPayment = () => {
    navigation.navigate('DPO', {
      userId,
      phoneNumber: phone,
      orderDesc,
      amount: total,
      clearCart,
      email: userEmail, // ← forward email
      province,
      district,
      sector,
      cell,
      village,
      street,
      describedAddress: description,
    });
  };

  const handleMoMo = async () => {
    if (!phone.trim()) {
      Alert.alert('Validation', 'Please enter your phone number.');
      return;
    }
    setProcessing(true);
    setMessage('Creating order...');
    try {
      const form = new FormData();
      form.append('action', 'ORDER_CHECKOUT_API');
      form.append('customer_id', userId);
      form.append('order_description', orderDesc);
      form.append('pay_phone_no', phone);
      if (fromDetails) {
        form.append('product_id', productId);
        // form.append('product_quantity', quantity.toString());
      }
      const res = await fetch('https://gbdelivering.com/action/insert.php', {
        method: 'POST',
        body: form,
      });
      const text = await res.text();
      const json = JSON.parse(text);
      const status = json[0]?.status;
      const order_id = json[0]?.order_id;
      if (status !== 'SUCCESS' || !order_id) {
        throw new Error(status || 'Order creation failed');
      }
      orderIdRef.current = order_id;
      setMessage('Requesting payment...');
    } catch (err) {
      console.error('Order creation error:', err);
      setProcessing(false);
      Alert.alert('Error', `Order creation failed: ${err.message}`);
      return;
    }

    try {
      const form2 = new FormData();
      form2.append('action', 'PAYMENT_REQUEST');
      form2.append('order_id', orderIdRef.current);
      form2.append('grand_total', total.toString());
      form2.append('phone_no', phone);
      const res2 = await fetch('https://gbdelivering.com/action/insert.php', {
        method: 'POST',
        body: form2,
      });
      const text2 = await res2.text();
      if (text2.includes('FAILED_PAYMENT')) {
        throw new Error('Payment request failed on backend');
      }
      setMessage('Waiting for payment confirmation...');
      setPolling(true);               // <-- Correctly set polling here
    } catch (err) {
      console.error('Payment request error:', err);
      setProcessing(false);
      Alert.alert('Error', `Payment request failed: ${err.message}`);
      return;
    }
  };

  useEffect(() => {
    if (!polling || !orderIdRef.current) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      try {
        const form = new FormData();
        form.append('action', 'CHECK_PAYMENT_API');
        form.append('order_id', orderIdRef.current);
        const res = await fetch('https://gbdelivering.com/action/select.php', {
          method: 'POST',
          body: form,
        });
        const text = await res.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch {
          return;
        }
        const status = json[0]?.status;
        if (status === 'SUCCESS') {
          clearInterval(intervalRef.current);
          setProcessing(false);
          setPolling(false);
          Alert.alert('Success', 'Payment confirmed! Thank you.');
          clearCart();
          navigation.popToTop();
        } else if (['ACCOUNT_NOT_FOUND', 'FAILED'].includes(status)) {
          clearInterval(intervalRef.current);
          setProcessing(false);
          setPolling(false);
          Alert.alert(
            'Payment Failed',
            status === 'ACCOUNT_NOT_FOUND'
              ? 'Account not found.'
              : 'Transaction failed.'
          );
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);

    return () => clearInterval(intervalRef.current);
  }, [polling]);

  return (
    <SafeAreaView style={styles.safe}>
      <Spinner visible={processing} textContent={message} />
      <View style={styles.container}>
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.total}>Total: {(total ?? 0).toFixed(2)} Rwf</Text>
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
              ? 'Processing...'
              : polling
              ? 'Waiting for confirmation...'
              : 'Pay with MoMo'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#007BFF', marginTop: 10 }]}
          onPress={handleCardPayment}
          disabled={processing}
        >
          <Text style={styles.buttonText}>Pay with Card</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  total: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
  desc: { height: 80, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#FF4500',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
});
