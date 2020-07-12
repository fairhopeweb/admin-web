import React from "react";
import PropTypes from 'prop-types';

import { Switch } from "react-router-dom";

import AuthenticatedRoute from './components/AuthenticatedRoute';
import UnauthenticatedRoute from './components/UnauthenticatedRoute';
import AsyncComponent from './components/AsyncComponent';

const AsyncLogin = AsyncComponent(() => import("./containers/Login"));
const AsyncMenu = AsyncComponent(() => import("./containers/Menu"));
const AsyncDataAreaSetup = AsyncComponent(() => import("./containers/DataAreaSetup"));
const AsyncDomainList = AsyncComponent(() => import("./containers/DomainList"));
const AsyncDomainListDetails = AsyncComponent(() => import("./containers/DomainListDetails"));
const AsyncUsers = AsyncComponent(() => import("./containers/Users"));
const AsyncUserDetails = AsyncComponent(() => import("./containers/UserDetails"));
const AsyncGroups = AsyncComponent(() => import("./containers/Groups"));
const AsyncGroupDetails = AsyncComponent(() => import("./containers/GroupDetails"));
const AsyncOrgs = AsyncComponent(() => import("./containers/Orgs"));
const AsyncOrgDetails = AsyncComponent(() => import("./containers/OrgDetails"));
const AsyncAliases = AsyncComponent(() => import("./containers/Aliases"));
const AsyncAliasDetails = AsyncComponent(() => import("./containers/AliasDetails"));
const AsyncForwards = AsyncComponent(() => import("./containers/Forwards"));
const AsyncForwardDetails = AsyncComponent(() => import("./containers/ForwardDetails"));
const AsyncMlists = AsyncComponent(() => import("./containers/Mlists"));
const AsyncMlistDetails = AsyncComponent(() => import("./containers/MlistDetails"));
const AsyncClasses = AsyncComponent(() => import("./containers/Classes"));
const AsyncClassDetails = AsyncComponent(() => import("./containers/ClassDetails"));
const AsyncMembers = AsyncComponent(() => import("./containers/Members"));
const AsyncMemberDetails = AsyncComponent(() => import("./containers/MemberDetails"));
const AsyncBaseSetup = AsyncComponent(() => import("./containers/BaseSetup"));

const Routes = ({ childProps }) => (
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
    <AuthenticatedRoute
      path="/dataAreaSetup"
      exact
      component={AsyncDataAreaSetup}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/domainList"
      exact
      component={AsyncDomainList}
      props={childProps}
    />
    <AuthenticatedRoute
      path={[
        "/domainList/:domainID",
        "/domainList/add",
      ]}
      exact
      component={AsyncDomainListDetails}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/baseSetup"
      exact
      component={AsyncBaseSetup}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/users"
      exact
      component={AsyncUsers}
      props={childProps}
    />
    <AuthenticatedRoute
      path={[
        "/users/:userID",
        "/users/add",
      ]}
      exact
      component={AsyncUserDetails}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/groups"
      exact
      component={AsyncGroups}
      props={childProps}
    />
    <AuthenticatedRoute
      path={[
        "/groups/:groupID",
        "/groups/add",
      ]}
      exact
      component={AsyncGroupDetails}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/orgs"
      exact
      component={AsyncOrgs}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/orgs/:orgID"
      exact
      component={AsyncOrgDetails}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/aliases"
      exact
      component={AsyncAliases}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/aliases/:aliasID"
      exact
      component={AsyncAliasDetails}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/forwards"
      exact
      component={AsyncForwards}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/forwards/:forwardsID"
      exact
      component={AsyncForwardDetails}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/mlists"
      exact
      component={AsyncMlists}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/mlists/:mlistID"
      exact
      component={AsyncMlistDetails}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/classes"
      exact
      component={AsyncClasses}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/classes/:classID"
      exact
      component={AsyncClassDetails}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/members"
      exact
      component={AsyncMembers}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/members/:memberID"
      exact
      component={AsyncMemberDetails}
      props={childProps}
    />
  </Switch>
);

Routes.propTypes = {
  childProps: PropTypes.object,
};

export default Routes;
