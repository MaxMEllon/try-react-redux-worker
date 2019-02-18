import { AnyAction, combineReducers, Reducer } from "redux";

// Counter

interface CounterState {
  value: number;
}

const INCREMENT = "counter/increment";

export interface Increment {
  type: typeof INCREMENT;
}

export function increment(): Increment {
  return {
    type: INCREMENT
  };
}

interface CounterAction {
  type: typeof INCREMENT;
}

const initialCounterState = {
  value: 3,
};
function counter(
  state: CounterState = initialCounterState,
  action: CounterAction | AnyAction
): CounterState {
  switch (action.type) {
    case INCREMENT: {
      return { ...state, value: state.value + 1 };
    }
    default: {
      return state;
    }
  }
}

// Root State

export interface State {
  counter: CounterState;
}

const rootReducer: Reducer<State, AnyAction> = combineReducers({
  counter
});

export default rootReducer;
