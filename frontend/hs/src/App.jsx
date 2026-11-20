import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import RestaurantForm from './pages/owner/RestaurantForm';
import ManageMenu from './pages/owner/ManageMenu';
import RestaurantOrders from './pages/owner/RestaurantOrders';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <BrowserRouter>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/restaurants/:id" element={<RestaurantDetail />} />

                        <Route path="/cart" element={
                            <ProtectedRoute roles={['customer']}><Cart /></ProtectedRoute>
                        } />
                        <Route path="/my-orders" element={
                            <ProtectedRoute roles={['customer']}><MyOrders /></ProtectedRoute>
                        } />
                        <Route path="/orders/:id" element={
                            <ProtectedRoute><OrderDetail /></ProtectedRoute>
                        } />

                        <Route path="/owner" element={
                            <ProtectedRoute roles={['owner']}><OwnerDashboard /></ProtectedRoute>
                        } />
                        <Route path="/owner/new-restaurant" element={
                            <ProtectedRoute roles={['owner']}><RestaurantForm /></ProtectedRoute>
                        } />
                        <Route path="/owner/restaurants/:restaurantId/menu" element={
                            <ProtectedRoute roles={['owner']}><ManageMenu /></ProtectedRoute>
                        } />
                        <Route path="/owner/restaurants/:restaurantId/orders" element={
                            <ProtectedRoute roles={['owner']}><RestaurantOrders /></ProtectedRoute>
                        } />

                        <Route path="/delivery" element={
                            <ProtectedRoute roles={['delivery']}><DeliveryDashboard /></ProtectedRoute>
                        } />

                        <Route path="/admin" element={
                            <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
                        } />
                    </Routes>
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
