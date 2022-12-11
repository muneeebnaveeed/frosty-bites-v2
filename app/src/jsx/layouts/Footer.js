import React from 'react';

const year = new Date().getFullYear();

const Footer = () => (
   <div className="footer" style={{ position: 'absolute', right: 0, bottom: 0 }}>
      <div className="copyright">
         <p>
            Copyright © Designed &amp; Developed by{' '}
            <a href="http://github.com/hassannaveed24" target="_blank" rel="noreferrer">
               Hassan Naveed
            </a>{' '}
            {year}
         </p>
      </div>
   </div>
);

export default Footer;
