import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { asPage } from '../Middlewares/asPage';
import { authenticate } from '../Middlewares/authenticate';

class Dashboard extends React.Component {
  render() {
    return (
      <div>
        <h1>ThreeDify</h1>
        <h3>Dashboard</h3>
        <p>Welcome {this.props.user && this.props.user.username}</p>
      </div>
    );
  }
}

Dashboard.propTypes = {
  history: PropTypes.object,
  user: PropTypes.object,
};

export default asPage(withRouter(authenticate(Dashboard)));
