import { AnyAction, Store } from "redux";

export interface WorkerizedStore<
  State,
  Snapshot = State,
  A extends AnyAction = AnyAction
> {
  getState(): Promise<State>;
  dispatch(action: A): Promise<void>;
  subscribe(
    listener: (state: Snapshot) => void,
    selector?: (root: State) => Promise<Snapshot> | Snapshot
  ): Promise<number>;
  unsubscribe(listenerId: number): Promise<void>;
}

const isEqual = (a: any, b: any) => a === b

let cnt = 0;

function uniqueId() {
  return ++cnt;
}

function defaultSelector<State>(state: State) {
  return state;
}

export default function workerizeStore<State>(
  store: Store<State>
): WorkerizedStore<State> {
  const listenerMap = new Map<number, Function>();
  return {
    async subscribe<Snapshot = State>(
      onChangeHandler: Function,
      selector: (state: State) => Snapshot = defaultSelector as any
    ): Promise<number> {
      const getSnapshot: () => Promise<Snapshot> = () =>
        selector(store.getState()) as any;
      const subscriptionId = uniqueId();
      let lastSnapshot = await getSnapshot();
      const unsubscribe = store.subscribe(async () => {
        const newSnapshot = await getSnapshot();
        if (!isEqual(lastSnapshot, newSnapshot)) {
          onChangeHandler(newSnapshot);
          lastSnapshot = newSnapshot;
        }
      });
      listenerMap.set(subscriptionId, unsubscribe);
      return subscriptionId;
    },
    async unsubscribe(subscriptionId: number) {
      const listener = listenerMap.get(subscriptionId);
      if (listener) { listener(); }
      listenerMap.delete(subscriptionId);
    },
    async getState() {
      return store.getState();
    },
    async dispatch(action: AnyAction) {
      await store.dispatch(action);
    }
  };
}
