import { useQuery as useReactQuery, useMutation as useReactMutation } from 'react-query';

export const useQuery = (key, fn, options = {}) => {
   const query = useReactQuery(key, fn, { keepPreviousData: true, retry: false, ...options });
   return query;
};

export const useMutation = (fn, options = {}) => {
   const mutation = useReactMutation(fn, { retry: false, ...options });
   return mutation;
};
