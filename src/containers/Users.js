import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Snackbar, Typography, Button, Grid, TableSortLabel } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Delete from '@material-ui/icons/Close';
import { connect } from 'react-redux';
import { fetchUsersData, deleteUserData } from '../actions/users';
import TopBar from '../components/TopBar';
import Alert from '@material-ui/lab/Alert';
import AddUser from '../components/Dialogs/AddUser';
import DeleteUser from '../components/Dialogs/DeleteUser';
import HomeIcon from '@material-ui/icons/Home';
import blue from '../colors/blue';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    flexDirection: 'column',
    padding: theme.spacing(2),
    flex: 1,
    display: 'flex',
    overflowY: 'auto',
  },
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
  },
  tablePaper: {
    margin: theme.spacing(3, 2),
    borderRadius: 6,
  },
  grid: {
    padding: theme.spacing(0, 2),
  },
  toolbar: theme.mixins.toolbar,
  flexRowEnd: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  pageTitle: {
    margin: theme.spacing(2),
  },
  buttonGrid: {
    margin: theme.spacing(2),
  },
  pageTitleSecondary: {
    color: '#aaa',
  },
  homeIcon: {
    color: blue[500],
    position: 'relative',
    top: 4,
    left: 4,
    cursor: 'pointer',
  },
});

class Users extends Component {

  state = {
    snackbar: null,
    adding: false,
    deleting: false,
    order: 'asc',
  }

  componentDidMount() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.props.fetch(this.props.domain.ID, { sort: 'username,asc' })
      .catch(msg => this.setState({ snackbar: msg }));
  }

  handleAdd = () => this.setState({ adding: true });

  handleAddingSuccess = () => this.setState({ adding: false });

  handleAddingError = error => this.setState({ snackbar: error });

  handleDelete = user => event => {
    event.stopPropagation();
    this.setState({ deleting: user });
  }

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteSuccess = () => {
    this.setState({ deleting: false, snackbar: 'Success!' });
  }

  handleDeleteError = error => this.setState({ snackbar: error });

  handleEdit = user => () => {
    this.props.history.push('/' + this.props.domain.ID + '/users/' + user.ID, { ...user });
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  toObject(arr) {
    const obj = {};
    arr.forEach(item => obj[item.name] = item.val);
    return obj;
  }

  handleRequestSort = () => {
    const { fetch, domain } = this.props;
    const { order: stateOrder } = this.state;
    const order = stateOrder === "asc" ? "desc" : "asc";
    
    fetch(domain.ID, {
      sort: 'username' + ',' + order,
    }).catch(msg => this.setState({ snackbar: msg }));

    this.setState({
      order: order,
    });
  }

  render() {
    const { classes, t, users, domain } = this.props;
    const { snackbar, adding, deleting, order } = this.state;

    return (
      <div className={classes.root}>
        <TopBar title={domain.domainname}/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("Users")}
            <span className={classes.pageTitleSecondary}> |</span>
            <HomeIcon onClick={this.handleNavigation('')} className={classes.homeIcon}></HomeIcon>
          </Typography>
          <Grid className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleAdd}
            >
              {t('New user')}
            </Button>
          </Grid>
          <Paper className={classes.tablePaper} elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active
                      align="left" 
                      direction={order}
                      onClick={this.handleRequestSort}
                    >
                      {t('Username')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>{t('Display name')}</TableCell>
                  <TableCell>{t('Max size')}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!users.loading && users.Users.map((obj, idx) => {
                  const properties = this.toObject(obj.properties || []);
                  return <TableRow key={idx} hover onClick={this.handleEdit(obj)}>
                    <TableCell>{obj.username}</TableCell>
                    <TableCell>{properties.displayname}</TableCell>
                    <TableCell>{properties.storagequotalimit}</TableCell>
                    <TableCell className={classes.flexRowEnd}>
                      <IconButton onClick={this.handleDelete(obj)}>
                        <Delete color="error"/>
                      </IconButton>
                    </TableCell>
                  </TableRow>;
                })}
              </TableBody>
            </Table>
          </Paper>
          <Snackbar
            open={!!snackbar}
            onClose={() => this.setState({ snackbar: '' })}
            autoHideDuration={snackbar === 'Success!' ? 1000 : 6000}
            transitionDuration={{ appear: 250, enter: 250, exit: 0 }}
          >
            <Alert
              onClose={() => this.setState({ snackbar: '' })}
              severity={snackbar === 'Success!' ? "success" : "error"}
              elevation={6}
              variant="filled"
            >
              {snackbar}
            </Alert>
          </Snackbar>
        </div>
        <AddUser
          open={adding}
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
          domain={this.props.domain}
        />
        <DeleteUser
          open={!!deleting}
          onSuccess={this.handleDeleteSuccess}
          onClose={this.handleDeleteClose}
          onError={this.handleDeleteError}
          domainID={this.props.domain.ID}
          user={deleting}
        />
      </div>
    );
  }
}

Users.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  users: PropTypes.object.isRequired,
  domain: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return { users: state.users };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, params) => {
      await dispatch(fetchUsersData(domainID, params)).catch(error => Promise.reject(error));
    },
    delete: async (domainID, id) => {
      await dispatch(deleteUserData(domainID, id)).catch(error => Promise.reject(error));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Users)));