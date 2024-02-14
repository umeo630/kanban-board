import React from 'react'
import ReactDOM from 'react-dom'
import { GlobalStyle } from './GlobalStyle'
import { App } from './App'
import { createStore } from 'redux'
import { reducer } from './reducer'
import { Provider } from 'react-redux'

const store = createStore(reducer)

ReactDOM.render(
  <Provider store={store}>
    <GlobalStyle />
    <App />
  </Provider>,
  document.getElementById('app'),
)
