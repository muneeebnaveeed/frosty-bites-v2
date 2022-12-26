import React, { Component } from 'react';

/**
 * Renders the Footer
 */
class Footer extends Component {
    render() {
        return (
            <footer className="footer">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            System developed by
                            <a target="_blank" rel="noopener noreferrer" className="ml-1">
                                Hassan Naveed +92 341 5615279
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        );
    }
}

export default Footer;
