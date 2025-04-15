'use client';

import React, { ReactNode } from 'react';
import { CartProvider } from '../context/CartContext';

interface CartWrapperProps {
  children: ReactNode;
}

const CartWrapper: React.FC<CartWrapperProps> = ({ children }) => {
  return <CartProvider>{children}</CartProvider>;
};

export default CartWrapper;
