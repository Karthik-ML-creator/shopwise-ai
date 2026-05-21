import React, { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext(null)

const initialState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
      return { ...state, user: action.payload.user, token: action.payload.token }

    case 'LOGOUT':
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return { ...state, user: null, token: null }

    case 'ADD_TO_CART': {
      const exists = state.cart.find(i => i.id === action.payload.id)
      const newCart = exists
        ? state.cart.map(i => i.id === action.payload.id ? { ...i, qty: i.qty + 1 } : i)
        : [...state.cart, { ...action.payload, qty: 1 }]
      localStorage.setItem('cart', JSON.stringify(newCart))
      return { ...state, cart: newCart }
    }

    case 'REMOVE_FROM_CART': {
      const newCart = state.cart.filter(i => i.id !== action.payload)
      localStorage.setItem('cart', JSON.stringify(newCart))
      return { ...state, cart: newCart }
    }

    case 'CLEAR_CART':
      localStorage.setItem('cart', '[]')
      return { ...state, cart: [] }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
