import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Button, Hidden, IconButton } from '@material-ui/core';
import Add from '@material-ui/icons/Add';
import { fetchDomainData } from '../actions/domains';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Burger from '@material-ui/icons/Menu';
import { setDrawerExpansion } from '../actions/drawer';

const styles = theme => ({
  root: {
    [theme.breakpoints.up('lg')]: {
      marginLeft: 260,
    },
  },
  title: {
    flexGrow: 1,
    fontWeight: 500,
  },
  burger: {
    marginRight: 16,
  },
});

class TopBar extends PureComponent {

  handleMenuToggle = async () => {
    const { setDrawerExpansion } = this.props;
    setDrawerExpansion();
  }

  render() {
    const { classes, title, onAdd } = this.props;
    return (
      <AppBar className={classes.root}>
        <Toolbar className={classes.root}>
          <Hidden lgUp>
            <IconButton color="inherit" onClick={this.handleMenuToggle}>
              <Burger />
            </IconButton>
          </Hidden>
          <Typography className={classes.title} variant="h6">{title}</Typography>
          {onAdd && <Button onClick={onAdd} color="inherit">
            <Add />Add
          </Button>}
        </Toolbar>
      </AppBar>
    );
  }
}

TopBar.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string,
  fetchDomains: PropTypes.func.isRequired,
  setDrawerExpansion: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  Domains: PropTypes.array.isRequired,
  onAdd: PropTypes.func,
};

const mapStateToProps = state => {
  return { Domains: state.domains.Domains };
};

const mapDispatchToProps = dispatch => {
  return {
    setDrawerExpansion: () => {
      dispatch(setDrawerExpansion());
    },
    fetchDomains: async () => {
      await dispatch(fetchDomainData()).catch(() => { });
    },
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles)(TopBar)));