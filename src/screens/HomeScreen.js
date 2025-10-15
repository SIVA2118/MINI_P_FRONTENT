import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <View style={{height: 16}} />
      <Button title="Go to User Area" onPress={() => navigation.navigate('UserArea')} />
      <View style={{height: 8}} />
      <Button title="Go to Admin Area" onPress={() => navigation.navigate('AdminArea')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '600' }
});
