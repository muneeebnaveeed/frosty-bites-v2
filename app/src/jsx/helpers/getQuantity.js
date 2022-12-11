import { Fragment } from 'react';

/* eslint-disable prefer-destructuring */
export default (array) => {
   if (!array) return null;
   if (array[0] > 0) return `${array[0]} Units`;
   return `${array[1]} ${array[1] > 0 ? 'Singles' : ''}`;
};
