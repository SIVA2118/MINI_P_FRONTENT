import React from 'react';
import BasicList from '../components/BasicList';

export default function RoleScreen() {
  return (
    <BasicList
      master="roles"
      titleField="roleName"  // <-- match backend schema
    />
  );
}
