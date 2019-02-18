import {AnyAction, Reducer} from "redux"

declare module "react-router" {
  const IndexRoute: any
  const Route: any
  const Router: any
  const Link: any
  const hashHistory: any
  const browserHistory: any
}

declare module "react-router-redux" {
  const syncHistoryWithStore: any
  const routerReducer: Reducer<any, AnyAction>
  const LOCATION_CHANGE: string
}
