function LoadingSpinner() {

  return (

    <div
      className="
      flex
      justify-center
      items-center
      py-20
      "
    >

      <div
        className="
        w-12
        h-12
        border-4
        border-teal-200
        border-t-[#008C95]
        rounded-full
        animate-spin
        "
      />

    </div>

  );

}

export default LoadingSpinner;