// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import { FormControl, Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography } from '@mui/material';
import { CleaningServices, DoNotDisturbOn } from '@mui/icons-material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { parseUnixtime } from '../../utils';
import { fetchUserSync } from '../../actions/users';
import { connect } from 'react-redux';
import PasswordSafetyDialog from '../Dialogs/PasswordSafetyDialog';
import { cancelRemoteWipe, engageRemoteWipe } from '../../actions/sync';
import Feedback from '../Feedback';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  headline: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  listItem: {
    padding: theme.spacing(1, 0, 1, 0),
  },
  listTextfield: {
    flex: 1,
  },
});

class Sync extends PureComponent {

  componentDidMount() {
    const { fetch, domainID, userID } = this.props;
    const { orderBy, type } = this.state; 
    fetch(domainID, userID)
      .then(this.handleSort(orderBy, type, false))
      .catch(err => console.error(err));
  }

  state = {
    snackbar: '',
    sortedDevices: null,
    order: 'asc',
    orderBy: 'pid',
    type: 'int',
    wiping: '',
  };

  columns = [
    { label: "Device ID", value: "deviceid" },
    { label: "Device user", value: "deviceuser" },
    { label: "Device Type / Agent", value: "devicetype" },
    { label: "First sync", value: "firstsynctime", type: 'int' },
    { label: "Last update", value: "lastudpatetime", type: 'int' },
    { label: "AS version", value: "asversion" },
    { label: "Folders", value: "foldersSynced", type: 'int' },
    { label: "Wipe status", value: "wipeStatus", type: 'int' },
  ];

  handleSort = (attribute, type, switchOrder) => () => {
    const sortedDevices = [...this.props.sync];
    const { order: stateOrder, orderBy } = this.state;
    const order = orderBy === attribute && stateOrder === "asc" ? "desc" : "asc";
    if((switchOrder && order === 'asc') || (!switchOrder && stateOrder === 'asc')) {
      sortedDevices.sort((a, b) =>
        type !== 'int' ? a[attribute].localeCompare(b[attribute]) : a[attribute] - b[attribute]
      );
    } else {
      sortedDevices.sort((a, b) => 
        type !== 'int' ? b[attribute].localeCompare(a[attribute]) : b[attribute] - a[attribute]
      );
    }
    this.setState({ sortedDevices, order: switchOrder ? order : stateOrder, orderBy: attribute, type });
  }

  handleRemoteWipeDialog = deviceID => () => this.setState({ wiping: deviceID });

  getWipeStatus(status) {
    switch(status) {
      case 0: return 'Unknown';
      case 1: return 'OK';
      case 2: return 'Pending';
      case 4: return 'Requested';
      case 8: return 'Wiped';
      default: return 'Unknown';
    }
  }

  handleRemoteWipeConfirm = password => {
    const { wipeItOffTheFaceOfEarth, domainID, userID } = this.props;
    const { wiping } = this.state;

    wipeItOffTheFaceOfEarth(domainID, userID, wiping, password)
      .then(() => this.updateWipeStatus(2, wiping))
      .catch(snackbar => this.setState({ snackbar }));
  }
  
  handleRemoteWipeCancel = deviceID => () => {
    const { panicStopWiping, domainID, userID } = this.props;
    panicStopWiping(domainID, userID, deviceID)
      .then(() => this.updateWipeStatus(1, deviceID))
      .catch(snackbar => this.setState({ snackbar }));
  }

  updateWipeStatus(status, deviceID) {
    const { sortedDevices } = this.state;
    const idx = sortedDevices.findIndex(d => d.deviceid === deviceID);
    const copy = [...sortedDevices];
    copy[idx].wipeStatus = status;
    this.setState({
      snackbar: "Success!",
      sortedDevices: copy,
      wiping: '',
    });
    return true;
  }

  render() {
    const { classes, t, sync } = this.props;
    const { sortedDevices, order, orderBy, wiping, snackbar } = this.state;

    return (
      <FormControl className={classes.form}>
        <Grid container alignItems="center"  className={classes.headline}>
          <Typography variant="h6">{t('Mobile devices')}</Typography>
        </Grid>
        <Table size="small">
          <TableHead>
            <TableRow>
              {this.columns.map((column, key) =>
                <TableCell
                  key={key}
                  padding={column.padding || 'normal'}
                >
                  <TableSortLabel
                    active={orderBy === column.value}
                    align="left" 
                    direction={order}
                    onClick={this.handleSort(column.value, column.type, true)}
                  >
                    {t(column.label)}
                  </TableSortLabel>
                </TableCell>
              )}
              <TableCell padding="checkbox">{t('Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(sortedDevices || sync).map((obj, idx) =>
              <TableRow key={idx}>
                <TableCell>{obj.deviceid || ''}</TableCell>
                <TableCell>{obj.deviceuser || ''}</TableCell>
                <TableCell>{(obj.devicetype || '') + ' / ' + (obj.useragent || '')}</TableCell>
                <TableCell>{obj.firstsynctime ? parseUnixtime(obj.firstsynctime) : ''}</TableCell>
                <TableCell>{obj.lastupdatetime ? parseUnixtime(obj.lastupdatetime) : ''}</TableCell>
                <TableCell>{obj.asversion || ''}</TableCell>
                <TableCell>{(obj.foldersSynced || '') + '/' + (obj.foldersSyncable || '')}</TableCell>
                <TableCell>{this.getWipeStatus(obj.wipeStatus)}</TableCell>
                <TableCell style={{ display: 'flex' }}>
                  {obj.wipeStatus >= 2 && <Tooltip title="Cancel remote wipe" placement="top">
                    <IconButton onClick={this.handleRemoteWipeCancel(obj.deviceid)}>
                      <DoNotDisturbOn color="secondary"/>
                    </IconButton>
                  </Tooltip>}
                  {obj.wipeStatus < 2 && <Tooltip title="Remote wipe" placement="top">
                    <IconButton onClick={this.handleRemoteWipeDialog(obj.deviceid)}>
                      <CleaningServices color="error" />
                    </IconButton>
                  </Tooltip>}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <PasswordSafetyDialog
          open={Boolean(wiping)}
          deviceID={wiping}
          onClose={this.handleRemoteWipeDialog('')}
          onConfirm={this.handleRemoteWipeConfirm}
        />
        <Feedback
          snackbar={snackbar || ''}
          onClose={() => this.setState({ snackbar: '' })}
        />
      </FormControl>
    );
  }
}

Sync.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  sync: PropTypes.array.isRequired,
  domainID: PropTypes.number,
  userID: PropTypes.number,
  wipeItOffTheFaceOfEarth: PropTypes.func.isRequired,
  panicStopWiping: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    sync: state.users.Sync || [],
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, userID) => await dispatch(fetchUserSync(domainID, userID))
      .catch(err => console.error(err)),
    wipeItOffTheFaceOfEarth: async (domainID, userID, deviceID, password) =>
      await dispatch(engageRemoteWipe(domainID, userID, deviceID, password))
        .catch(err => Promise.reject(err)),
    panicStopWiping: async (domainID, userID, deviceID) =>
      await dispatch(cancelRemoteWipe(domainID, userID, deviceID))
        .then(resp => resp)
        .catch(err => Promise.reject(err)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Sync)));
