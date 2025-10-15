import React from 'react';
import BasicList from '../components/BasicList';

export default function DepartmentScreen() {
  return (
    <BasicList
      master="departments"
      titleField="departmentName"
      extraFields={[{ name: 'shortName', label: 'Short Name' }]}
    />
  );
}
