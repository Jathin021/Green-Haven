import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PayPalCheckout = ({ cart, orderTotal, shippingInfo, discountCode, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const createOrder = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert cart items to PayPal format
      const paypalItems = cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit_amount: item.price,
        sku: item.id
      }));

      const orderData = {
        items: paypalItems,
        total_amount: orderTotal?.total || 0,
        currency: 'USD',
        customer_email: null, // Will be set from user context if available
        shipping_info: shippingInfo,
        discount_code: discountCode
      };

      const response = await fetch(`${BACKEND_URL}/api/paypal/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create PayPal order');
      }

      const result = await response.json();
      return result.id;
    } catch (err) {
      console.error('Error creating PayPal order:', err);
      setError(err.message);
      onError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const onApprove = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/paypal/execute-payment?payment_id=${data.paymentID}&payer_id=${data.payerID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to execute PayPal payment');
      }

      const result = await response.json();
      
      if (result.status === 'COMPLETED') {
        onSuccess(result);
      } else {
        throw new Error('Payment was not completed successfully');
      }
    } catch (err) {
      console.error('Error executing PayPal payment:', err);
      setError(err.message);
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  const onCancel = (data) => {
    console.log('PayPal payment cancelled:', data);
    setError('Payment was cancelled');
  };

  const onErrorHandler = (err) => {
    console.error('PayPal error:', err);
    setError('Payment failed. Please try again.');
    onError(err);
  };

  if (!orderTotal || orderTotal.total <= 0) {
    return <div className="paypal-error">Invalid order total</div>;
  }

  return (
    <div className="paypal-checkout">
      {error && (
        <div className="paypal-error" style={{ 
          color: 'red', 
          marginBottom: '10px', 
          padding: '10px', 
          border: '1px solid red', 
          borderRadius: '4px' 
        }}>
          {error}
        </div>
      )}
      
      <PayPalScriptProvider 
        options={{ 
          "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
          currency: "USD"
        }}
      >
        <div style={{ opacity: loading ? 0.5 : 1 }}>
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onCancel={onCancel}
            onError={onErrorHandler}
            disabled={loading}
            style={{
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'paypal',
              height: 40
            }}
          />
        </div>
      </PayPalScriptProvider>
      
      {loading && (
        <div className="paypal-loading" style={{ 
          marginTop: '10px', 
          textAlign: 'center' 
        }}>
          Processing payment...
        </div>
      )}
    </div>
  );
};

export default PayPalCheckout;