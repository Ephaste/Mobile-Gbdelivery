// src/screens/Register.js

import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Register() {
  const navigation = useNavigation();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = async () => {
    if (!username.trim() || password !== confirm) {
      Alert.alert("Error", password !== confirm ? "Passwords do not match" : "Username required");
      return;
    }

    const form = new FormData();
    form.append("action", "CREATE_ACCOUNT_API");
    form.append("first_name", firstname);
    form.append("last_name", lastname);
    form.append("email", email);
    form.append("phone_no", phone);
    form.append("username", username.trim());
    form.append("password", password);

    try {
      const res = await fetch("https://gbdelivering.com/action/insert.php", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (Array.isArray(json) && json[0].status === "ACCOUNT_CREATED") {
        Alert.alert("Success", "Account created", [
          { text: "OK", onPress: () => navigation.navigate("Login") },
        ]);
      } else {
        Alert.alert("Error", json[0]?.status || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Unable to register. Try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register</Text>
      {[
        { label: "First Name", value: firstname, onChange: setFirstname },
        { label: "Last Name", value: lastname, onChange: setLastname },
        { label: "Email", value: email, onChange: setEmail, keyboard: "email-address" },
        { label: "Phone", value: phone, onChange: setPhone, keyboard: "phone-pad" },
        { label: "Username", value: username, onChange: setUsername },
        { label: "Password", value: password, onChange: setPassword, secure: true },
        { label: "Confirm Password", value: confirm, onChange: setConfirm, secure: true },
      ].map(({ label, value, onChange, keyboard, secure }) => (
        <TextInput
          key={label}
          placeholder={label}
          style={styles.input}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboard}
          secureTextEntry={secure}
        />
      ))}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Back to Sign In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flexGrow: 1, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#FF4500" },
  input: {
    backgroundColor: "#f2f2f2",
    marginBottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  button: {
    backgroundColor: "#FF4500",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  link: { color: "#FF4500", textAlign: "center", marginTop: 10 },
});
