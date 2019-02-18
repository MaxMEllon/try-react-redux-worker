import * as Comlink from "comlink";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { browserHistory, Router } from "react-router";
import './index.css';
import Provider from './redux/Provider'
import { increment, State } from './redux/reducer'
import syncHistoryWithStore from "./redux/sync";
import { WorkerizedStore } from './redux/workerizeStore'
import registerServiceWorker from './registerServiceWorker';
import routes from './routes';

const worker = new Worker('./redux/worker.ts')

const storeProxy: WorkerizedStore<State, { value: number }> = Comlink.proxy(worker) as any;

const history = syncHistoryWithStore(browserHistory, storeProxy)

const initialState = storeProxy.getState()

  // tslint:disable-next-line no-console
storeProxy.subscribe(Comlink.proxyValue((a: any) => console.log(a.app.counter)))

setTimeout(() => storeProxy.dispatch(increment()), 2000)

Promise.all([initialState, history]).then(([state, h]) => {
  ReactDOM.render(
    <Provider initialState={state} store={storeProxy}>
      <Router history={h}>
        { routes }
      </Router>
    </Provider>,
    document.getElementById('root') as HTMLElement
  );
})

registerServiceWorker();
