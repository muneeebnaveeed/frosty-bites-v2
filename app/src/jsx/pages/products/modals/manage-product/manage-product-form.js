import { Field } from 'formik';
import FormField from 'jsx/components/FormField';
import React, { forwardRef } from 'react';
import CreatableSelect from 'react-select/creatable';
import SelectTags from './select-tags';

const _ManageProductForm = ({ ...restProps }, ref) => (
   <div className="row">
      <FormField ref={ref} label="Name" name="name" isRequired />
      <FormField type="number" label="Price" name="price" isRequired />
      <SelectTags />
      {/* <div className="form-group col-xl-12">
         <label className="col-form-label">Type</label>
         {!types.isLoading && !types.isError && (
            <CreatableSelect
               onChange={(type) => formik.setFieldValue('type', type.value)}
               options={types.data?.map((type) => ({ label: type.title, value: type }))}
               onCreateOption={(title) => {
                  dispatch(setTypesData({ title }));
                  dispatch(setTypesVisibility(true));
               }}
            />
         )}
      </div>
      <div className="form-group col-xl-12">
         <label className="col-form-label">Unit</label>
         <CreatableSelect
            width="tw-w-full"
            onChange={(unit) => formik.setFieldValue('unit', unit.value)}
            options={units.data?.map((unit) => ({ label: unit.title, value: unit }))}
            onCreateOption={(title) => {
               dispatch(setUnitsData({ title }));
               dispatch(setUnitsVisibility(true));
            }}
            //    options={units.data?.map((e) => ({ label: e.title, value: e }))}
         />
      </div> */}
   </div>
);

const ManageProductForm = forwardRef(_ManageProductForm);

export default ManageProductForm;
