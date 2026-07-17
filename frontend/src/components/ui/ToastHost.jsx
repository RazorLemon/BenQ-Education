import {
  useEffect,
  useState
}
from "react";

import {
  subscribeToToasts
}
from "../../utils/toast";

const toastStyles = {
  success:"border-green-200 bg-green-50 text-green-900",
  error:"border-red-200 bg-red-50 text-red-900",
  info:"border-teal-200 bg-teal-50 text-teal-950"
};

function ToastHost() {
  const [toasts,setToasts] =
    useState([]);

  useEffect(()=>{
    const unsubscribe =
      subscribeToToasts((toast)=>{
        setToasts((current)=>[
          ...current,
          toast
        ]);

        window.setTimeout(()=>{
          setToasts((current)=>
            current.filter((item)=>
              item.id !== toast.id
            )
          );
        }, 4200);
      });

    return unsubscribe;
  },[]);

  if(toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="
      fixed
      top-5
      right-5
      z-[9999]
      flex
      w-[min(420px,calc(100vw-2rem))]
      flex-col
      gap-3
      "
    >
      {
        toasts.map((toast)=>(
          <div
            key={toast.id}
            role="status"
            className={`
            rounded-xl
            border
            px-4
            py-3
            shadow-lg
            ${toastStyles[toast.type] || toastStyles.info}
            `}
          >
            <div
              className="
              text-sm
              font-semibold
              "
            >
              {toast.title}
            </div>

            <div
              className="
              mt-1
              text-sm
              leading-5
              "
            >
              {toast.message}
            </div>
          </div>
        ))
      }
    </div>
  );
}

export default ToastHost;
