// screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUser, clearAuth } from '../utils/auth';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => setUser(await getUser()))();
  }, []);

  const logout = async () => {
    await clearAuth();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const initials =
    (user?.username || user?.email || '?')
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <View style={styles.container}>
      {/* Decorative background blobs (no extra libs) */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <Text style={styles.screenTitle}>Profile</Text>

      <View style={styles.card}>
        {/* Header / avatar */}
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.username || '—'}</Text>
            <Text style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={14} /> {user?.role || '—'}
            </Text>
          </View>
        </View>

        {/* Info rows */}
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={20} color="#334155" />
          <View style={styles.infoTextWrap}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email || '—'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="person" size={20} color="#334155" />
          <View style={styles.infoTextWrap}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{user?.username || '—'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="shield" size={20} color="#334155" />
          <View style={styles.infoTextWrap}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{user?.role || '—'}</Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.button} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CARD_BG = 'rgba(255,255,255,0.9)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2563EB', // base brand color
    padding: 16,
    justifyContent: 'flex-start',
  },
  screenTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: CARD_BG, // transparent card
    borderRadius: 20,
    padding: 16,
    gap: 12,
    // soft shadow
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(37,99,235,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#1e293b',
    fontWeight: '800',
    fontSize: 18,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  roleBadge: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(15,23,42,0.03)',
    padding: 10,
    borderRadius: 12,
    gap: 10,
  },
  infoTextWrap: { flex: 1 },
  label: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#1f2937',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  // Decorative background blobs
  blob: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.25,
  },
  blob1: {
    backgroundColor: '#60A5FA',
    top: -40,
    right: -40,
  },
  blob2: {
    backgroundColor: '#93C5FD',
    bottom: -60,
    left: -40,
  },
});
