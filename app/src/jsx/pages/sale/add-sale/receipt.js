import React, { forwardRef } from 'react';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { currencyFormatter } from 'jsx/helpers/misc';
import { When } from 'react-if';

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
            width: 265,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: 6,
         }}
      >
         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
            <img src="/frosty-logo.png" style={{ height: 35 }} />
            <h2 style={{ fontSize: 10, marginBottom: 0 }}>Frosty Bites N Sips</h2>
         </div>
         <div style={{ marginBottom: 6 }}>
            <h2 style={{ fontSize: 10, textAlign: 'center' }}>
               Third Floor, Food Court, New City Arcade, New City, Wah
            </h2>
            <h2 style={{ fontSize: 10, textAlign: 'center' }}>For Orders 03020632244</h2>
            <h2 style={{ fontSize: 10, textAlign: 'center' }}>For complains and suggestions 03449471734</h2>
         </div>
         <div style={{ border: '1px solid black', marginBottom: 6, padding: 6 }}>
            <h2 style={{ fontSize: 10, textAlign: 'center' }}>Sales Receipt</h2>
            <h2 style={{ fontSize: 10, textAlign: 'center' }}>
               #{saleId} - {dayjs().format('DD/MM/YYYY h:mm A')}
            </h2>
         </div>
         <div style={{ marginBottom: 6 }}>
            <h2 style={{ fontSize: 10, textAlign: 'center' }}>Cashier: {user.name}</h2>
            <h2 style={{ fontSize: 10, textAlign: 'center' }}>Type: {saleType}</h2>
         </div>
         <table style={{ width: '100%', border: '1px solid black' }}>
            <thead>
               <tr style={{ borderBottom: '1px solid black' }}>
                  <th style={{ fontSize: 9, padding: '6px 8px', borderRight: '1px solid black' }}>#</th>
                  <th style={{ fontSize: 9, padding: 6, borderRight: '1px solid black' }}>Product</th>
                  <th style={{ fontSize: 9, padding: 6, borderRight: '1px solid black' }}>Price</th>
                  <th style={{ fontSize: 9, padding: 6, borderRight: '1px solid black' }}>Qty</th>
                  <th style={{ fontSize: 9, padding: 6, borderRight: '1px solid black' }}>Total</th>
               </tr>
            </thead>
            <tbody>
               {products.map((e, index) => (
                  <tr key={`receipt-product-row-${index}`}>
                     <td style={{ fontSize: 9, padding: '6px 8px' }}>{index + 1}</td>
                     <td style={{ fontSize: 9, padding: 6 }}>{e.product.name}</td>
                     <td style={{ fontSize: 9, padding: 6 }}>{e.product.price}</td>
                     <td style={{ fontSize: 9, padding: 6 }}>{e.quantity}</td>
                     <td style={{ fontSize: 9, padding: 6 }}>{e.subtotal}</td>
                  </tr>
               ))}
            </tbody>
         </table>
         <br />
         <div style={{ marginTop: 6, marginBottom: 6 }}>
            <h2 style={{ fontSize: 12, textAlign: 'end' }}>
               <span>Subtotal:</span>{' '}
               <span style={{ display: 'inline-block', minWidth: 80 }}>{currencyFormatter.format(subtotal)}</span>
            </h2>
            <When condition={discountPercentage > 0}>
               <h2 style={{ fontSize: 12, textAlign: 'end' }}>
                  <span>Discount:</span>{' '}
                  <span style={{ display: 'inline-block', minWidth: 80 }}>
                     {discountPercentage > 0
                        ? `${discountPercentage}% - ${currencyFormatter.format(absoluteDiscount)}`
                        : 'NONE'}
                  </span>
               </h2>
            </When>
            {isDelivery && (
               <h2 style={{ fontSize: 12, textAlign: 'end' }}>
                  <span>Delivery charges:</span>{' '}
                  <span style={{ display: 'inline-block', minWidth: 80 }}>
                     {deliveryCharges > 0 ? currencyFormatter.format(deliveryCharges) : 'NONE'}
                  </span>
               </h2>
            )}
            <h2 style={{ fontSize: 12, textAlign: 'end' }}>
               <span>Total:</span>{' '}
               <span style={{ display: 'inline-block', minWidth: 80 }}>{currencyFormatter.format(total)}</span>
            </h2>
         </div>
         <br />
         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/social-qr.png" style={{ height: 50 }} />

            {/* <div
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
            </div> */}
         </div>
         <h2 style={{ fontSize: 8, textAlign: 'center', marginTop: 6 }}>POS Developed by Asaniya - www.asaniya.com</h2>
      </div>
   );
};

const Receipt = forwardRef(_Receipt);

export default Receipt;
