// screens/ComplaintsListScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { listComplaints, updateComplaintStatus } from '../services/complaintService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

export default function ComplaintsListScreen() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [search, setSearch] = useState("");

  async function loadComplaints() {
    setLoading(true);
    try {
      const savedRole = await AsyncStorage.getItem('role');
      setRole(savedRole);

      const data = await listComplaints();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading complaints:', e);
      Alert.alert('Error', e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeStatus(id, status) {
    try {
      await updateComplaintStatus(id, status);
      Alert.alert('✅ Updated', `Complaint status changed to ${status}`);
      loadComplaints();
    } catch (e) {
      console.error('Error updating status:', e);
      Alert.alert('Error', e?.response?.data?.message || e.message);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'Assigned': return '#3b82f6';
      case 'In-Progress': return '#6366f1';
      case 'On-Hold': return '#e11d48';
      case 'Completed': return '#16a34a';
      default: return '#6b7280';
    }
  };

  // Group complaints by block with count
  const deptMap = complaints.reduce((acc, c) => {
    const block = c.blockName || 'Unknown';
    acc[block] = (acc[block] || 0) + 1;
    return acc;
  }, {});
  const departments = Object.keys(deptMap);

  // Filter complaints in selected department + search
  const filteredComplaints = complaints
    .filter(c => c.blockName === selectedDept)
    .filter(c =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.roomNumber?.toString().includes(search) ||
      c.complaintType?.toLowerCase().includes(search.toLowerCase()) ||
      c.status?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <View style={styles.container}>
      {!selectedDept ? (
        <>
          <Text style={styles.heading}>🏢 Select Department</Text>
          <FlatList
            data={departments}
            keyExtractor={(item, idx) => idx.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.deptCard}
                onPress={() => setSelectedDept(item)}
              >
                <Text style={styles.deptText}>{item}</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{deptMap[item]}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No departments found</Text>}
          />
        </>
      ) : (
        <>
          {/* Back + centered heading row */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => { setSelectedDept(null); setSearch(""); }}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.headingCenter}>
              {selectedDept} Complaints ({filteredComplaints.length})
            </Text>

            <View style={{ width: 40 }} /> 
          </View>

          {/* Search bar */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#64748b" style={{ marginRight: 6 }} />
            <TextInput
              placeholder="Search complaints..."
              value={search}
              onChangeText={setSearch}
              style={{ flex: 1, fontSize: 15 }}
              placeholderTextColor="#94a3b8"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredComplaints}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={[styles.card, { borderLeftColor: getStatusColor(item.status) }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.title}>{item.title || 'No Title'}</Text>
                  <Text style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) + '22', color: getStatusColor(item.status) }
                  ]}>
                    {item.status}
                  </Text>
                </View>

                <Text style={styles.field}><Text style={styles.label}>Description:</Text> {item.description}</Text>
                <Text style={styles.field}><Text style={styles.label}>Room:</Text> {item.roomNumber}</Text>
                <Text style={styles.field}><Text style={styles.label}>Type:</Text> {item.complaintType}</Text>
                <Text style={styles.raisedBy}>Raised by: {item.user?.username || 'Unknown'}</Text>

                {/* Status Update */}
                <View style={styles.pickerWrapper}>
                  <Text style={styles.label}>Change Status:</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={item.status}
                      onValueChange={val => {
                        if (val !== item.status) {
                          handleChangeStatus(item._id, val);
                        }
                      }}
                      style={styles.picker}
                    >
                      <Picker.Item label="Pending" value="Pending" />
                      <Picker.Item label="Assigned" value="Assigned" />
                      <Picker.Item label="In-Progress" value="In-Progress" />
                      <Picker.Item label="On-Hold" value="On-Hold" />
                      <Picker.Item label="Completed" value="Completed" />
                    </Picker>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No complaints found</Text>}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 16, textAlign: 'center', color: '#0f172a' },

  // Department cards
  deptCard: {
    backgroundColor: '#dbeafe',
    padding: 18,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%', // 🔹 full width
  },
  deptText: { fontSize: 18, fontWeight: '600', color: '#1e3a8a' },
  countBadge: {
    backgroundColor: '#2563eb',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  countText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Back + centered header row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    backgroundColor: '#2563eb',
    padding: 8,
    borderRadius: 50,
    marginRight: 10,
  },
  headingCenter: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    flex: 1,
  },

  // Search bar
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
  },

  // Complaint card
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    width: '100%', // 🔹 full width
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 17, fontWeight: '700', color: '#111827' },
  statusBadge: {
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  field: { fontSize: 14, marginBottom: 3, color: '#374151' },
  label: { fontWeight: '600', color: '#1e293b' },
  raisedBy: { marginTop: 6, fontStyle: 'italic', color: '#64748b', fontSize: 13 },

  // Picker
  pickerWrapper: { marginTop: 10 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
  },
  picker: { height: 44, width: '100%' },

  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#94a3b8' },
});
