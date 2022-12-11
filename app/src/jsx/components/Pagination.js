import cls from 'classnames';
import { useState } from 'react';
import { AiOutlineDoubleLeft, AiOutlineDoubleRight, AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import Select from './Select';

const getOption = (v) => ({ value: v, label: v });
const options = [getOption(5), getOption(10), getOption(25)];

const PaginationItem = ({
   children,
   className = '',
   disabled,
   first = false,
   last = false,
   active = false,
   ...props
}) => (
   <li
      {...props}
      className={cls(
         'tw-transition-all tw-cursor-pointer tw-flex tw-items-center tw-text-[#7E7E7E] tw-px-[12px] tw-py-[6px] tw-bg-white tw-border tw-border-solid',
         className,
         { 'tw-border-[#44bdec] tw-bg-[#44bdec] tw-text-white': active },
         { 'tw-cursor-not-allowed': disabled },
         { 'hover:tw-border-[#44bdec] hover:tw-bg-[#44bdec] hover:tw-text-white': !disabled },
         { 'tw-rounded-l-md': first },
         { 'tw-rounded-r-md': last }
      )}
   >
      {children}
   </li>
);

const FirstPage = (props) => (
   <PaginationItem first {...props}>
      <AiOutlineDoubleLeft />
   </PaginationItem>
);

const PrevPage = (props) => (
   <PaginationItem {...props}>
      <AiOutlineLeft />
   </PaginationItem>
);

const EllipsisPage = (props) => (
   <PaginationItem disabled {...props}>
      ...
   </PaginationItem>
);

const NextPage = (props) => (
   <PaginationItem {...props}>
      <AiOutlineRight />
   </PaginationItem>
);

const LastPage = (props) => (
   <PaginationItem last {...props}>
      <AiOutlineDoubleRight />
   </PaginationItem>
);

const Page = ({ children, ...props }) => <PaginationItem {...props}>{children}</PaginationItem>;

const Pagination = ({
   isDisabled = false,
   page,
   onPageChange,
   onLimitChange,
   totalPages,
   hasNextPage,
   hasPrevPage,
   totalDocs,
}) => {
   const [option, setOption] = useState(getOption(5));

   const renderPagination = () => {
      const pages = [];

      const handleFirstPage = () => {
         if (page > 1) onPageChange(1);
      };

      const handlePrevPage = () => {
         if (page > 1) onPageChange((prev) => prev - 1);
      };

      const handleNextPage = () => {
         if (page < totalPages) onPageChange((prev) => prev + 1);
      };

      const handleLastPage = () => {
         if (page < totalPages) onPageChange(totalPages);
      };

      pages.push(<FirstPage disabled={page === 1 || isDisabled} onClick={handleFirstPage} />);
      pages.push(<PrevPage disabled={page === 1 || isDisabled} onClick={handlePrevPage} />);

      for (let currPage = 0; currPage < totalPages; currPage++) {
         pages.push(
            <Page active={page === currPage + 1} disabled={isDisabled} onClick={() => onPageChange(currPage + 1)}>
               {currPage + 1}
            </Page>
         );
      }

      pages.push(<NextPage disabled={!hasNextPage || isDisabled} onClick={handleNextPage} />);
      pages.push(<LastPage disabled={!hasNextPage || isDisabled} onClick={handleLastPage} />);

      return pages;
   };

   return (
      <div className="tw-flex tw-flex-col tw-items-center tw-gap-3 tw-overflow-visible">
         <p className="tw-m-0">{`Showing ${
            // eslint-disable-next-line no-nested-ternary
            totalPages === page ? totalDocs : page * option.value > totalDocs ? totalDocs : page * option.value
         } of ${totalDocs}`}</p>
         <ul className="tw-flex ">{renderPagination()}</ul>
         <Select
            isDisabled={isDisabled}
            className="tw-mb-6"
            options={options}
            placeholder="Select Page Size"
            value={option}
            onChange={(opt) => {
               setOption(opt);
               onLimitChange(opt.value);
            }}
         />
      </div>
   );
};

export default Pagination;
