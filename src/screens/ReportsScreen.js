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
} from "react-native";
import api from "../services/api";

export default function ReportsScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      console.log("📡 Fetching reports from /api/reports ...");
      const { data } = await api.get("/api/reports"); // ✅ fixed endpoint
      console.log("✅ Reports data:", data);
      setReports(data.results || []); // ✅ only results
    } catch (err) {
      console.error("❌ Error fetching reports:", err?.response || err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to load reports"
      );
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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Complaint Details Report</Text>
      <Text style={styles.text}>
        Complaint Type: {item.complaintType || "N/A"}
      </Text>
      <Text style={styles.text}>Status: {item.status || "N/A"}</Text>
      <Text style={styles.text}>
        Department: {item.department || "N/A"}
      </Text>
      <Text style={styles.text}>
        Programme: {item.programme || "N/A"}
      </Text>
      <Text style={styles.text}>
        Raised By: {item.user?.username || "N/A"}
      </Text>
      <Text style={styles.text}>
        Assigned To: {item.assignedTo?.roleName || "Not Assigned"}
      </Text>
      <Text style={styles.text}>
        Date: {new Date(item.createdAt).toDateString()}
      </Text>
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
    <FlatList
      data={reports}
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
  );
}

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
});
