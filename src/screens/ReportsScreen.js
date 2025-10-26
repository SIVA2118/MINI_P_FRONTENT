// screens/ReportsScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from "react-native";
import api from "../services/api";

export default function ReportsScreen() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🔍 Filters
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [programmeFilter, setProgrammeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // 🔁 Fetch all reports
  const fetchReports = async () => {
    try {
      console.log("📡 Fetching reports from /api/reports ...");
      const { data } = await api.get("/api/reports");
      console.log("✅ Reports data:", data);
      const allReports = data.results || [];
      setReports(allReports);
      setFilteredReports(allReports);
    } catch (err) {
      console.error("❌ Error fetching reports:", err?.response || err);
      Alert.alert("Error", err?.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  // 🧩 Apply filters
  const applyFilters = () => {
    let filtered = reports;

    if (departmentFilter.trim() !== "") {
      filtered = filtered.filter((r) =>
        r.department?.toLowerCase().includes(departmentFilter.toLowerCase())
      );
    }

    if (programmeFilter.trim() !== "") {
      filtered = filtered.filter((r) =>
        r.programme?.toLowerCase().includes(programmeFilter.toLowerCase())
      );
    }

    if (statusFilter.trim() !== "") {
      filtered = filtered.filter(
        (r) => r.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredReports(filtered);
  };

  // 📋 Report card
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Complaint Details Report</Text>
      <Text style={styles.text}>Complaint Type: {item.complaintType || "N/A"}</Text>
      <Text style={styles.text}>Status: {item.status || "N/A"}</Text>
      <Text style={styles.text}>Department: {item.department || "N/A"}</Text>
      <Text style={styles.text}>Programme: {item.programme || "N/A"}</Text>
      <Text style={styles.text}>Raised By: {item.user?.username || "N/A"}</Text>
      <Text style={styles.text}>Assigned To: {item.assignedTo?.roleName || "Not Assigned"}</Text>
      <Text style={styles.text}>Date: {new Date(item.createdAt).toDateString()}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10 }}>Loading Reports...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* 🔍 Filter Section */}
      <View style={styles.filterContainer}>
        <TextInput
          placeholder="Filter by Department"
          style={styles.input}
          value={departmentFilter}
          onChangeText={setDepartmentFilter}
        />
        <TextInput
          placeholder="Filter by Programme"
          style={styles.input}
          value={programmeFilter}
          onChangeText={setProgrammeFilter}
        />
        <TextInput
          placeholder="Filter by Status (e.g. Pending)"
          style={styles.input}
          value={statusFilter}
          onChangeText={setStatusFilter}
        />
        <TouchableOpacity style={styles.filterButton} onPress={applyFilters}>
          <Text style={styles.filterButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>

      {/* 📄 Reports List */}
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: "#555" }}>No reports found</Text>
          </View>
        }
      />
    </View>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 2,
  },
  filterContainer: {
    backgroundColor: "#eef2ff",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#c7d2fe",
  },
  input: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  filterButton: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  filterButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
