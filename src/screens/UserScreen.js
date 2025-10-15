// screens/UserScreen.js
import React from 'react';
import BasicList from '../components/BasicList';

export default function UserScreen() {
  return (
    <BasicList
      master="users"
      titleField="email"
      extraFields={[
        { name: 'username', label: 'Username' },
        { name: 'phone', label: 'Phone' },
        { name: 'password', label: 'Password' },
        { name: 'role', label: 'Role', type: 'picker', master: 'roles', labelKey: 'roleName' },
        { name: 'department', label: 'Department', type: 'picker', master: 'departments', labelKey: 'departmentName' },
        { name: 'programme', label: 'Programme', type: 'picker', master: 'programmes', labelKey: 'programmeName' }
      ]}
    />
  );
}
