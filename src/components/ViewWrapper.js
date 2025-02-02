// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import TopBar from './TopBar';
import Feedback from './Feedback';
import { withTranslation } from 'react-i18next';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    padding: theme.spacing(2, 2, 2, 2),
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    overflowY: 'scroll',
  },
  toolbar: theme.mixins.toolbar,
  pageTitle: {
    margin: theme.spacing(2, 2, 2, 2),
  },
});

class ViewWrapper extends PureComponent {

  render() {
    const { classes, children, topbarTitle, snackbar, onSnackbarClose } = this.props;
    return (
      <div className={classes.root}>
        <TopBar title={topbarTitle}/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          {children}
        </div>
        <Feedback
          snackbar={snackbar || ''}
          onClose={onSnackbarClose}
        />
      </div>
    );
  }
}

ViewWrapper.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.string,
  ]).isRequired,
  topbarTitle: PropTypes.string,
  snackbar: PropTypes.string,
  onSnackbarClose: PropTypes.func,
};

export default withTranslation()(withStyles(styles)(ViewWrapper));
