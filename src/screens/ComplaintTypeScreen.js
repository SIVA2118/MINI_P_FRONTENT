import React from 'react';
import BasicList from '../components/BasicList';

export default function ComplaintTypeScreen() {
  return (
    <BasicList
      master="complaint-types"
      titleField="title"
    />
  );
}
