import React from 'react';
import { Breadcrumb } from 'react-bootstrap';

const PageTitle = ({ motherMenu, activeMenu }) => (
   <div className="page-titles">
      <Breadcrumb>
         <Breadcrumb.Item>
            <button type="button">{motherMenu}</button>
         </Breadcrumb.Item>
         <Breadcrumb.Item active>
            <button type="button">{activeMenu}</button>
         </Breadcrumb.Item>
      </Breadcrumb>
   </div>
);

export default PageTitle;
