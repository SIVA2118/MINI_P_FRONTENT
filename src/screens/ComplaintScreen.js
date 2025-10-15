// screens/ComplaintScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { listComplaints, createComplaint } from '../services/complaintService';
import { listMaster } from '../services/masterService';

export default function ComplaintScreen() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [remarks, setRemarks] = useState('');

  const [block, setBlock] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [complaintType, setComplaintType] = useState('');

  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [complaintTypes, setComplaintTypes] = useState([]);

  const [loading, setLoading] = useState(false);

  // Load master data
  async function loadMasters() {
    try {
      const blkData = await listMaster('blocks');
      setBlocks(Array.isArray(blkData) ? blkData : blkData.items || []);

      const roomData = await listMaster('rooms');
      setRooms(Array.isArray(roomData) ? roomData : roomData.items || []);

      const typeData = await listMaster('complainttypes');
      setComplaintTypes(Array.isArray(typeData) ? typeData : typeData.items || []);
    } catch (e) {
      console.error('Error loading master data:', e);
      Alert.alert('Error', 'Failed to load master data');
    }
  }

  // Load complaints list
  async function load() {
    setLoading(true);
    try {
      const data = await listComplaints();
      setItems(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  // Add new complaint
  async function add() {
    if (!title.trim() || !description.trim() || !block || !roomNumber || !complaintType) {
      Alert.alert('Error', 'Please fill Title, Description, Block, Room and Complaint Type');
      return;
    }

    try {
      await createComplaint({
        title: title.trim(),
        description: description.trim(),
        blockName: block,
        roomNumber,
        complaintType,
        remarks: remarks.trim(),
      });

      Alert.alert('Success', 'Complaint submitted successfully!');

      // Reset form
      setTitle('');
      setDescription('');
      setBlock('');
      setRoomNumber('');
      setComplaintType('');
      setRemarks('');

      load(); // Refresh complaints list
    } catch (e) {
      console.error('Error submitting complaint:', e);
      Alert.alert('Error', e?.response?.data?.message || e.message);
    }
  }

  useEffect(() => {
    loadMasters();
    load();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.rowTitle}>{item.title || 'No Title'}</Text>
      <Text style={styles.rowText}>Description: {item.description}</Text>
      <Text style={styles.rowText}>Block: {item.blockName}</Text>
      <Text style={styles.rowText}>Room: {item.roomNumber}</Text>
      <Text style={styles.rowText}>Type: {item.complaintType}</Text>
      <Text style={[styles.rowText, { fontWeight: '600', color: '#2563eb' }]}>
        Status: {item.status}
      </Text>
      <Text style={styles.rowTextItalic}>
        Raised by: {item.user?.username || 'Unknown'}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Fixed Create Complaint Form */}
      <View style={styles.formContainer}>
        <Text style={styles.heading}>📝 Create Complaint</Text>

        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 60 }]}
          multiline
        />

        <View style={styles.pickerWrapper}>
          <Picker selectedValue={block} onValueChange={setBlock} style={styles.picker}>
            <Picker.Item label="Select Block" value="" />
            {blocks.map(b => (
              <Picker.Item key={b._id} label={b.blockName || b.name} value={b.blockName || b.name} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Picker selectedValue={roomNumber} onValueChange={setRoomNumber} style={styles.picker}>
            <Picker.Item label="Select Room Number" value="" />
            {rooms.map(r => (
              <Picker.Item key={r._id} label={r.roomNumber || r.name} value={r.roomNumber || r.name} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Picker selectedValue={complaintType} onValueChange={setComplaintType} style={styles.picker}>
            <Picker.Item label="Select Complaint Type" value="" />
            {complaintTypes.map(c => (
              <Picker.Item key={c._id} label={c.name} value={c.name} />
            ))}
          </Picker>
        </View>

        <TextInput
          placeholder="Remarks (optional)"
          value={remarks}
          onChangeText={setRemarks}
          style={[styles.input, { height: 50 }]}
          multiline
        />

        <View style={styles.buttonContainer}>
          <Button title="Submit Complaint" onPress={add} disabled={loading} />
        </View>
      </View>

      {/* Scrollable Complaints List */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={items}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={load}
          contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
          ListHeaderComponent={<Text style={styles.heading}>📋 My Complaints</Text>}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#64748b' }}>No complaints</Text>
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    padding: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff',
    marginBottom: 8,
    fontSize: 14,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    height: 40,
    justifyContent: 'center',
  },
  picker: { 
  width: '100%', 
  height: '200%', 
  color: '#000', // <- ensures the text is visible
  fontSize: 10,
},
  buttonContainer: { marginVertical: 8 },
  row: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  rowTitle: { fontWeight: '700', fontSize: 16, marginBottom: 4, color: '#0f172a' },
  rowText: { fontSize: 14, color: '#334155', marginBottom: 2 },
  rowTextItalic: { fontSize: 13, fontStyle: 'italic', color: '#64748b' },
});
