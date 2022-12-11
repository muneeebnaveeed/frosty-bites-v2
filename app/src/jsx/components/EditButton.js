import React from 'react';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';
// eslint-disable-next-line import/no-named-as-default
import Button from './Button';

const EditButton = ({ size = 'sm', children = 'Edit', onClick }) => (
   <Button variant="secondary" size={size} icon={AiFillEdit} onClick={onClick}>
      {children}
   </Button>
);

export default EditButton;
