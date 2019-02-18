import * as Comlink from "comlink";
import configureStore from './createStore'
import workerizeStore from "./workerizeStore";

const store = configureStore();
const storeAPI = workerizeStore(store)

Comlink.expose({ ...storeAPI }, self);

