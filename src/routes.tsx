import * as React from "react";
import { IndexRoute, Route } from "react-router";
import App from "./components/App";
import Page1 from "./components/Page1";

const route = (
  <Route path="/">
    <IndexRoute component={App} />
    <Route path="page1" component={Page1} title="aaaa" />
  </Route>
);

export default route;
