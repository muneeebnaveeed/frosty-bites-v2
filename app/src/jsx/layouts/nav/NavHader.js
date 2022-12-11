import React, { useState } from 'react';

/// React router dom
import { Link } from 'react-router-dom';

/// images
import logo from '../../../images/logo.png';
import logoText from '../../../images/logo-text.png';

const NavHader = () => {
   const [toggle, setToggle] = useState(false);
   return (
      <div className="nav-header">
         <Link to="/" className="brand-logo">
            {/* <img className="logo-abbr" src={logo} alt="" />
            <img className="logo-compact" src={logoText} alt="" /> */}
            {/* <img className="brand-title" src={logoText} alt="" /> */}
            <h1 className="brand-title tw-text-2xl tw-text-black tw-font-bold">Frosty Bites N Sips</h1>
         </Link>

         <div className="nav-control" role="button" tabIndex="0" onClick={() => setToggle(!toggle)}>
            <div className={`hamburger ${toggle ? 'is-active' : ''}`}>
               <span className="line" />
               <span className="line" />
               <span className="line" />
            </div>
         </div>
      </div>
   );
};

export default NavHader;
