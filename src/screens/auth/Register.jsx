import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/Header'; // Ensure correct path

const Register = () => {
  const [accountType, setAccountType] = useState('customer');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneno, setPhoneno] = useState('');
  const [birthday, setBirthday] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [sector, setSector] = useState('');
  const [cell, setCell] = useState('');
  const [village, setVillage] = useState('');
  const [street, setStreet] = useState('');
  const [desaddress, setDesaddress] = useState('');
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // DEBUG: log the username being submitted
    const finalUsername = username.toLowerCase().trim();
    console.log('Submitting username:', finalUsername);

    let formdata = new FormData();
    formdata.append("action", "CREATE_ACCOUNT_API");
    formdata.append("first_name", firstname);
    formdata.append("last_name", lastname);
    formdata.append("email", email);
    formdata.append("phone_no", phoneno);
    formdata.append("dob", birthday);
    formdata.append("username", finalUsername);
    formdata.append("password", password);
    formdata.append("province", province);
    formdata.append("district", district);
    formdata.append("sector", sector);
    formdata.append("cell", cell);
    formdata.append("village", village);
    formdata.append("street", street);
    formdata.append("described_address", desaddress);

    try {
      const response = await fetch("https://gbdelivering.com/action/insert.php", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formdata,
      });

      const result = await response.json();
      console.log('Raw Response:', result);

      if (Array.isArray(result)) {
        const data = result[0];

        if (data.status === "ACCOUNT_CREATED") {
          Alert.alert('Success', 'Account created successfully!');
          navigation.navigate("LOGIN");
        } else {
          Alert.alert('Error', data.status || 'Registration failed');
          console.log('Backend Error:', data);
        }
      } else {
        Alert.alert('Error', 'Unexpected response format.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <Header title="REGISTER" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>USER ACCOUNT TYPE</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setAccountType('customer')}
            >
              <View style={[styles.radioCircle, accountType === 'customer' && styles.selectedRadio]} />
              <Text style={styles.radioLabel}>Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setAccountType('seller')}
            >
              <View style={[styles.radioCircle, accountType === 'seller' && styles.selectedRadio]} />
              <Text style={styles.radioLabel}>Seller</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>

          <Text style={styles.label}>FIRST NAME (OR BUSINESS NAME)</Text>
          <TextInput
            style={styles.input}
            placeholder="First name"
            placeholderTextColor="#777"
            value={firstname}
            onChangeText={setFirstname}
          />

          <Text style={styles.label}>LAST NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Last name"
            placeholderTextColor="#777"
            value={lastname}
            onChangeText={setLastname}
          />

          <Text style={styles.label}>USERNAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            placeholderTextColor="#777"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <Text style={styles.label}>E-MAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            placeholderTextColor="#777"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>PHONE NUMBER</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone Number (078...)"
            placeholderTextColor="#777"
            keyboardType="phone-pad"
            value={phoneno}
            onChangeText={setPhoneno}
          />

          <Text style={styles.label}>BIRTHDAY</Text>
          <TextInput
            style={styles.input}
            placeholder="mm/dd/yyyy"
            placeholderTextColor="#777"
            value={birthday}
            onChangeText={setBirthday}
          />

          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#777"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>CONFIRM PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor="#777"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>CREATE</Text>
          </TouchableOpacity>

          <View style={styles.linkRow}>
            <TouchableOpacity>
              <Text style={styles.linkText}>Return to Store</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("LOGIN")}>
              <Text style={styles.linkText}>Return to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FF4500',
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginTop: 5,
  },
  button: {
    marginTop: 25,
    padding: 14,
    backgroundColor: 'white',
    borderColor: 'orangered',
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'orangered',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  linkText: {
    color: '#FF4500',
    fontWeight: '500',
    fontSize: 14,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF4500',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  selectedRadio: {
    backgroundColor: '#FF4500',
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
  },
});
