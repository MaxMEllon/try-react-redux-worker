import * as Comlink from "comlink";
import * as React from 'react'
import { ReactReduxContext as Context } from 'react-redux'

interface Props {
  store: any,
  initialState: any,
}
interface State {
  store: any
  storeState: any
}

export default class Provider extends React.Component<Props, State> {

  public unsubscribe: Function
  constructor(props: any) {
    super(props)

    const { store, initialState } = props

    this.state = {
      store,
      storeState: initialState
    }
  }

  public componentDidMount() {
    this.subscribe()
  }

  public componentWillUnmount() {
    if (this.unsubscribe) { this.unsubscribe() }
  }

  public componentDidUpdate(prevProps: any) {
    if (this.props.store !== prevProps.store) {
      if (this.unsubscribe) { this.unsubscribe() }

      this.subscribe()
    }
  }

  public async subscribe() {
    const { store } = this.props

    this.unsubscribe = await store.subscribe(Comlink.proxyValue(async () => {
      const newStoreState = await store.getState()

      this.setState(providerState => {
        // If the value is the same, skip the unnecessary state update.
        if (providerState.storeState === newStoreState) {
          return null
        }

        return { storeState: newStoreState }
      })
    }))

    // Actions might have been dispatched between render and mount - handle those
    const postMountStoreState = await store.getState()
    if (postMountStoreState !== this.state.storeState) {
      this.setState({ storeState: postMountStoreState })
    }
  }

  public render() {
    // tslint:disable-next-line
    console.log(this.state.storeState)
    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    )
  }
}
