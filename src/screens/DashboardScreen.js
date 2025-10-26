import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { getDashboardStats, listComplaints } from '../services/complaintService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(null); // track expanded section

  async function loadDashboard(showLoader = true) {
    if (showLoader) setLoading(true);
    try {
      const savedRole = await AsyncStorage.getItem('role');
      setRole(savedRole);

      const statsData = await getDashboardStats();
      setStats(statsData);

      const compData = await listComplaints();
      setComplaints(Array.isArray(compData) ? compData : []);
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
      Alert.alert('Error', e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboard(false);
  }, []);

  if (loading && !refreshing)
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;

  const roleMessage =
    role === 'SuperAdmin'
      ? 'Showing all complaints'
      : role === 'user'
      ? 'Showing only your complaints'
      : 'Showing complaints assigned to you';

  // filter complaints by status
  const pending = complaints.filter((c) => c.status === 'Pending');
  const assigned = complaints.filter((c) => c.status === 'Assigned');
  const inProgress = complaints.filter((c) => c.status === 'In-Progress');
  const onHold = complaints.filter((c) => c.status === 'On-Hold');
  const closed = complaints.filter((c) => c.status === 'Completed');

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#f59e0b'; // amber
      case 'Assigned':
        return '#3b82f6'; // blue
      case 'In-Progress':
        return '#6366f1'; // indigo
      case 'On-Hold':
        return '#ef4444'; // red
      case 'Completed':
        return '#22c55e'; // green
      default:
        return '#6b7280';
    }
  };

  const renderComplaints = (list) => {
    return list.map((c) => (
      <View key={c._id} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{c.title || c.complaintType}</Text>
          <View
            style={[styles.badge, { backgroundColor: getStatusColor(c.status) }]}
          >
            <Text style={styles.badgeText}>{c.status}</Text>
          </View>
        </View>
        <Text style={styles.small}>
          🏠 Room: {c.roomNumber} | Block: {c.blockName}
        </Text>
        <Text style={styles.small}>
          🙍 Raised by: {c.user?.username || 'Unknown'}
        </Text>
        {c.description ? <Text style={styles.desc}>{c.description}</Text> : null}
      </View>
    ));
  };

  // reusable expandable section
  const renderSection = (title, data, key, gradient) => (
    <View>
      <TouchableOpacity
        style={[styles.sectionHeader, { backgroundColor: gradient }]}
        onPress={() => setExpanded(expanded === key ? null : key)}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.arrow}>{expanded === key ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      {expanded === key &&
        (data.length > 0 ? (
          renderComplaints(data)
        ) : (
          <Text style={styles.emptyText}>No {title.toLowerCase()}</Text>
        ))}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ paddingBottom: 100 }} // extra bottom space
    >
      <Text style={styles.heading}>📊 Complaints Dashboard</Text>
      <Text style={styles.roleNote}>{roleMessage}</Text>

      {/* Stats Overview */}
      {stats && (
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
            <Text style={styles.statNumber}>{stats.assigned}</Text>
            <Text style={styles.statLabel}>Assigned</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#e0e7ff' }]}>
            <Text style={styles.statNumber}>{stats.inProgress || 0}</Text>
            <Text style={styles.statLabel}>In-Progress</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
            <Text style={styles.statNumber}>{stats.onHold || 0}</Text>
            <Text style={styles.statLabel}>On-Hold</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
            <Text style={styles.statNumber}>{stats.closed}</Text>
            <Text style={styles.statLabel}>Closed</Text>
          </View>
        </View>
      )}

      {/* Expandable Sections */}
      {renderSection('⏳ Pending Complaints', pending, 'pending', '#fff7ed')}
      {renderSection('📌 Assigned Complaints', assigned, 'assigned', '#eff6ff')}
      {renderSection('🚧 In-Progress Complaints', inProgress, 'inProgress', '#f5f3ff')}
      {renderSection('⏸ On-Hold Complaints', onHold, 'onHold', '#fff1f2')}
      {renderSection('✅ Closed Complaints', closed, 'closed', '#f0fdf4')}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#0f172a',
  },
  roleNote: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
    color: '#475569',
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  statLabel: { fontSize: 14, color: '#374151', marginTop: 4 },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b' },
  arrow: { fontSize: 16, color: '#475569' },

  // Complaint Card
  card: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: { fontWeight: '700', fontSize: 16, color: '#0f172a' },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  small: { fontSize: 13, color: '#475569', marginBottom: 2 },
  desc: { fontSize: 13, color: '#334155', marginTop: 6, lineHeight: 18 },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 8,
  },
});
