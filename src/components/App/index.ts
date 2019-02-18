import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { increment } from '../../redux/reducer'
import App from './App';

export default connect(
  (state: any) => state.app,
  (dispatch: Dispatch) => ({
    increment() { dispatch(increment()) }
  })
)(App);
