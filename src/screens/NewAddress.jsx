import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  View,
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function NewAddress() {
  const route = useRoute();
  const navigation = useNavigation();
  const { amountToPay, productId, quantity } = route.params || {};

  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState('');                // ← new
  const [loading, setLoading] = useState(false);
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [sector, setSector] = useState('');
  const [cell, setCell] = useState('');
  const [village, setVillage] = useState('');
  const [street, setStreet] = useState('');
  const [description, setDescription] = useState('');

  // Dropdown lists
  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [cells, setCells] = useState([]);
  const [villages, setVillages] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem('@userId').then(id => {
      if (!id) {
        Alert.alert('Error', 'Please log in first.', [
          { text: 'OK', onPress: () => navigation.navigate('AccountTab', { screen: 'Login' }) },
        ]);
      }
      setUserId(id);
    });
    AsyncStorage.getItem('@email').then(e => setEmail(e || ''));  // ← new
  }, []);

  const fetchList = async (action, key, val, setter) => {
    const form = new FormData();
    form.append('action', action);
    form.append(key, val);
    const res = await fetch('https://gbdelivering.com/action/select.php', {
      method: 'POST',
      body: form,
    });
    const json = await res.json();
    const values = Array.isArray(json) && json.every(i => typeof i === 'string')
      ? json
      : [...new Map(json.map(i => [JSON.stringify(i), i])).values()]
          .map(i => i[Object.keys(i).find(k => k !== 'status')]);
    setter(values);
  };

  const saveAddress = async () => {
    if (![province, district, sector, cell, village, email].every(v => v.trim())) {
      Alert.alert('Validation', 'Please fill all required fields—including email.');
      return;
    }
    // simple email-format check
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Validation', 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('action', 'CREATE_ADDRESS_API');
      form.append('user_id', userId);
      form.append('province', province);
      form.append('district', district);
      form.append('sector', sector);
      form.append('cell', cell);
      form.append('village', village);
      form.append('street', street);
      form.append('described_address', description);
      form.append('email', email);  // ← include email if backend supports it

      const res = await fetch('https://gbdelivering.com/action/insert.php', {
        method: 'POST',
        body: form,
      });
      const json = await res.json();

      if (json[0]?.status === 'SUCCESS') {
        navigation.replace('Checkout', {
          amountToPay,
          productId,
          quantity,
          fromDetails: true,
          userEmail: email,        // ← pass it forward
          province,
          district,
          sector,
          cell,
          village,
          street,
          description,
        });
      } else {
        throw new Error(json[0]?.status || 'Failed to save address');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <Spinner visible={loading} textContent="Saving address..." />
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>Enter Shipping Address</Text>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Province */}
          <View style={styles.field}>
            <Text style={styles.label}>Province</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Province"
              value={province}
              onChangeText={t => {
                setProvince(t);
                setDistrict(''); setSector(''); setCell(''); setVillage('');
                fetchList('GET_DISTRICTS_API', 'province', t, setDistricts);
              }}
            />
          </View>

          {/* District */}
          <View style={styles.field}>
            <Text style={styles.label}>District</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter District"
              value={district}
              onChangeText={t => {
                setDistrict(t);
                setSector(''); setCell(''); setVillage('');
                fetchList('GET_SECTORS_API', 'district', t, setSectors);
              }}
            />
          </View>

          {/* Sector */}
          <View style={styles.field}>
            <Text style={styles.label}>Sector</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Sector"
              value={sector}
              onChangeText={t => {
                setSector(t);
                setCell(''); setVillage('');
                fetchList('GET_CELLS_API', 'sector', t, setCells);
              }}
            />
          </View>

          {/* Cell */}
          <View style={styles.field}>
            <Text style={styles.label}>Cell</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Cell"
              value={cell}
              onChangeText={t => {
                setCell(t);
                setVillage('');
                fetchList('GET_VILLAGES_API', 'cell', t, setVillages);
              }}
            />
          </View>

          {/* Village */}
          <View style={styles.field}>
            <Text style={styles.label}>Village</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Village"
              value={village}
              onChangeText={setVillage}
            />
          </View>

          {/* Street */}
          <View style={styles.field}>
            <Text style={styles.label}>Street (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="House name / Street"
              value={street}
              onChangeText={setStreet}
            />
          </View>

          {/* Additional Info */}
          <View style={styles.field}>
            <Text style={styles.label}>Additional Info (optional)</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Apartment, landmark, etc."
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={saveAddress}>
            <Text style={styles.buttonText}>Save & Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: { padding: 16 },
  header: { fontSize: 22, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#FF4500',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
