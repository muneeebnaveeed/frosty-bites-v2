import React from 'react';
import { withResizeDetector } from 'react-resize-detector';
import { QueryClient, QueryClientProvider } from 'react-query';

/// Components
import Markup from './jsx';

/// Style
import './vendor/bootstrap-select/dist/css/bootstrap-select.min.css';
import './css/tailwind.build.css';
import './css/style.css';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient();

const App = ({ width }) => {
    const body = document.querySelector('body');

    if (width >= 1300) body.setAttribute('data-sidebar-style', 'full');
    else if (width <= 1299 && width >= 767) body.setAttribute('data-sidebar-style', 'mini');
    else body.setAttribute('data-sidebar-style', 'overlay');

    return (
        <QueryClientProvider client={queryClient}>
            <Markup />
        </QueryClientProvider>
    );
};

export default withResizeDetector(App);
