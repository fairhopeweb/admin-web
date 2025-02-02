// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import { Paper, FormControl, TextField, MenuItem, Switch, FormLabel } from '@mui/material';
import { connect } from 'react-redux';
import { changeSettings } from '../actions/settings';
import i18n from '../i18n';
import TableViewContainer from '../components/TableViewContainer';

const styles = theme => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  description: {
    display: 'inline-block',
    fontWeight: 500,
    width: 200,
  },
  data: {
    padding: '8px 0',
  },
  licenseContainer: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  divider: {
    margin: theme.spacing(2, 0, 2, 0),
  },
  upload: {
    margin: theme.spacing(0, 0, 0, 1),
  },
  headline: {
    marginRight: 8,
  },
  gridItem: {
    display: 'flex',
    flex: 1,
  },
});

class Settings extends Component {

  state = {
    snackbar: '',
  }

  langs = [
    { ID: 'en-US', name: 'English' },
    { ID: 'de-DE', name: 'Deutsch' },
  ]

  handleInput = field => event => {
    this.props.changeSettings(field, event.target.value);
  }

  handleDarkModeChange = event => {
    window.localStorage.setItem('darkMode', event.target.checked);
    window.location.reload();
  }

  handleLangChange = event => {
    const { changeSettings } = this.props;
    const lang = event.target.value;
    i18n.changeLanguage(lang);
    changeSettings('language', lang);
    window.localStorage.setItem('lang', lang);
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  render() {
    const { classes, t, settings } = this.props;
    const { snackbar } = this.state;
    return (
      <TableViewContainer
        headline={t("Settings")}
        subtitle={t('settings_sub')}
        href="https://docs.grommunio.com/admin/administration.html#settings"
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <Paper className={classes.paper} elevation={1}>
          <FormControl className={classes.form}>
            <TextField
              select
              className={classes.input}
              label={t("Language")}
              fullWidth
              value={settings.language || 'en-US'}
              onChange={this.handleLangChange}
            >
              {this.langs.map((lang, key) => (
                <MenuItem key={key} value={lang.ID}>
                  {lang.name}
                </MenuItem>
              ))}
            </TextField>
            <FormControl className={classes.formControl}>
              <FormLabel component="legend">{t('Darkmode')}</FormLabel>
              <Switch
                checked={(window.localStorage.getItem('darkMode') === 'true')}
                onChange={this.handleDarkModeChange}
                color="primary"
              />
            </FormControl>
          </FormControl>
        </Paper>
      </TableViewContainer>
    );
  }
}

Settings.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  changeSettings: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  const { settings } = state;
  return {
    settings,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeSettings: async (field, value) => {
      await dispatch(changeSettings(field, value));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Settings)));
