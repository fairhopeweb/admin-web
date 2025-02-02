import React from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableHead, TableRow } from '@mui/material';
import StyledTableCell from './StyledTableCell';
import AlternatingTableRow from '../AlternatingTableRow';

function ServerZones(props) {
  const { serverZones } = props;

  const formatBytes = bytes => {
    let exp = Math.log(bytes) / Math.log(1024) | 0;
    let res = (bytes / Math.pow(1024, exp)).toFixed(1);

    return res + '' + (exp === 0 ? ' bytes' : ' ' + 'KMGTPEZY'[exp - 1] + 'B');
  };

  return (
    <Table size="small" padding="none" style={{ marginBottom: 16 }}>
      <TableHead>
        <TableRow>
          <StyledTableCell rowSpan={2} align="center">Zone</StyledTableCell>
          <StyledTableCell colSpan={3} align="center">Requests</StyledTableCell>
          <StyledTableCell colSpan={6} align="center">Responses</StyledTableCell>
          <StyledTableCell colSpan={2} align="center">Traffic</StyledTableCell>
        </TableRow>
        <TableRow>
          <StyledTableCell align="center">Total</StyledTableCell>
          <StyledTableCell align="center">Req/s</StyledTableCell>
          <StyledTableCell align="center">Time</StyledTableCell>
          <StyledTableCell align="center">1xx</StyledTableCell>
          <StyledTableCell align="center">2xx</StyledTableCell>
          <StyledTableCell align="center">3xx</StyledTableCell>
          <StyledTableCell align="center">4xx</StyledTableCell>
          <StyledTableCell align="center">5xx</StyledTableCell>
          <StyledTableCell align="center">Total</StyledTableCell>
          <StyledTableCell align="center">Sent</StyledTableCell>
          <StyledTableCell align="center">Rcvd</StyledTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {serverZones.map(({ server, values }, idx) => {
          const { responses } = values;
          return (
            <AlternatingTableRow key={idx}>
              <StyledTableCell>
                <strong>{server === '*' ? 'Any' : server === '_' ? 'Other' : server}</strong>
              </StyledTableCell>
              <StyledTableCell align="right">{values.requestCounter}</StyledTableCell>
              <StyledTableCell align="right">{values.requestMsec}</StyledTableCell>
              <StyledTableCell align="right">{values.time}</StyledTableCell>
              <StyledTableCell align="right">{responses['1xx']}</StyledTableCell>
              <StyledTableCell align="right">{responses['2xx']}</StyledTableCell>
              <StyledTableCell align="right">{responses['3xx']}</StyledTableCell>
              <StyledTableCell align="right">{responses['4xx']}</StyledTableCell>
              <StyledTableCell align="right">{responses['5xx']}</StyledTableCell>
              <StyledTableCell align="right">
                {responses['1xx'] + responses['2xx'] + responses['3xx'] +
                  responses['4xx'] + responses['5xx']}
              </StyledTableCell>
              <StyledTableCell align="right">{formatBytes(values.outBytes)}</StyledTableCell>
              <StyledTableCell align="right">{formatBytes(values.inBytes)}</StyledTableCell>
            </AlternatingTableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

ServerZones.propTypes = {
  serverZones: PropTypes.array.isRequired,
};

export default ServerZones;
