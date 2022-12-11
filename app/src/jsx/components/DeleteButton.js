import React from 'react';
import { AiFillDelete } from 'react-icons/ai';
// eslint-disable-next-line import/no-named-as-default
import Button from './Button';

const DeleteButton = ({ size = 'sm', children = 'Delete', onClick }) => (
   <Button variant="danger" size={size} icon={AiFillDelete} onClick={onClick}>
      {children}
   </Button>
);

export default DeleteButton;
