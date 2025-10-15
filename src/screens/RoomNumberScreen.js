import React, { useEffect, useState } from 'react';
import BasicList from '../components/BasicList';
import { listMaster } from '../services/masterService';
import { View, ActivityIndicator } from 'react-native';

export default function RoomScreen() {
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const deptData = await listMaster('departments');
        const progData = await listMaster('programmes');
        const blockData = await listMaster('blocks');

        setDepartments(
          (Array.isArray(deptData) ? deptData : deptData?.items || []).map(dep => ({
            label: dep.departmentName || dep.name || 'No name',
            value: dep._id
          }))
        );

        setProgrammes(
          (Array.isArray(progData) ? progData : progData?.items || []).map(prog => ({
            label: prog.programmeName || prog.name || 'No name',
            value: prog._id
          }))
        );

        setBlocks(
          (Array.isArray(blockData) ? blockData : blockData?.items || []).map(block => ({
            label: block.blockName || block.name || 'No name',
            value: block._id
          }))
        );
      } catch (err) {
        console.error('Failed to load master data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <BasicList
      master="rooms"
      titleField="roomNumber"
      extraFields={[
        { name: 'department', label: 'Department', type: 'picker', options: departments },
        { name: 'programme', label: 'Programme', type: 'picker', options: programmes },
        { name: 'block', label: 'Block', type: 'picker', options: blocks }
      ]}
    />
  );
}
