// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions, CircularProgress, Grid, IconButton, 
} from '@mui/material';
import Delete from '@mui/icons-material/Close';
import Add from '@mui/icons-material/AddCircle';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { fetchDomainData } from '../../actions/domains';
import { fetchAllUsers } from '../../actions/users';
import { addRolesData, fetchPermissionsData } from '../../actions/roles';
import { fetchOrgsData } from '../../actions/orgs';
import { Autocomplete } from '@mui/lab';
import { ORG_ADMIN } from '../../constants';
import { getAutocompleteOptions } from '../../utils';

const styles = theme => ({
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

class AddRole extends PureComponent {

  state = {
    name: '',
    description: '',
    permissions: [{ permission: '', params: '', autocompleteInput: '' }],
    users: [],
    loading: false,
    autocompleteInput: '',
  }

  componentDidMount() {
    const { fetch, fetchDomains, fetchUsers, fetchOrgs } = this.props;
    fetch()
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
    fetchDomains()
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
    fetchUsers()
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
    fetchOrgs()
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleCheckbox = field => event => this.setState({
    [field]: event.target.checked,
  });

  handleAdd = () => {
    const { add, onSuccess, onError } = this.props;
    const { users, permissions } = this.state;
    this.setState({ loading: true });
    add({
      ...this.state,
      loading: undefined,
      autocompleteInput: undefined,
      users: users.map(u => u.ID),
      permissions: permissions.map(permission => {
        const params = permission.params;
        return {
          ...permission,
          autocompleteInput: undefined,
          params: params.ID,
        };
      }),
    })
      .then(() => {
        this.setState({
          name: '',
          description: '',
          autocompleteInput: '',
          permissions: [{ permission: '', params: '', autocompleteInput: '' }],
          loading: false,
        });
        onSuccess();
      })
      .catch(error => {
        onError(error);
        this.setState({ loading: false });
      });
  }

  handleAutocomplete = (field) => (e, newVal) => {
    this.setState({
      [field]: newVal,
      autocompleteInput: '',
    });
  }

  handleSelectPermission = idx => event => {
    const copy = [...this.state.permissions];
    const input = event.target.value;
    copy[idx].permission = input;
    if(input === 'SystemAdmin') {
      copy[idx].params = '';
      copy[idx].autocompleteInput = '';
    }
    this.setState({ permissions: copy });
  }

  handleSetParams = idx => (e, newVal) => {
    const copy = [...this.state.permissions];
    copy[idx].params = newVal;
    copy[idx].autocompleteInput = newVal?.domainname || newVal?.name || '';
    this.setState({ permissions: copy });
  }

  handleAutocompleteInput = idx => e => {
    const copy = [...this.state.permissions];
    copy[idx].autocompleteInput = e.target.value;
    this.setState({ permissions: copy });
  }

  handleNewRow = () => {
    const copy = [...this.state.permissions];
    copy.push({ permission: '', params: '', autocompleteInput: '' });
    this.setState({ permissions: copy });
  }

  removeRow = idx => () => {
    const copy = [...this.state.permissions];
    copy.splice(idx, 1);
    this.setState({ permissions: copy });
  }

  render() {
    const { classes, t, open, onClose, Permissions, Users, Domains, Orgs } = this.props;
    const { name, permissions, description, loading, users, autocompleteInput } = this.state;
    const orgs = [{ ID: '*', name: 'All'}].concat(Orgs);
    const domains = [{ ID: '*', domainname: 'All'}].concat(Domains);

    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('addHeadline', { item: 'Role' })}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <TextField 
              label={t("Name")}
              value={name}
              onChange={this.handleInput('name')}
              className={classes.input}
              autoFocus
              required
            />
            <Autocomplete
              multiple
              options={Users || []}
              filterOptions={getAutocompleteOptions('username')}
              noOptionsText={autocompleteInput.length < Math.round(Math.log10(Users.length) - 2) ?
                t('Filter more precisely') + '...' : t('No options')}
              value={users || []}
              onChange={this.handleAutocomplete('users')}
              getOptionLabel={(user) => user.username || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Users"
                  placeholder="Search users..."
                  className={classes.input}
                  onChange={this.handleInput('autocompleteInput')}
                />
              )}
            />
            {permissions.map((permission, idx) =>
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
                  noOptionsText={permission.autocompleteInput.length < Math.round(Math.log10(Domains.length) - 2) ?
                    t('Filter more precisely') + '...' : t('No options')}
                  onChange={this.handleSetParams(idx)}
                  getOptionLabel={(domain) => domain.domainname || ''}
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
                  value={permission.params}
                  inputValue={permission.autocompleteInput}
                  filterOptions={getAutocompleteOptions('name')}
                  noOptionsText={permission.autocompleteInput.length < Math.round(Math.log10(orgs.length) - 2) ?
                    t('Filter more precisely') + '...' : t('No options')}
                  onChange={this.handleSetParams(idx)}
                  getOptionLabel={(org) => org.name || ''}
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
            <TextField 
              className={classes.input} 
              label={t("Description")} 
              fullWidth
              multiline
              variant="outlined"
              rows={4}
              value={description}
              onChange={this.handleInput('description')}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            color="secondary"
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={this.handleAdd}
            variant="contained"
            color="primary"
            disabled={!name || loading || permissions.length === 0 || !permissions[0].permission}
          >
            {loading ? <CircularProgress size={24}/> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddRole.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  Permissions: PropTypes.array.isRequired,
  fetch: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  Domains: PropTypes.array.isRequired,
  Orgs: PropTypes.array.isRequired,
  Users: PropTypes.array.isRequired,
  fetchDomains: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  fetchOrgs: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    Permissions: state.roles.Permissions,
    Domains: state.domains.Domains,
    Users: state.users.Users,
    Orgs: state.orgs.Orgs,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () => {
      await dispatch(fetchPermissionsData({})).catch(err => Promise.reject(err));
    },
    fetchDomains: async () => await dispatch(fetchDomainData({ limit: 1000000, level: 0 }))
      .catch(err => Promise.reject(err)),
    fetchUsers: async () => await dispatch(fetchAllUsers({ sort: 'username,asc', limit: 1000000, level: 0 }))
      .catch(err => Promise.reject(err)),
    fetchOrgs: async () => await dispatch(fetchOrgsData({ sort: 'name,asc', limit: 1000000, level: 0 }))
      .catch(err => Promise.reject(err)),
    add: async role => {
      await dispatch(addRolesData(role)).catch(err => Promise.reject(err));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddRole)));
