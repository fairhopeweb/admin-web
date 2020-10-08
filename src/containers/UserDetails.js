import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Button,
  DialogTitle,
  DialogContent, Dialog, DialogActions, Select, FormLabel, Snackbar, InputLabel, Input, Chip,
} from '@material-ui/core';
import moment from 'moment';
import { connect } from 'react-redux';
import { editUserData } from '../actions/users';
import TopBar from '../components/TopBar';
import { changeUserPassword } from '../api';
import { fetchGroupsData } from '../actions/groups';
import { timezones } from '../res/timezones';
import { fetchAreasData } from '../actions/areas';
import { fetchRolesData } from '../actions/roles';
import Alert from '@material-ui/lab/Alert';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    padding: theme.spacing(2, 2),
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    overflowY: 'scroll',
  },
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(2),
  },
  toolbar: theme.mixins.toolbar,
  gird: {
    display: 'flex',
  },
  select: {
    minWidth: 60,
  },
});

class UserDetails extends PureComponent {

  constructor(props) {
    super(props);
    const user = props.location.state;
    if(!user) {
      this.state = {
        changes: {
          roles: [],
        },
        changingPw: false,
        newPw: '',
        checkPw: '',
        snackbar: '',
        sizeUnit: 0,
      };
      props.history.push('/' + props.domain.domainname + '/users');
    }
    else this.state = {
      changes: {
        ...user,
        username: user.username.slice(0, user.username.indexOf('@')),
        roles: user.roles || [],
      },
      changingPw: false,
      newPw: '',
      checkPw: '',
      snackbar: '',
      sizeUnit: 0,
    };
  }

  types = [
    { name: 'Normal', ID: 0 },
    { name: 'Room', ID: 1 },
    { name: 'Equipment', ID: 2 },
  ]

  statuses = [
    { name: 'Normal', ID: 0 },
    { name: 'Suspended', ID: 1 },
    { name: 'Out of date', ID: 2 },
    { name: 'Deleted', ID: 3 },
  ]

  expires = [
    { name: '1 week', ID: 0 },
    { name: '1 month', ID: 1 },
    { name: '1 year', ID: 2 },
    { name: '100 years', ID: 3 },
    { name: 'Never', ID: 4 },
  ]

  timeZones = [-12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, 1, 0,
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  componentDidMount() {
    const { changes } = this.state;
    const { fetchAreas, fetchRoles, fetchGroupsData } = this.props;
    fetchAreas()
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
    fetchRoles()
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
    fetchGroupsData()
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
    const maxSize = changes.maxSize;
    if(maxSize % 1048576 === 0) {
      this.setState({
        changes: {
          ...changes,
          maxSize: maxSize / 1048576,
        },
        sizeUnit: 2,
      });
    } else if (maxSize % 1024 === 0) {
      this.setState({
        changes: {
          ...changes,
          maxSize: maxSize / 1024,
        },
        sizeUnit: 1,
      });
    }
  }

  handleInput = field => event => {
    this.setState({
      changes: {
        ...this.state.changes,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handleCheckbox = field => event => this.setState({
    changes: {
      ...this.state.changes,
      [field]: event.target.checked,
    },
    unsaved: true,
  });

  handleNumberInput = field => event => {
    let input = event.target.value;
    if(input && input.match("^\\d*?$")) input = parseInt(input);
    this.setState({
      changes: {
        ...this.state.changes,
        [field]: input,
      },
    });
  }

  handleEdit = () => {
    const { changes, sizeUnit } = this.state;
    this.props.edit(this.props.domain.ID, {
      ...changes,
      createDay: moment(changes.createDay).format('YYYY-MM-DD HH:mm').toString(),
      password: undefined,
      maxSize: changes.maxSize << (10 * sizeUnit),
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handlePasswordChange = async () => {
    const { changes, newPw } = this.state;
    await changeUserPassword(this.props.domain.ID, changes.ID, newPw);
    this.setState({ changingPw: false });
  }

  handleKeyPress = event => {
    const { newPw, checkPw } = this.state;
    if(event.key === 'Enter' && newPw === checkPw) this.handlePasswordChange();
  }

  handleUnitChange = event => this.setState({ sizeUnit: event.target.value });

  handleMultiSelect = event => {
    this.setState({
      changes: {
        ...this.state.changes,
        roles: event.target.value,
      },
    });
  };

  render() {
    const { classes, t, groups, domain, Roles } = this.props;
    const { changes, changingPw, newPw, checkPw, sizeUnit, snackbar } = this.state;

    return (
      <div className={classes.root}>
        <TopBar title={t("Users")}/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={2}>
            <Grid container>
              <Typography
                color="primary"
                variant="h5"
              >
                {t('editHeadline', { item: 'User' })}
              </Typography>
            </Grid>
            <FormControl className={classes.form}>
              <Grid container className={classes.input}>
                <TextField 
                  label={t("Username")}
                  value={changes.username || ''}
                  autoFocus
                  onChange={this.handleInput('username')}
                  style={{ flex: 1, marginRight: 8 }}
                  InputProps={{
                    endAdornment: <div>@{domain.domainname}</div>,
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => this.setState({ changingPw: true })}
                  size="small"
                >
                  {t('Change password')}
                </Button>
              </Grid>
              <TextField
                select
                className={classes.input}
                label={t("Password expiration time")}
                fullWidth
                value={changes.expire || 0}
                onChange={this.handleInput('expire')}
              >
                {this.expires.map((expire, key) => (
                  <MenuItem key={key} value={expire.ID}>
                    {expire.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                className={classes.input}
                label={t("Status")}
                fullWidth
                value={changes.addressStatus || 0}
                onChange={this.handleInput('addressStatus')}
              >
                {this.statuses.map((status, key) => (
                  <MenuItem key={key} value={status.ID}>
                    {status.name}
                  </MenuItem>
                ))}
              </TextField>
              <FormControl className={classes.input}>
                <InputLabel id="demo-mutiple-chip-label">{t('Roles')}</InputLabel>
                <Select
                  labelId="demo-mutiple-chip-label"
                  id="demo-mutiple-chip"
                  multiple
                  value={changes.roles || []}
                  onChange={this.handleMultiSelect}
                  input={<Input id="select-multiple-chip" />}
                  disabled
                  renderValue={selected => 
                    <div className={classes.chips}>
                      {selected.map(value => 
                        <Chip key={value.ID} label={value.name} className={classes.chip} />
                      )}
                    </div>
                  }
                >
                  {(Roles || []).map(role => (
                    <MenuItem selected={changes.roles.includes(role)} key={role.ID} value={role}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                className={classes.input}
                label={t("Data area")}
                fullWidth
                value={changes.maildir || ''}
                onChange={this.handleInput('areaID')}
                disabled
              />
              <TextField
                select
                className={classes.input}
                label={t("Group")}
                fullWidth
                value={changes.groupID || 0}
                onChange={this.handleInput('groupID')}
              >
                <MenuItem value={0}>
                  {t('Direct user')}
                </MenuItem>
                {groups.Groups.map((group, key) => (
                  <MenuItem key={key} value={group.ID}>
                    {group.groupname}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                className={classes.input}
                label={t("Type")}
                fullWidth
                value={changes.subType || 0}
                onChange={this.handleInput('subType')}
              >
                {this.types.map((type, key) => (
                  <MenuItem key={key} value={type.ID}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                className={classes.input}
                label={t("Language")}
                fullWidth
                value={changes.lang || 0}
                onChange={this.handleInput('lang')}
              >
                <MenuItem value={0}>
                  {t('english')}
                </MenuItem>
              </TextField>
              <FormControl>
                <FormLabel>{t("Timezone")}</FormLabel>
                <Select
                  className={classes.input}
                  fullWidth
                  native
                  value={changes.timezone || 427} // Default: Berlin
                  onChange={this.handleInput('timezone')}
                >
                  {timezones.map((zone, key) => (
                    <option key={key} value={key}>
                      {zone.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <TextField 
                className={classes.input} 
                label={t("Maximum space")} 
                fullWidth 
                value={changes.maxSize || ''}
                onChange={this.handleNumberInput('maxSize')}
                InputProps={{
                  endAdornment:
                    <FormControl>
                      <Select
                        onChange={this.handleUnitChange}
                        value={sizeUnit}
                        className={classes.select}
                      >
                        <MenuItem value={0}>MiB</MenuItem>
                        <MenuItem value={1}>GiB</MenuItem>
                        <MenuItem value={2}>TiB</MenuItem>
                      </Select>
                    </FormControl>,
                }}
              />
              <TextField 
                className={classes.input}
                label={t("Job title")}
                fullWidth
                value={changes.title || ''}
                onChange={this.handleInput('title')}
              />
              <TextField 
                className={classes.input}
                label={t("Display name")}
                fullWidth
                value={changes.realName || ''}
                onChange={this.handleInput('realName')}
              />
              <TextField 
                className={classes.input} 
                label={t("Nickname")} 
                fullWidth 
                value={changes.nickname || ''}
                onChange={this.handleInput('nickname')}
              />
              <TextField 
                className={classes.input} 
                label={t("Telephone")} 
                fullWidth 
                value={changes.tel || ''}
                onChange={this.handleInput('tel')}
              />
              <TextField 
                className={classes.input} 
                label={t("Mobile phone")} 
                fullWidth 
                value={changes.mobilePhone || ''}
                onChange={this.handleInput('mobilePhone')}
              />
              <TextField 
                className={classes.input} 
                label={t("Home address")} 
                fullWidth 
                value={changes.homeaddress || ''}
                onChange={this.handleInput('homeaddress')}
              />
              <TextField 
                className={classes.input} 
                label={t("Memo")} 
                fullWidth
                value={changes.memo || ''}
                onChange={this.handleInput('memo')}
              />
            </FormControl>
            <Grid container className={classes.input}>
              <FormControlLabel
                label={t('Allow pop3 or imap downloading')}
                control={
                  <Checkbox
                    checked={changes.pop3_imap || false}
                    onChange={this.handleCheckbox('pop3_imap')}
                  />
                }
              />
              <FormControlLabel
                label={t('Allow smtp sending')}
                control={
                  <Checkbox
                    checked={changes.smtp || false}
                    onChange={this.handleCheckbox('smtp')}
                  />
                }
              />
              <FormControlLabel
                label={t('Allow change password')}
                control={
                  <Checkbox
                    checked={changes.changePassword || false}
                    onChange={this.handleCheckbox('changePassword')}
                  />
                }
              />
              <FormControlLabel
                label={t('Public user information')}
                control={
                  <Checkbox
                    checked={changes.publicAddress || false}
                    onChange={this.handleCheckbox('publicAddress')}
                  />
                }
              />
            </Grid>
            <Button
              variant="text"
              color="secondary"
              onClick={this.props.history.goBack}
              style={{ marginRight: 8 }}
            >
              {t('Back')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleEdit}
            >
              {('Save')}
            </Button>
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
        <Dialog open={!!changingPw}>
          <DialogTitle>{t('Change password')}</DialogTitle>
          <DialogContent>
            <TextField 
              className={classes.input} 
              label={t("New password")} 
              fullWidth
              type="password"
              value={newPw}
              onChange={event => this.setState({ newPw: event.target.value })}
              autoFocus
              onKeyPress={this.handleKeyPress}
            />
            <TextField 
              className={classes.input} 
              label={t("Repeat new password")} 
              fullWidth
              type="password"
              value={checkPw}
              onChange={event => this.setState({ checkPw: event.target.value })}
              onKeyPress={this.handleKeyPress}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ changingPw: false })}>
              {t('Cancel')}
            </Button>
            <Button
              color="primary"
              onClick={this.handlePasswordChange}
              disabled={checkPw !== newPw}
            >
              {t('Save')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

UserDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  groups: PropTypes.object.isRequired,
  Roles: PropTypes.array.isRequired,
  userAreas: PropTypes.array.isRequired,
  domain: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired,
  fetchGroupsData: PropTypes.func.isRequired,
  fetchAreas: PropTypes.func.isRequired,
  fetchRoles: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    groups: state.groups,
    userAreas: state.areas.Areas.user || [],
    Roles: state.roles.Roles || [],
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchAreas: async () => {
      await dispatch(fetchAreasData()).catch(msg => Promise.reject(msg));
    },
    fetchRoles: async () => {
      await dispatch(fetchRolesData()).catch(msg => Promise.reject(msg));
    },
    edit: async (domainID, user) => {
      await dispatch(editUserData(domainID, user)).catch(msg => Promise.reject(msg));
    },
    fetchGroupsData: async () => {
      await dispatch(fetchGroupsData());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(UserDetails)));