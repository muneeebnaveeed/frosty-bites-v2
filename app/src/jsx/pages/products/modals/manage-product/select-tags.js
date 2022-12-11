import { useFormikContext } from 'formik';
import FormField from 'jsx/components/FormField';
import { api, get, useAlert, useQuery } from 'jsx/helpers';
import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useMutation, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import CreatableSelect from 'react-select/creatable';
import _cloneDeep from 'lodash/cloneDeep';
import { defaultSelectStyles } from 'jsx/components/Select';
import { createSelectTagOption } from '../../utils';

const SelectTags = (props) => {
   const { setFieldValue, values } = useFormikContext();
   const fieldValue = values.tags || [];

   const alert = useAlert();
   const alertMarkup = alert.getAlert();
   const [createdTag, setCreatedTag] = useState(null);

   const queryClient = useQueryClient();
   const isModalVisible = useSelector((s) => s.products.visible);

   const tagsQuery = useQuery(['TAGS'], () => api.get('/tags').then((res) => res.data), {
      enabled: !!isModalVisible,
      onSuccess: () => {
         console.log('onSuccess tags', createdTag, fieldValue);
         if (createdTag) {
            const _selectedTags = _cloneDeep(fieldValue);
            _selectedTags.push(createdTag._id);

            setFieldValue('tags', _selectedTags);
            setCreatedTag(null);
         }
      },
   });

   const createTagMutation = useMutation((payload) => api.post('/tags', payload).then((res) => res.data));

   const selectOptions = (tagsQuery.data || []).map(createSelectTagOption);

   const handleChange = (tags) => {
      if (!tags || tags.length <= 0) return setFieldValue('tags', []);
      const correspondingTagIds = tags.map((_tag) => _tag.value);
      setFieldValue('tags', correspondingTagIds);
   };

   const getSelectedTags = () => {
      if (tagsQuery.isLoading || tagsQuery.data?.length <= 0 || fieldValue.length <= 0) return [];
      return tagsQuery.data.filter((_tag) => fieldValue.includes(_tag._id)).map(createSelectTagOption);
   };

   const selectedTags = getSelectedTags();

   const handleCreateTag = (tagName) => {
      createTagMutation.mutate(
         { name: tagName },
         {
            onSuccess: (_createdTag) => {
               setCreatedTag(_createdTag);
               return queryClient.invalidateQueries('TAGS');
            },
            onError: (err) => alert.setErrorAlert({ message: 'Unable to add tag', err }),
         }
      );
   };

   return (
      <>
         {alertMarkup ? (
            <Row>
               <Col lg={12}>{alertMarkup}</Col>
            </Row>
         ) : null}
         <FormField label="Tags" name="tags">
            {() => (
               <CreatableSelect
                  isMulti
                  styles={defaultSelectStyles}
                  value={selectedTags}
                  isLoading={tagsQuery.isLoading}
                  options={selectOptions}
                  onChange={handleChange}
                  onCreateOption={handleCreateTag}
               />
            )}
         </FormField>
      </>
   );
};

export default SelectTags;
