import {
  useCallback,
  useEffect,
  useState
}
from "react";

import {
  useParams
}
from "react-router-dom";

import {
  BarChart3,
  BookOpen,
  MessageSquareText,
  Users
}
from "lucide-react";

import api
from "../api/axios";

import TeacherLayout
from "../layouts/TeacherLayout";

import PageHeader
from "../components/ui/PageHeader";

import LoadingSpinner
from "../components/ui/LoadingSpinner";

import StatCard
from "../components/dashboard/StatCard";

import TeacherStudentModal
from "../components/teachers/TeacherStudentModal";

import EnrollStudentModal
from "../components/admin/EnrollStudentModal";

import PieChartCard
from "../components/Charts/PieChartCard";

import ClassCommentSection
from "../components/classes/ClassCommentSection";

function TeacherClassDetails() {

  const { id } =
    useParams();

  const [data,setData] =
    useState(null);

  const [loading,setLoading] =
    useState(true);

  const [permissions,setPermissions] =
    useState({
      canCreateStudents:false,
      canCreateClasses:false,
      canEnrollStudents:false
    });

  const [
    enrollModalOpen,
    setEnrollModalOpen
  ] = useState(false);

  const [
    selectedStudent,
    setSelectedStudent
  ] = useState(null);

  const [
    modalOpen,
    setModalOpen
  ] = useState(false);

  const fetchData =
    useCallback(
      async ()=>{

        try{

          const [
            classResponse,
            permissionsResponse
          ] = await Promise.all([
            api.get(
              `/teacher/classes/${id}`
            ),
            api.get(
              "/teacher/permissions"
            )
          ]);

          setData(
            classResponse.data
          );

          setPermissions(
            permissionsResponse.data
          );

        }catch(error){

          console.error(error);

        }finally{

          setLoading(false);

        }

      },
      [id]
    );

  useEffect(()=>{

    fetchData();

  },[fetchData]);

  const scrollToSection =
    (sectionId)=>{
      document
        .getElementById(sectionId)
        ?.scrollIntoView({
          behavior:"smooth",
          block:"start"
        });
    };

  if(loading){

    return (

      <TeacherLayout>

        <LoadingSpinner />

      </TeacherLayout>

    );

  }

  return (

    <>

      <TeacherLayout>

        <PageHeader

          title={
            data.class.subject
          }

          subtitle={
            `Class & Section: ${data.class.name}`
          }

          backTo="/teacher/classes"

          backLabel="Back to subjects"

        />

        <div
          className="
          grid
          md:grid-cols-4
          gap-6
          mb-8
          "
        >

          <StatCard
            title="Students"
            value={
              data.studentCount
            }
            subtitle="Learners enrolled here"
            icon={Users}
            actionLabel="View students"
            onClick={()=>
              scrollToSection("teacher-class-students")
            }
          />

          <StatCard
            title="Assignments"
            value={
              data.assignmentCount
            }
            subtitle="Work assigned to this class"
            icon={BookOpen}
            actionLabel="View assignments"
            onClick={()=>
              scrollToSection("teacher-class-assignments")
            }
          />

          <StatCard
            title="Average Grade"
            value={
              data.averageGrade
            }
            subtitle="Current graded class average"
            icon={BarChart3}
            actionLabel="View grade distribution"
            onClick={()=>
              scrollToSection("teacher-grade-distribution")
            }
          />

          <StatCard
            title="Class Discussion"
            value={
              data.class?.comments?.length || 0
            }
            subtitle="Questions and replies"
            icon={MessageSquareText}
            actionLabel="Open comments"
            onClick={()=>
              scrollToSection("teacher-class-comments")
            }
          />

        </div>

        <div
  id="teacher-grade-distribution"
  className="
  mb-8
  scroll-mt-24
  "
>

  <PieChartCard

    title="Class Grade Distribution"

    data={
      data.gradeChart || []
    }

  />

</div>

        <div
          id="teacher-class-comments"
          className="mb-8 scroll-mt-24"
        >
          <ClassCommentSection
            endpoint={`/teacher/classes/${id}/comments`}
            canPin
          />
        </div>

        <div
          id="teacher-class-students"
          className="
          bg-white
          rounded-3xl
          shadow-md
          p-6
          mb-8
          scroll-mt-24
          "
        >

          <h2
            className="
            text-xl
            font-bold
            mb-4
            "
          >
            Students
          </h2>

          {
            permissions.canEnrollStudents &&

            <button
              onClick={()=>
                setEnrollModalOpen(true)
              }
              className="
              bg-[#008C95]
              text-white
              px-4
              py-2
              mb-4
              rounded-xl
              "
            >
              + Enroll Student
            </button>
          }

          <div
            className="
            space-y-3
            "
          >

            {

              data.class
              .enrollments
              .map(
                enrollment=>(

                  <div

                    key={
                      enrollment.id
                    }

                    onClick={()=>{

                      setSelectedStudent(

                        enrollment
                        .student
                        .id

                      );

                      setModalOpen(
                        true
                      );

                    }}

                    className="
                    border-b
                    p-3
                    cursor-pointer
                    hover:bg-gray-50
                    rounded-xl
                    transition
                    "

                  >

                    <div
                      className="
                      font-semibold
                      "
                    >

                      {
                        enrollment
                        .student
                        .user
                        .name
                      }

                    </div>

                    <div
                      className="
                      text-sm
                      text-gray-500
                      "
                    >

                      Roll Number:

                      {" "}

                      {
                        enrollment
                        .student
                        .rollNumber
                      }

                      {" "}
                      |
                      {" "}
                      Class & Section:
                      {" "}
                      {
                        enrollment
                        .student
                        .classSection ||
                        "Not set"
                      }

                    </div>

                  </div>

                )
              )

            }

          </div>

        </div>

        <div
          id="teacher-class-assignments"
          className="
          bg-white
          rounded-3xl
          shadow-md
          p-6
          scroll-mt-24
          "
        >

          <h2
            className="
            text-xl
            font-bold
            mb-4
            "
          >
            Assignments
          </h2>

          <div
            className="
            space-y-3
            "
          >

            {

              data.class
              .assignments
              .map(
                assignment=>(

                  <div

                    key={
                      assignment.id
                    }

                    className="
                    border-b
                    pb-3
                    "

                  >

                    <div
                      className="
                      font-semibold
                      "
                    >
                      {
                        assignment.title
                      }
                    </div>

                    <div
                      className="
                      text-sm
                      text-gray-500
                      "
                    >

                      Due:

                      {" "}

                      {

                        new Date(
                          assignment.dueDate
                        )
                        .toLocaleDateString()

                      }

                    </div>

                  </div>

                )
              )

            }

          </div>

        </div>

      </TeacherLayout>

      <TeacherStudentModal

        open={
          modalOpen
        }

        onClose={()=>{

          setModalOpen(
            false
          );

          setSelectedStudent(
            null
          );

        }}

        classId={
          id
        }

        studentId={
          selectedStudent
        }

        canManageStudents={
          permissions.canCreateStudents
        }

        onSuccess={
          fetchData
        }

      />

      <EnrollStudentModal
        open={
          enrollModalOpen
        }
        onClose={()=>
          setEnrollModalOpen(false)
        }
        classId={
          id
        }
        basePath="/teacher"
        onSuccess={
          fetchData
        }
      />

    </>

  );

}

export default TeacherClassDetails;
