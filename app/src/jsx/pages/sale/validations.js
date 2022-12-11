import * as yup from 'yup';
import _isNill from 'lodash/isNil';

const saleProductSchema = yup.object().shape({
   _id: yup.string().required('Product id is missing'),
   quantity: yup.number().required('Product quantity is missing'),
});

export const createSaleSchema = yup.object().shape({
   discount: yup.number().default(0).min(0, 'Invalid discount').max(100, 'Invalid discount'),
   products: yup.array(saleProductSchema).min(1, 'Please enter products').required('Please enter products'),
   salesType: yup.string().oneOf(['Dine-in', 'Takeaway', 'Delivery']),
   deliveryCharges: yup
      .number()
      .typeError('Please enter delivery charges')
      .test('delivery-charges-required-test', 'Please enter delivery charges', function (deliveryCharges) {
         const isDelivery = this.parent.salesType === 'Delivery';
         if (isDelivery && _isNill(deliveryCharges)) return false;
         return true;
      })
      .min(0, 'Invalid delivery charges'),
});
