import { useNavigate } from "react-router-dom";

import Button from "../ui/Button";

function QuickActions() {
  const navigate =
    useNavigate();

  return (

    <div
      className="
      bg-white
      rounded-2xl
      p-6
      shadow-md
      "
    >

      <h3
        className="
        text-lg
        font-semibold
        mb-4
        "
      >
        Quick Actions
      </h3>

      <div
        className="
        flex
        gap-4
        flex-wrap
        "
      >

        <Button
          className="w-full sm:w-auto sm:min-w-[150px]"
          onClick={()=>
            navigate("/admin/teachers")
          }
        >
          Add Teacher
        </Button>

        <Button
          className="w-full sm:w-auto sm:min-w-[150px]"
          onClick={()=>
            navigate("/admin/students")
          }
        >
          Add Student
        </Button>

        <Button
          className="w-full sm:w-auto sm:min-w-[150px]"
          onClick={()=>
            navigate("/admin/classes")
          }
        >
          Create Subject
        </Button>

      </div>

    </div>

  );

}

export default QuickActions;
