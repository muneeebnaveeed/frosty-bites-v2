import React from 'react';
import { Button as ReactButton, Spinner } from 'react-bootstrap';

function Button({
   children = null,
   disabled = false,
   icon: Icon = null,
   loading = false,
   className = '',
   spinnerAnimation = 'border',
   spinnerVariant = 'light',
   ...rest
}) {
   function renderIcon() {
      if (loading)
         return <Spinner animation={spinnerAnimation} variant={spinnerVariant} className="tw-w-[19px] tw-h-[19px]" />;
      return Icon ? (
         <div className="tw-inline-block">
            <Icon />
         </div>
      ) : null;
   }

   const buttonDisabled = disabled || loading;

   return (
      <ReactButton disabled={buttonDisabled} className={`tw-flex tw-items-center tw-gap-2 ${className}`} {...rest}>
         {renderIcon()} {children}
      </ReactButton>
   );
}

export default Button;

export { Button, Spinner };
