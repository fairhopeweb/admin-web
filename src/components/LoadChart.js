// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { Component } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import {
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  BarChart,
  CartesianGrid,
} from 'recharts';
import { Paper } from '@mui/material';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

const styles = theme => ({
  root: {
    flex: 1,
    width: 0,
  },
  chartTitle: {
    margin: theme.spacing(2, 2, 2, 2),
  },
  paper: {
    paddingTop: 1,
    display: 'flex',
  },
});

class LoadChart extends Component {

  render() {
    const { classes, t, load } = this.props;
    return (
      <Paper className={classes.paper}>
        <div className={classes.root}>
          <Typography className={classes.chartTitle}>{t("Load")}</Typography>
          <ResponsiveContainer width="100%" height={200} >
            <BarChart data={load} margin={{ top: 0, right: 32, left: 10, bottom: 16 }}>
              <defs>
                <linearGradient id="gradientBlue2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={"#2980B9"} />
                  <stop offset="95%" stopColor={"#6DD5FA"} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Legend />
              <Tooltip labelStyle={{ color: 'black', fontSize: 18, paddingBottom: 4 }}/>
              <Bar
                dataKey="value"
                fill="url(#gradientBlue)"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Paper>
    );
  }
}

LoadChart.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  load: PropTypes.array.isRequired,
};

export default connect(null, null)(
  withTranslation()(withStyles(styles)(LoadChart)));
