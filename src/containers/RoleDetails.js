// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  Button,
  MenuItem,
  IconButton,
} from '@mui/material';
import { fetchAllUsers } from '../actions/users';
import { connect } from 'react-redux';
import Add from '@mui/icons-material/AddCircle';
import Delete from '@mui/icons-material/Delete';
import { fetchPermissionsData, editRoleData, fetchRoleData } from '../actions/roles';
import { getAutocompleteOptions, getStringAfterLastSlash } from '../utils';
import { fetchDomainData } from '../actions/domains';
import { Autocomplete } from '@mui/lab';
import { fetchOrgsData } from '../actions/orgs';
import { ORG_ADMIN, SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';

const styles = theme => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  select: {
    minWidth: 60,
  },
  rowTextfield: {
    margin: theme.spacing(0, 1, 0, 1),
  },
  row: {
    marginLeft: 8,
    display: 'flex',
    alignItems: 'flex-end',
  },
  addButton: {
    marginTop: 8,
  },
});

class RoleDetails extends PureComponent {

  state = {
    role: {
      users: [],
      permissions: [],
    },
    autocompleteInput: '',
    snackbar: '',
  };


  async componentDidMount() {
    const { fetch, fetchUser, fetchDomains, fetchPermissions, fetchOrgs } = this.props;
    await fetchDomains().catch(err => this.setState({ snackbar: err }));
    await fetchOrgs().catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
    const role = await fetch(getStringAfterLastSlash());
    this.setState({ role });
    fetchUser().catch(err => this.setState({ snackbar: err }));
    fetchPermissions().catch(err => this.setState({ snackbar: err }));
  }

  handleRoleInput = field => event => {
    this.setState({
      role: {
        ...this.state.role,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleAutocomplete = (field) => (e, newVal) => {
    this.setState({
      role: {
        ...this.state.role,
        [field]: newVal,
      },
      unsaved: true,
      autocompleteInput: '',
    });
  }

  handleEdit = () => {
    const { role } = this.state;
    this.props.edit({
      ...role,
      users: role.users.map(user => user.ID),
      permissions: role.permissions.map(perm => {
        return {
          ...perm,
          params: perm.params?.ID ? perm.params.ID : perm.params,
          autocompleteInput: undefined,
        };
      }),
    })
      .then(() => this.setState({ snackbar: 'Success!', autocompleteInput: '' }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handleSelectPermission = idx => event => {
    const copy = [...this.state.role.permissions];
    const input = event.target.value;
    copy[idx].permission = input;
    if(input === 'SystemAdmin') {
      copy[idx].params = '';
      copy[idx].autocompleteInput = '';
    }
    this.setState({
      role: {
        ...this.state.role,
        permissions: copy,
      },
    });
  }

  handleSetParams = idx => (e, newVal) => {
    const copy = [...this.state.role.permissions];
    copy[idx].params = newVal;
    copy[idx].autocompleteInput = newVal?.domainname || '';
    this.setState({
      role: {
        ...this.state.role,
        permissions: copy,
      },
    });
  }

  handleAutocompleteInput = idx => e => {
    const copy = [...this.state.role.permissions];
    copy[idx].autocompleteInput = e.target.value;
    this.setState({
      role: {
        ...this.state.role,
        permissions: copy,
      },
    });
  }

  handleNewRow = () => {
    const copy = [...this.state.role.permissions];
    copy.push({ permission: '', params: '', autocompleteInput: '' });
    this.setState({
      role: {
        ...this.state.role,
        permissions: copy,
      },
    });
  }

  removeRow = idx => () => {
    const copy = [...this.state.role.permissions];
    copy.splice(idx, 1);
    this.setState({
      role: {
        ...this.state.role,
        permissions: copy,
      },
    });
  }

  render() {
    const { classes, t, Users, Permissions, Domains, Orgs } = this.props;
    const { snackbar, role, autocompleteInput } = this.state;
    const { name, description, users, permissions } = role;
    const domains = [{ ID: '*', domainname: 'All'}].concat(Domains);
    const orgs = [{ ID: '*', name: 'All'}].concat(Orgs);
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);
    return (
      <ViewWrapper
        topbarTitle={t('Role')}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <Paper className={classes.paper} elevation={1}>
          <Grid container>
            <Typography
              color="primary"
              variant="h5"
            >
              {t('editHeadline', { item: 'Role' })}
            </Typography>
          </Grid>
          <FormControl className={classes.form}>
            <TextField 
              className={classes.input} 
              label={t("Name")} 
              fullWidth
              autoFocus
              value={name || ''}
              onChange={this.handleRoleInput('name')}
            />
            <TextField 
              className={classes.input} 
              label={t("Description")} 
              fullWidth
              multiline
              variant="outlined"
              rows={4}
              value={description || ''}
              onChange={this.handleRoleInput('description')}
            />
            <Autocomplete
              multiple
              options={Users || []}
              value={users || []}
              onChange={this.handleAutocomplete('users')}
              filterOptions={getAutocompleteOptions('username')}
              noOptionsText={autocompleteInput.length < Math.round(Math.log10(Users.length) - 2) ?
                t('Filter more precisely') + '...' : t('No options')}
              getOptionLabel={(user) => user.username || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Users"
                  placeholder="Search users..."
                  className={classes.input}
                />
              )}
            />
            {(permissions || []).map((permission, idx) =>
              <div key={idx} className={classes.row}>
                <TextField
                  select
                  label={t("Permission")}
                  value={permission.permission || ''}
                  onChange={this.handleSelectPermission(idx)}
                  fullWidth
                  variant="standard"
                >
                  {Permissions.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </TextField>
                {permission.permission.includes('DomainAdmin') /*Read and Write*/ && <Autocomplete
                  options={domains || []}
                  value={permission.params}
                  inputValue={permission.autocompleteInput}
                  filterOptions={getAutocompleteOptions('domainname')}
                  noOptionsText={
                    (permission.autocompleteInput || '').length < Math.round(Math.log10(Domains.length) - 2) ?
                      t('Filter more precisely') + '...' : t('No options')
                  }
                  onChange={this.handleSetParams(idx)}
                  getOptionLabel={(domainID) => domainID.domainname ||
                      (domains || []).find(d => d.ID === domainID)?.domainname || ''} // Because only ID is received
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Params"
                      placeholder="Search domains..."
                      onChange={this.handleAutocompleteInput(idx)}
                      variant="standard"
                    />
                  )}
                  className={classes.rowTextfield}
                  fullWidth
                  autoSelect
                />}
                {permission.permission === ORG_ADMIN && <Autocomplete
                  options={orgs || []}
                  filterOptions={getAutocompleteOptions('name')}
                  noOptionsText={autocompleteInput.length < Math.round(Math.log10(orgs.length) - 2) ?
                    t('Filter more precisely') + '...' : t('No options')}
                  value={permission.params}
                  onChange={this.handleSetParams(idx)}
                  getOptionLabel={(orgID) => orgID.name ||
                      (orgs || []).find(o => o.ID === orgID)?.name || ''} // Because only ID is received
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Params"
                      placeholder="Search organizations..."
                      onChange={this.handleAutocompleteInput(idx)}
                      variant="standard"
                    />
                  )}
                  className={classes.rowTextfield}
                  fullWidth
                  autoSelect
                />}
                <IconButton size="small" onClick={this.removeRow(idx)}>
                  <Delete fontSize="small" color="error" />
                </IconButton>
              </div>
            )}
            <Grid container justifyContent="center" className={classes.addButton}>
              <Button size="small" onClick={this.handleNewRow}>
                <Add color="primary" />
              </Button>
            </Grid>
          </FormControl>
          <Button
            color="secondary"
            onClick={() => this.props.history.push('/roles')}
            style={{ marginRight: 8 }}
          >
            {t('Back')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleEdit}
            disabled={!writable}
          >
            {t('Save')}
          </Button>
        </Paper>
      </ViewWrapper>
    );
  }
}

RoleDetails.contextType = CapabilityContext;
RoleDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchUser: PropTypes.func.isRequired,
  fetchDomains: PropTypes.func.isRequired,
  fetchPermissions: PropTypes.func.isRequired,
  fetchOrgs: PropTypes.func.isRequired,
  Users: PropTypes.array.isRequired,
  Permissions: PropTypes.array.isRequired,
  Domains: PropTypes.array.isRequired,
  Orgs: PropTypes.array.isRequired,
};

const mapStateToProps = state => {
  return {
    Users: state.users.Users,
    Permissions: state.roles.Permissions,
    Domains: state.domains.Domains,
    Orgs: state.orgs.Orgs,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async role => {
      await dispatch(editRoleData(role)).catch(message => Promise.reject(message));
    },
    fetchUser: async () => {
      await dispatch(fetchAllUsers({ sort: 'username,asc', limit: 1000000, level: 0 }))
        .catch(message => Promise.reject(message));
    },
    fetchDomains: async () => {
      await dispatch(fetchDomainData({ limit: 1000000, level: 0 })).catch(message => Promise.reject(message));
    },
    fetchPermissions: async () => {
      await dispatch(fetchPermissionsData({})).catch(message => Promise.reject(message));
    },
    fetchOrgs: async () => await dispatch(fetchOrgsData({ sort: 'name,asc', limit: 1000000, level: 0 }))
      .catch(err => Promise.reject(err)),
    fetch: async id => await dispatch(fetchRoleData(id))
      .then(role => role)
      .catch(message => Promise.reject(message)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(RoleDetails)));
