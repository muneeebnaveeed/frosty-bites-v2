import cls from 'classnames';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { When } from 'react-if';

const getSortingIcon = ({ label, key = null, onSort = null, sort = { field: null, order: 1 } }) => (
   <strong className={cls({ 'tw-cursor-pointer': key })} onClick={key ? () => onSort(key) : null}>
      {label}
      <When condition={key}>
         <span>
            <When condition={sort.field !== key}>
               <FaSort className="d-inline mx-1" />
            </When>
            <When condition={sort.field === key && sort.order === -1}>
               <FaSortDown className="d-inline mx-1" />
            </When>
            <When condition={sort.field === key && sort.order === 1}>
               <FaSortUp className="d-inline mx-1" />
            </When>
         </span>
      </When>
   </strong>
);

export default getSortingIcon;
