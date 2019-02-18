import "@babel/polyfill";
import { routerReducer } from 'react-router-redux'
import { applyMiddleware, combineReducers, createStore } from "redux";
import { createLogger } from 'redux-logger'
import reducer from "./reducer";

export default function configureStore() {
  return createStore(combineReducers({
    app: reducer,
    routing: routerReducer,
  }), applyMiddleware(createLogger()));
}
