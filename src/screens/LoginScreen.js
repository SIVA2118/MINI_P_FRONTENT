import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { login } from '../services/authService';
import { saveAuth } from '../utils/auth';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [bubbles] = useState([...Array(6)].map(() => new Animated.Value(0)));

  useEffect(() => {
    bubbles.forEach((bubble, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bubble, {
            toValue: -height,
            duration: 12000 + i * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(bubble, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const onSubmit = async () => {
    setLoading(true);
    try {
      const data = await login(email.trim(), password);
      await saveAuth(data.token, data.user);
      const role = (data.user?.role || '').toLowerCase();
      if (role.includes('super') || role.includes('admin')) {
        navigation.replace('AdminArea');
      } else {
        navigation.replace('UserArea');
      }
    } catch (e) {
      Alert.alert('Login failed', e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Big Bubbles Background */}
      {bubbles.map((bubble, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bubble,
            {
              left: Math.random() * width,
              width: 80 + Math.random() * 60, // bigger bubble
              height: 80 + Math.random() * 60,
              borderRadius: 50,
              transform: [{ translateY: bubble }],
              opacity: 0.12,
            },
          ]}
        />
      ))}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Complaint Management</Text>
        <Text style={styles.subtitle}>Login to your account</Text>

        <View style={styles.card}>
          {/* Email */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#1e40af" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#1e40af" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Sign In */}
          <TouchableOpacity
            style={styles.button}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e3a8a' },
  content: { flex: 1, justifyContent: 'center', padding: 20 },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#f1f5f9',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(241, 245, 249, 0.9)', // light bluish glass effect
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 14,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  input: { flex: 1, height: 48, fontSize: 16, color: '#0f172a', marginLeft: 8 },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 14,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  footerText: {
    textAlign: 'center',
    marginTop: 18,
    color: '#475569',
  },
  link: { color: '#1e40af', fontWeight: '700' },

  // Bubble style
  bubble: {
    position: 'absolute',
    bottom: -80,
    backgroundColor: '#60a5fa',
  },
});
