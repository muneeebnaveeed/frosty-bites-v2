import ReactSelect from 'react-select';

export const defaultSelectStyles = {
   control: (baseStyles, state) => {
      delete baseStyles['&:hover'];
      delete baseStyles.boxShadow;

      const borderColor = state.isFocused ? '#44bdec' : '#f0f1f5';

      return {
         ...baseStyles,
         borderRadius: 0,
         height: 56,
         cursor: 'pointer',
         padding: '6px 12px',
         border: `1px solid ${borderColor}`,
      };
   },
};

const selectStyles = (height) => ({
   control: (provided, state) => {
      provided.borderColor = state.menuIsOpen ? '#44bdec' : 'hsl(0, 0%, 80%)';
      provided.boxShadow = state.menuIsOpen ? '0 0 0 1px #44bdec' : '';
      provided['&:hover'] = { borderColor: '#44bdec' };
      provided.justifyContent = 'center';
      provided.paddingTop = '0.2rem';
      provided.paddingBottom = '0.2rem';
      provided.height = height;

      console.log(provided);

      return provided;
   },
   valueContainer: (provided, state) => {
      provided.justifyContent = 'center';

      return provided;
   },
   menu: (provided, state) => {
      provided.textAlign = 'center';
      return provided;
   },
   option: (provided, state) => {
      provided.backgroundColor = state.isSelected || state.isFocused ? '#44bdec' : 'transparent';

      if (state.isFocused) provided.color = 'white';
      return provided;
   },
});

const Select = ({ width = 'tw-w-[100px]', className = '', height = '36px', ...props }) => (
   <ReactSelect
      menuPlacement="auto"
      className={`${width} ${className}`}
      styles={() => selectStyles(height)}
      {...props}
   />
);

export default Select;
