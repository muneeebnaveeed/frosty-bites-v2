import React, { forwardRef } from 'react';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { currencyFormatter } from 'jsx/helpers/misc';

const _Receipt = (
   { saleId, saleType, products, subtotal, discountPercentage, absoluteDiscount, deliveryCharges, total },
   ref
) => {
   const user = useSelector((state) => state.auth.user);
   const isDelivery = saleType === 'Delivery';
   return (
      <div
         ref={ref}
         className="d-none d-print-block"
         style={{
            width: '100%',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            fontSize: 36,
            padding: 24,
         }}
      >
         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24 }}>
            <img src="/frosty-logo.png" style={{ height: 200 }} />
            <h2>Frosty Bites N Sips</h2>
         </div>
         <div style={{ marginBottom: 24 }}>
            <h2 style={{ textAlign: 'center' }}>Third Floor, Food Court, New City Arcade, New City, Wah</h2>
            <h2 style={{ textAlign: 'center' }}>For Orders 03020632244</h2>
            <h2 style={{ textAlign: 'center' }}>For complains and suggestions 03449471734</h2>
         </div>
         <div style={{ border: '1px solid black', marginBottom: 24, padding: 24 }}>
            <h2 style={{ textAlign: 'center' }}>Sales Receipt</h2>
            <h2 style={{ textAlign: 'center' }}>
               #{saleId} - {dayjs().format('DD/MM/YYYY h:mm A')}
            </h2>
         </div>
         <div style={{ marginBottom: 24 }}>
            <h2 style={{ textAlign: 'center' }}>Cashier: {user.name}</h2>
            <h2 style={{ textAlign: 'center' }}>Type: {saleType}</h2>
         </div>
         <table style={{ width: '100%', border: '1px solid black' }}>
            <thead>
               <tr style={{ borderBottom: '1px solid black' }}>
                  <th style={{ padding: '24px 36px', borderRight: '1px solid black' }}>#</th>
                  <th style={{ padding: 24, borderRight: '1px solid black' }}>Product</th>
                  <th style={{ padding: 24, borderRight: '1px solid black' }}>Price</th>
                  <th style={{ padding: 24, borderRight: '1px solid black' }}>Qty</th>
                  <th style={{ padding: 24, borderRight: '1px solid black' }}>Total</th>
               </tr>
            </thead>
            <tbody>
               {products.map((e, index) => (
                  <tr key={`receipt-product-row-${index}`}>
                     <td style={{ padding: '24px 36px' }}>{index + 1}</td>
                     <td style={{ padding: 24 }}>{e.product.name}</td>
                     <td style={{ padding: 24 }}>{e.product.price}</td>
                     <td style={{ padding: 24 }}>{e.quantity}</td>
                     <td style={{ padding: 24 }}>{e.subtotal}</td>
                  </tr>
               ))}
            </tbody>
         </table>
         <br />
         <div style={{ marginTop: 24, marginBottom: 24 }}>
            <h2 style={{ textAlign: 'end' }}>
               <span>Subtotal:</span>{' '}
               <span style={{ display: 'inline-block', minWidth: 200 }}>{currencyFormatter.format(subtotal)}</span>
            </h2>
            <h2 style={{ textAlign: 'end' }}>
               <span>Discount:</span>{' '}
               <span style={{ display: 'inline-block', minWidth: 200 }}>
                  {discountPercentage > 0
                     ? `${discountPercentage}% - ${currencyFormatter.format(absoluteDiscount)}`
                     : 'NONE'}
               </span>
            </h2>
            {isDelivery && (
               <h2 style={{ textAlign: 'end' }}>
                  <span>Delivery charges:</span>{' '}
                  <span style={{ display: 'inline-block', minWidth: 200 }}>
                     {deliveryCharges > 0 ? currencyFormatter.format(deliveryCharges) : 'NONE'}
                  </span>
               </h2>
            )}
            <h2 style={{ textAlign: 'end' }}>
               <span>Total:</span>{' '}
               <span style={{ display: 'inline-block', minWidth: 200 }}>{currencyFormatter.format(total)}</span>
            </h2>
         </div>
         <br />
         <div style={{ display: 'flex' }}>
            <div
               style={{
                  border: '1px solid black',
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 450,
               }}
            >
               Thank you for visiting us!
            </div>
            <div
               style={{
                  border: '1px solid black',
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  // alignItems: 'center',
                  flexDirection: 'column',
                  height: 450,
                  padding: '0 96px',
               }}
            >
               <span>Delivery charges within 5 KM: {currencyFormatter.format(100)}</span>
               <span>Delivery charges outside 5 KM: {currencyFormatter.format(150)}</span>
            </div>
         </div>
         <h2 style={{ textAlign: 'center', marginTop: 48 }}>POS Developed by Asaniya - www.asaniya.com</h2>
      </div>
   );
};

const Receipt = forwardRef(_Receipt);

export default Receipt;
