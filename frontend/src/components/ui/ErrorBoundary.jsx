import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError:false
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError:true
    };
  }

  componentDidCatch(error, info) {
    console.error(
      "Unhandled frontend error",
      error,
      info
    );
  }

  render() {
    if(this.state.hasError) {
      return (
        <main
          className="
          min-h-screen
          bg-gray-50
          flex
          items-center
          justify-center
          px-6
          "
        >
          <section
            className="
            w-full
            max-w-md
            bg-white
            border
            border-gray-200
            rounded-2xl
            shadow-sm
            p-8
            text-center
            "
          >
            <h1
              className="
              text-2xl
              font-bold
              text-gray-900
              "
            >
              Something went wrong
            </h1>

            <p
              className="
              text-gray-600
              mt-3
              "
            >
              The app hit an unexpected error. Reload the page to start from a clean state.
            </p>

            <button
              type="button"
              onClick={()=>
                window.location.reload()
              }
              className="
              mt-6
              w-full
              bg-[#008C95]
              text-white
              font-semibold
              py-3
              rounded-xl
              hover:bg-teal-800
              transition
              "
            >
              Reload App
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
