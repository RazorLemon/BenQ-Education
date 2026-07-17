const listeners = new Set();

const getId = () =>
  `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

export const subscribeToToasts = (listener) => {
  listeners.add(listener);

  return ()=>
    listeners.delete(listener);
};

const publishToast = (toast) => {
  listeners.forEach((listener)=>
    listener(toast)
  );
};

export const notify = ({
  type = "info",
  title,
  message
}) => {
  publishToast({
    id:getId(),
    type,
    title,
    message
  });
};

export const notifySuccess = (message) =>
  notify({
    type:"success",
    title:"Success",
    message
  });

export const notifyError = (message) =>
  notify({
    type:"error",
    title:"Action needed",
    message
  });

export const getApiErrorMessage = (error) => {
  const data =
    error?.response?.data;

  if(Array.isArray(data?.errors) && data.errors.length > 0) {
    const firstError =
      data.errors[0];

    if(firstError?.message) {
      return firstError.field
        ? `${firstError.field}: ${firstError.message}`
        : firstError.message;
    }
  }

  if(data?.message) {
    return data.message;
  }

  if(error?.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};
