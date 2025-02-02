// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React from "react";
import PropTypes from 'prop-types';

import { Switch, Route } from "react-router-dom";

import AuthenticatedDomainRoute from './components/AuthenticatedDomainRoute';
import Loadable from 'react-loadable';
import Loader from './components/Loading';
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";
import DefaultRedirect from "./components/DefaultRedirect";
import NotFound from "./containers/NotFound";
import { ORG_ADMIN } from "./constants";

function makeLoadableComponent(loader) {
  return Loadable({
    loader,
    loading: Loader,
    timeout: 20000,
    delay: 300,
  });
}

const AsyncDomainMenu = makeLoadableComponent(() => import("./containers/DomainMenu"));
const AsyncUsers = makeLoadableComponent(() => import("./containers/Users"));
const AsyncUserDetails = makeLoadableComponent(() => import("./containers/UserDetails"));
const AsyncFolders = makeLoadableComponent(() => import("./containers/Folders"));
const AsyncFolderDetails = makeLoadableComponent(() => import("./containers/FolderDetails"));
const AsyncLogin = makeLoadableComponent(() => import("./containers/Login"));
const AsyncMenu = makeLoadableComponent(() => import("./containers/Menu"));
const AsyncLdap = makeLoadableComponent(() => import("./containers/Ldap"));
const AsyncClasses = makeLoadableComponent(() => import("./containers/Classes"));
const AsyncClassDetails = makeLoadableComponent(() => import("./containers/ClassDetails"));
const AsyncMlists = makeLoadableComponent(() => import("./containers/MLists"));
const AsyncMlistDetails = makeLoadableComponent(() => import("./containers/MListDetails"));
//const AsyncConfig = makeLoadableComponent(() => import("./containers/Config"));
//const AsyncMailAddresses = makeLoadableComponent(() => import("./containers/MailAddresses"));
//const AsyncMailAddressDetails = makeLoadableComponent(() => import("./containers/MailAddressDetails"));
const AsyncDomainListDetails = makeLoadableComponent(() => import("./containers/DomainDetails"));
const AsyncSettings = makeLoadableComponent(() => import("./containers/Settings"));
const AsyncTaskQ = makeLoadableComponent(() => import("./containers/TaskQ"));

const Routes = ({ childProps, domains, capabilities }) => (
  <Switch>
    <AuthenticatedRoute
      path="/"
      exact
      component={AsyncMenu}
      props={childProps}
    />
    <UnauthenticatedRoute
      path="/login"
      exact
      component={AsyncLogin}
      props={childProps}
    />
    {capabilities.includes(ORG_ADMIN) &&
      <AuthenticatedRoute
        path="/domains/:domainID*"
        exact
        component={AsyncDomainListDetails}
        props={childProps}
      />
    }
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}`}
        exact
        component={AsyncDomainMenu}
        domain={domain}
        props={childProps}
        key={domain.ID}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/users`}
        exact
        component={AsyncUsers}
        props={childProps}
        domain={domain}
        key={domain.ID}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/users/:userID*`}
        exact
        component={AsyncUserDetails}
        props={childProps}
        domain={domain}
        key={domain.ID}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/folders`}
        exact
        component={AsyncFolders}
        props={childProps}
        domain={domain}
        key={domain.ID}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/folders/:folderID`}
        exact
        component={AsyncFolderDetails}
        props={childProps}
        key={domain.ID}
        domain={domain}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/ldap`}
        exact
        component={AsyncLdap}
        props={childProps}
        key={domain.ID}
        domain={domain}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/classes`}
        exact
        component={AsyncClasses}
        props={childProps}
        key={domain.ID}
        domain={domain}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/classes/:classID`}
        exact
        component={AsyncClassDetails}
        props={childProps}
        key={domain.ID}
        domain={domain}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/mailLists`}
        exact
        component={AsyncMlists}
        props={childProps}
        key={domain.ID}
        domain={domain}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/mailLists/:mlistID`}
        exact
        component={AsyncMlistDetails}
        props={childProps}
        key={domain.ID}
        domain={domain}
      />
    )}
    <AuthenticatedRoute
      path="/taskq"
      exact
      component={AsyncTaskQ}
      props={childProps}
    />
    <AuthenticatedRoute
      path={`/settings`}
      exact
      component={AsyncSettings}
      props={childProps}
    />
    {!childProps.loading ?
      <Route
        route="*"
        render={(props) => <NotFound {...props} />} />
      : <DefaultRedirect />
    }
  </Switch>
);

Routes.propTypes = {
  childProps: PropTypes.object,
  domains: PropTypes.array.isRequired,
  capabilities: PropTypes.array.isRequired,
};

export default Routes;
