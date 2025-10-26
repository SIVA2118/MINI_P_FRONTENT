import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  listMaster,
  createMaster,
  deleteMaster,
} from "../services/masterService";

export default function BasicList({
  master,
  titleField = "name",
  extraFields = [],
}) {
  const [items, setItems] = useState([]);
  const [formValues, setFormValues] = useState({ [titleField]: "" });
  const [loading, setLoading] = useState(false);
  const [extraFieldsState, setExtraFieldsState] = useState(extraFields);

  // 🔹 Update any input field
  function updateField(field, value) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }

  // 🔹 Load all master data
  async function load() {
    setLoading(true);
    try {
      const data = await listMaster(master);
      setItems(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Load dropdown/picker options for extra fields
  async function loadExtraFieldOptions() {
    const updatedExtraFields = await Promise.all(
      extraFields.map(async (field) => {
        if (field.type === "picker" && field.master) {
          try {
            const data = await listMaster(field.master);
            const options = (Array.isArray(data) ? data : data.items || []).map(
              (item) => {
                const label =
                  item[field.labelKey || titleField] ||
                  item.name ||
                  item.departmentName ||
                  item.programmeName ||
                  item.blockName ||
                  item.roleName ||
                  item.title ||
                  "No name";
                return { label, value: item._id || item.id };
              }
            );
            console.log("✅ Options loaded for", field.name, options);
            return { ...field, options };
          } catch (e) {
            Alert.alert(
              "Error",
              `Failed to load ${field.label || field.name} data`
            );
            return { ...field, options: [] };
          }
        }
        return field;
      })
    );

    setExtraFieldsState(updatedExtraFields);

    // Initialize empty form values for all fields
    setFormValues((prev) => ({
      ...prev,
      ...Object.fromEntries(updatedExtraFields.map((f) => [f.name, ""])),
    }));
  }

  // 🔹 Add new record
  async function add() {
    const emptyRequired = [titleField, ...extraFieldsState.map((f) => f.name)].find(
      (field) => !formValues[field] || formValues[field] === ""
    );

    if (emptyRequired) {
      Alert.alert("Error", `${emptyRequired} is required`);
      return;
    }

    console.log("📦 Submitting data:", formValues);

    try {
      await createMaster(master, formValues);
      setFormValues({
        [titleField]: "",
        ...Object.fromEntries(extraFieldsState.map((f) => [f.name, ""])),
      });
      load();
    } catch (e) {
      console.error("❌ Save Error:", e?.response?.data || e.message);
      Alert.alert("Error", e?.response?.data?.message || e.message);
    }
  }

  // 🔹 Delete record
  async function remove(id) {
    try {
      await deleteMaster(master, id);
      load();
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || e.message);
    }
  }

  useEffect(() => {
    load();
    loadExtraFieldOptions();
  }, []);

  // 🔹 UI Rendering
  return (
    <View style={styles.container}>
      <View style={styles.column}>
        {/* 🔸 Title Field */}
        <TextInput
          placeholder={`New ${master} ${titleField}`}
          value={formValues[titleField]}
          onChangeText={(text) => updateField(titleField, text)}
          style={styles.input}
        />

        {/* 🔸 Extra Fields (TextInput or Picker) */}
        {extraFieldsState.map((field) => {
          if (field.type === "picker") {
            return (
              <Picker
                key={field.name}
                selectedValue={formValues[field.name] || ""}
                onValueChange={(value) => updateField(field.name, value)}
                style={styles.picker}
              >
                <Picker.Item
                  label={`Select ${field.label || field.name}`}
                  value=""
                />
                {field.options?.map((opt) => (
                  <Picker.Item
                    key={opt.value}
                    label={opt.label}
                    value={opt.value}
                  />
                ))}
              </Picker>
            );
          }

          return (
            <TextInput
              key={field.name}
              placeholder={field.label || field.name}
              value={formValues[field.name]}
              onChangeText={(text) => updateField(field.name, text)}
              style={styles.input}
            />
          );
        })}

        <Button title="Add" onPress={add} disabled={loading} />
      </View>

      {/* 🔸 List Display */}
      <FlatList
        data={items}
        keyExtractor={(item) => item._id || item.id || item[titleField]}
        refreshing={loading}
        onRefresh={load}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              {/* Title field */}
              <Text style={styles.itemTitle}>{item[titleField]}</Text>

              {/* Extra fields */}
              {extraFieldsState.map((f) => {
                const val = item[f.name];

                if (val && typeof val === "object") {
                  return (
                    <Text key={f.name} style={styles.itemSubText}>
                      {f.label || f.name}:{" "}
                      {val.name ||
                        val.departmentName ||
                        val.programmeName ||
                        val.roleName ||
                        val.title}
                    </Text>
                  );
                }

                if (val) {
                  return (
                    <Text key={f.name} style={styles.itemSubText}>
                      {f.label || f.name}: {val}
                    </Text>
                  );
                }

                return null;
              })}
            </View>

            {/* Delete button */}
            <Button
              title="Delete"
              color="red"
              onPress={() => remove(item._id || item.id)}
            />
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>No data</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, backgroundColor: "#fff" },
  column: { gap: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
  },
  itemRow: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  itemSubText: {
    fontSize: 14,
    color: "#555",
  },
});
