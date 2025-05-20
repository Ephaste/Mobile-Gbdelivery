// src/screens/NewAddress.js

import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView, GestureHandlerRootView } from "react-native-gesture-handler";

export default function NewAddress({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [sector, setSector] = useState("");
  const [cell, setCell] = useState("");
  const [village, setVillage] = useState("");
  const [street, setStreet] = useState("");
  const [description, setDescription] = useState("");

  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [cells, setCells] = useState([]);
  const [villages, setVillages] = useState([]);

  // load userId
  useEffect(() => {
    AsyncStorage.getItem("@userId").then(id => setUserId(id));
  }, []);

  // unified fetch
  const fetchList = async (action, payloadKey, payloadValue, setter) => {
    const form = new FormData();
    form.append("action", action);
    form.append(payloadKey, payloadValue);
    const res = await fetch("https://gbdelivering.com/action/select.php", {
      method: "POST",
      body: form,
    });
    const json = await res.json();

    let values;
    if (Array.isArray(json) && json.every(item => typeof item === "string")) {
      // backend returned ["foo", "bar"]
      values = json;
    } else {
      // backend returned [{ foo: "A" }, { foo: "B" }]
      const uniques = [...new Map(json.map(i => [JSON.stringify(i), i])).values()];
      values = uniques.map(i => {
        const key = Object.keys(i).find(k => k !== "status");
        return i[key];
      });
    }

    setter(values);
  };

  const onProvinceSelect = prov => {
    setProvince(prov);
    setDistrict("");
    setSector("");
    setCell("");
    setVillage("");
    setDistricts([]);
    setSectors([]);
    setCells([]);
    setVillages([]);
    fetchList("GET_DISTRICTS_API", "province", prov, setDistricts);
  };

  const onDistrictSelect = dist => {
    setDistrict(dist);
    setSector("");
    setCell("");
    setVillage("");
    setSectors([]);
    setCells([]);
    setVillages([]);
    fetchList("GET_SECTORS_API", "district", dist, setSectors);
  };

  const onSectorSelect = sec => {
    setSector(sec);
    setCell("");
    setVillage("");
    setCells([]);
    setVillages([]);
    fetchList("GET_CELLS_API", "sector", sec, setCells);
  };

  const onCellSelect = c => {
    setCell(c);
    setVillage("");
    setVillages([]);
    fetchList("GET_VILLAGES_API", "cell", c, setVillages);
  };

  const saveAddress = async () => {
    if (![province, district, sector, cell, village].every(v => v.trim())) {
      Alert.alert("Validation", "Please fill all required fields.");
      return;
    }
    setLoading(true);

    const form = new FormData();
    form.append("action", "CREATE_ADDRESS_API");
    form.append("user_id", userId);
    form.append("province", province);
    form.append("district", district);
    form.append("sector", sector);
    form.append("cell", cell);
    form.append("village", village);
    form.append("street", street);
    form.append("described_address", description);

    try {
      const res = await fetch("https://gbdelivering.com/action/insert.php", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (json[0]?.status === "SUCCESS") {
        navigation.replace("Checkout");
      } else {
        throw new Error(json[0]?.status || "Failed to save address");
      }
    } catch (err) {
      Alert.alert("Error", err.message);
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

          {[
            ["Province", province, setProvince, onProvinceSelect],
            ["District", district, setDistrict, onDistrictSelect],
            ["Sector", sector, setSector, onSectorSelect],
            ["Cell", cell, setCell, onCellSelect],
            ["Village", village, setVillage, v => setVillage(v)],
          ].map(([label, value, setter, handler]) => (
            <View key={label} style={styles.field}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder={`Enter ${label}`}
                value={value}
                onChangeText={text => {
                  setter(text);
                  if (handler) handler(text);
                }}
              />
            </View>
          ))}

          <View style={styles.field}>
            <Text style={styles.label}>Street (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Street"
              value={street}
              onChangeText={setStreet}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Additional Info (optional)</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Apartment, landmark, etc."
              value={description}
              onChangeText={setDescription}
              multiline
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
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  button: {
    marginTop: 24,
    backgroundColor: "#FF4500",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
