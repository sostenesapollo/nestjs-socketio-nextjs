import { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import dayjs from 'dayjs'

const AppContext = createContext({
  reloadOrders: {
    reloadOrders: false,
    setReloadOrders: async (data:any) => data,
  },
  orders: {
    orders: [],
    setOrders: async (data:any) => data,
  },
  date: {
    date: '',
    setDate: async (data:any) => data,
  }
});

export function AppWrapper({ children }: any) {
  const [reloadOrders, setReloadOrders] = useState(false)
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [orders, setOrders] = useState([])
  let sharedState = {
    reloadOrders: {
      reloadOrders,
    },
    orders: {
      orders,
      setOrders
    },
    date: {
      date,
      setDate
    }
  }

  useEffect(()=>{
    io('http://localhost:3002/app', {
      transportOptions: {
        polling: {
          extraHeaders: { Authorization: localStorage.getItem('token') }
        }
      }
    }).on('orderUpdated', ()=>{ 
      console.log('Order updated');
      
      setReloadOrders(prev=>!prev) 
    })
  },[])

  return (
    <AppContext.Provider value={sharedState as any}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}