import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container } from 'reactstrap';
import { Menu, X } from 'react-feather';

import { showRightSidebar } from '../redux/actions';

class Topbar extends Component {
    constructor(props) {
        super(props);

        this.handleRightSideBar = this.handleRightSideBar.bind(this);
    }

    /**
     * Toggles the right sidebar
     */
    handleRightSideBar = () => {
        this.props.showRightSidebar();
    };

    render() {
        return (
            <React.Fragment>
                <div className="navbar navbar-expand flex-column flex-md-row navbar-custom">
                    <Container fluid>
                        {/* logo */}
                        <Link to="/" className="navbar-brand mr-0 mr-md-2 logo">
                            <span className="logo-lg">
                                {/* <img src={logo} alt="" height="24" /> */}
                                <span className="d-inline h5 ml-2 text-logo">Frosty Bites-n-Sips</span>
                            </span>
                            <span className="logo-sm">
                                {/* <img src={logo} alt="" height="24" /> */}
                                <span className="d-inline h5 ml-2 text-logo">Frosty Bites-n-Sips</span>
                            </span>
                        </Link>

                        {/* menu*/}
                        <ul className="navbar-nav bd-navbar-nav flex-row list-unstyled menu-left mb-0">
                            <li className="">
                                <button
                                    className="button-menu-mobile open-left disable-btn"
                                    onClick={this.props.openLeftMenuCallBack}>
                                    <Menu className="menu-icon" />
                                    <X className="close-icon" />
                                </button>
                            </li>
                        </ul>
                    </Container>
                </div>
            </React.Fragment>
        );
    }
}

export default connect(null, { showRightSidebar })(Topbar);
