import React, { useEffect, useState } from 'react';
import BasicList from '../components/BasicList';
import { listMaster } from '../services/masterService';
import { View, ActivityIndicator } from 'react-native';

export default function ProgrammeScreen() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDepartments() {
      try {
        const data = await listMaster('departments');
        const deptArray = Array.isArray(data) ? data : data?.items || [];

        const formatted = deptArray.map(dep => ({
          label: dep.departmentName || dep.name || dep.title || 'No name',
          value: dep._id || dep.id
        }));

        setDepartments(formatted);
      } catch (err) {
        console.error('Failed to load departments', err);
      } finally {
        setLoading(false);
      }
    }
    loadDepartments();
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
      master="programmes"
      titleField="programmeName"
      extraFields={[
        { name: 'shortName', label: 'Short Name' },
        {
          name: 'department',
          label: 'Department',
          type: 'picker',
          options: departments
        }
      ]}
    />
  );
}