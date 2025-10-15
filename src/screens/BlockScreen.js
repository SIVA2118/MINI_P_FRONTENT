// screens/BlocksScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import BasicList from "../components/BasicList";

export default function BlocksScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Blocks</Text>
      <BasicList
        master="blocks"
        titleField="blockName"
        extraFields={[
          { name: "department", type: "picker", master: "departments", label: "Department" },
          { name: "programme", type: "picker", master: "programmes", label: "Programme" }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 }
});
