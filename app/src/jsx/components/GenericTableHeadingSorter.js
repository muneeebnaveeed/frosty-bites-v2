import React from 'react';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { When } from 'react-if';

const GenericTableHeadingSorter = ({ sort, children, field, onClick }) => (
   <strong className="tw-cursor-pointer" onClick={onClick}>
      {children}
      <span>
         <When condition={sort.field !== field}>
            <FaSort className="d-inline mx-1" />
         </When>
         <When condition={sort.field === field && sort.order === -1}>
            <FaSortDown className="d-inline mx-1" />
         </When>
         <When condition={sort.field === field && sort.order === 1}>
            <FaSortUp className="d-inline mx-1" />
         </When>
      </span>
   </strong>
);

export default GenericTableHeadingSorter;
