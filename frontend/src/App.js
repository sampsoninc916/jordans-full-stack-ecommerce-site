import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import NavBar from './subcomponents/NavBar';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import './App.css';
import { useContext } from 'react';
import { Store } from './Store';
import SigninScreen from './screens/SigninScreen';
import SignupScreen from './screens/SignupScreen';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import SearchScreen from './screens/SearchScreen';
import ProtectedRoute from './subcomponents/ProtectedRoute';
import DashboardScreen from './screens/DashboardScreen';
import AdminRoute from './subcomponents/AdminRoute';

function App() {
  const { state: { cart } } = useContext(Store);
  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen">
          <ToastContainer position="bottom-center" limit={1} />
          <header>
            <NavBar />
          </header>
          <main className="flex-1">
            <Routes>
              <Route path="/admin/dashboard" element={<AdminRoute><DashboardScreen /></AdminRoute>}></Route>
              <Route path="/" element={<HomeScreen />}></Route>
              <Route path="/product/:slug" element={<ProductScreen />}></Route>
              <Route path="/cart" element={<CartScreen />}></Route>
              <Route path="/search" element={<SearchScreen />}></Route>
              <Route path="/signin" element={<SigninScreen />}></Route>
              <Route path="/signup" element={<SignupScreen />}></Route>
              <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>}></Route>
              <Route path="/shipping" element={<ShippingAddressScreen />}></Route>
              <Route path="/payment" element={<PaymentMethodScreen />}></Route>
              <Route path="/placeorder" element={<PlaceOrderScreen />}></Route>
              <Route path="/order/:id" element={<ProtectedRoute><OrderScreen /></ProtectedRoute>}></Route>
              <Route path="/orderhistory" element={<ProtectedRoute><OrderHistoryScreen /></ProtectedRoute>}></Route>
            </Routes>
          </main>
          <footer>
            <div className="text-center">All rights reserved</div>
          </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
