import * as Comlink from "comlink";
import { LOCATION_CHANGE } from 'react-router-redux'

const defaultSelectLocationState = (state: any) => state.routing

export default async function syncHistoryWithStore(history: any, store: any, {
  selectLocationState = defaultSelectLocationState,
  adjustUrlOnReplay = true
} = {}) {
  const stateSnapshot = await store.getState()
  // Ensure that the reducer is mounted on the store and functioning properly.
  if (typeof selectLocationState(stateSnapshot) === 'undefined') {
    throw new Error(
      'Expected the routing state to be available either as `state.routing` ' +
      'or as the custom expression you can specify as `selectLocationState` ' +
      'in the `syncHistoryWithStore()` options. ' +
      'Ensure you have added the `routerReducer` to your store\'s ' +
      'reducers via `combineReducers` or whatever method you use to isolate ' +
      'your reducers.'
    )
  }

  let initialLocation: any
  let isTimeTraveling: boolean
  let unsubscribeFromStore: Function
  let unsubscribeFromHistory: Function
  let currentLocation: any

  // What does the store say about current location?
  const getLocationInStore = async (useInitialIfEmpty: any) => {
    const snapshot = await store.getState()
    const locationState = selectLocationState(snapshot)
    return locationState.locationBeforeTransitions ||
      (useInitialIfEmpty ? initialLocation : undefined)
  }

  // Init initialLocation with potential location in store
  initialLocation = await getLocationInStore(false)

  // If the store is replayed, update the URL in the browser to match.
  if (adjustUrlOnReplay) {
    const handleStoreChange = async () => {
      const locationInStore = await getLocationInStore(true)
      if (currentLocation === locationInStore || initialLocation === locationInStore) {
        return
      }

      // Update address bar to reflect store state
      isTimeTraveling = true
      currentLocation = locationInStore
      history.transitionTo({
        ...locationInStore,
        action: 'PUSH'
      })
      isTimeTraveling = false
    }

    unsubscribeFromStore = await store.subscribe(Comlink.proxyValue(handleStoreChange))
    handleStoreChange()
  }

  // Whenever location changes, dispatch an action to get it in the store
  const handleLocationChange = async (location: any) => {
    // ... unless we just caused that location change
    if (isTimeTraveling) {
      return
    }

    // Remember where we are
    currentLocation = location

    // Are we being called for the first time?
    if (!initialLocation) {
      // Remember as a fallback in case state is reset
      initialLocation = location

      const locationInStore = await getLocationInStore(false)

      // Respect persisted location, if any
      if (locationInStore) {
        return
      }
    }
    // Tell the store to update by dispatching an action
    store.dispatch({
      payload: location,
      type: LOCATION_CHANGE,
    })
  }
  unsubscribeFromHistory = history.listen(handleLocationChange)

  // History 3.x doesn't call listen synchronously, so fire the initial location change ourselves
  if (history.getCurrentLocation) {
    handleLocationChange(history.getCurrentLocation())
  }

  // The enhanced history uses store as source of truth
  return {
    ...history,
    // The listeners are subscribed to the store instead of history
    listen(listener: any) {
      // Copy of last location.
      let lastPublishedLocation = getLocationInStore(true)

      // Keep track of whether we unsubscribed, as Redux store
      // only applies changes in subscriptions on next dispatch
      let unsubscribed = false
      const unsubscribeFromStore1: Function = store.subscribe(Comlink.proxyValue(async () => {
        const currentLocation1: any = await getLocationInStore(true)
        if (currentLocation1 === lastPublishedLocation) {
          return
        }
        lastPublishedLocation = currentLocation1
        if (!unsubscribed) {
          listener(lastPublishedLocation)
        }
      }))

      // History 2.x listeners expect a synchronous call. Make the first call to the
      // listener after subscribing to the store, in case the listener causes a
      // location change (e.g. when it redirects)
      if (!history.getCurrentLocation) {
        listener(lastPublishedLocation)
      }

      // Let user unsubscribe later
      return () => {
        unsubscribed = true
        unsubscribeFromStore1()
      }
    },

    // It also provides a way to destroy internal listeners
    unsubscribe() {
      if (adjustUrlOnReplay) {
        unsubscribeFromStore()
      }
      unsubscribeFromHistory()
    }
  }
}
