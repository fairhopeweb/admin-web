import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Snackbar } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Close';
import { connect } from 'react-redux';
import { fetchUsersData, deleteUserData } from '../actions/users';
import TopBar from '../components/TopBar';
import Alert from '@material-ui/lab/Alert';

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
});

class Users extends Component {

  state = {
    snackbar: null,
  }

  componentDidMount() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.props.fetch(this.props.domain.ID)
      .catch(msg => this.setState({ snackbar: msg }));
  }

  handleAdd = () => {
    this.props.history.push('/' + this.props.domain.domainname + '/users/add', {});
  }

  handleEdit = user => () => {
    this.props.history.push('/' + this.props.domain.domainname + '/users/' + user.ID, { ...user });
  }

  handleDelete = id => () => {
    this.props.delete(this.props.domain.ID, id)
      .then(() => {
        this.fetchUsers();
        this.setState({ snackbar: 'Success!' });
      })
      .catch(msg => this.setState({ snackbar: msg }));
  }

  render() {
    const { classes, users } = this.props;

    return (
      <div className={classes.root}>
        <TopBar onAdd={this.handleAdd} title="Users"/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Paper className={classes.tablePaper} elevation={2}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>username</TableCell>
                  <TableCell>real name</TableCell>
                  <TableCell>department</TableCell>
                  <TableCell>maximum space</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.Users.map((obj, idx) =>
                  <TableRow key={idx}>
                    <TableCell>{obj.username}</TableCell>
                    <TableCell>{obj.realName}</TableCell>
                    <TableCell>{obj.department}</TableCell>
                    <TableCell>{obj.maxSize}</TableCell>
                    <TableCell className={classes.flexRowEnd}>
                      <IconButton onClick={this.handleEdit(obj)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={this.handleDelete(obj.ID)}>
                        <Delete color="error"/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
          <Snackbar
            open={!!this.state.snackbar}
            onClose={() => this.setState({ snackbar: '' })}
            autoHideDuration={this.state.snackbar === 'Success!' ? 1000 : 6000}
            transitionDuration={{ appear: 250, enter: 250, exit: 0 }}
          >
            <Alert
              onClose={() => this.setState({ snackbar: '' })}
              severity={this.state.snackbar === 'Success!' ? "success" : "error"}
              elevation={6}
              variant="filled"
            >
              {this.state.snackbar}
            </Alert>
          </Snackbar>
        </div>
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
    fetch: async domainID => {
      await dispatch(fetchUsersData(domainID)).catch(error => Promise.reject(error));
    },
    delete: async (domainID, id) => {
      await dispatch(deleteUserData(domainID, id)).catch(error => Promise.reject(error));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Users)));