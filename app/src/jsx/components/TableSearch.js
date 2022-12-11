import React from 'react';
import cls from 'classnames';

const TableSearch = ({ style = {}, className = '', changeHandler = () => {}, ...restProps }) => (
   <input
      type="text"
      className={cls('input-rounded tw-rounded-r-none tw-pl-6 tw-shadow-inner tw-ring-1', className)}
      style={{ width: 300, ...style }}
      onChange={(e) => changeHandler(e.target.value)}
      {...restProps}
   />
);

export default TableSearch;
