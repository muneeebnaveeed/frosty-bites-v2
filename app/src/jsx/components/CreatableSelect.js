import Creatable from 'react-select/creatable';

const selectStyles = {
   control: (provided, state) => {
      provided.borderColor = state.menuIsOpen ? '#44bdec' : 'hsl(0, 0%, 80%)';
      provided.boxShadow = state.menuIsOpen ? '0 0 0 1px #44bdec' : '';
      provided['&:hover'] = { borderColor: '#44bdec' };
      provided.justifyContent = 'center';
      provided.paddingTop = '0.2rem';
      provided.paddingBottom = '0.2rem';

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
};

const Select = ({ className = '', ...props }) => (
   <Creatable menuPlacement="auto" className={`tw-w-[auto] ${className}`} styles={selectStyles} {...props} />
);

export default Select;
