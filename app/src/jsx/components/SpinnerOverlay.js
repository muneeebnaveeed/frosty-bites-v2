import React from 'react';
import { Spinner } from 'react-bootstrap';

const SpinnerOverlay = () => (
   <div className="tw-w-full tw-h-full tw-z-10 tw-absolute tw-left-1/2 tw-top-1/2 tw-transform tw-translate-x-[-50%] tw-translate-y-[-50%]">
      <div className="tw-w-full tw-h-full tw-bg-white tw-opacity-60 tw-flex tw-justify-center tw-items-center">
         <Spinner animation="grow" variant="primary" />
      </div>
   </div>
);

export default SpinnerOverlay;
