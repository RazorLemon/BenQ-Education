import {
 useEffect,
 useState
}
from "react";

import api
from "../../api/axios";

import PerformanceTrendChart
from "./PerformanceTrendChart";

import {
 notifySuccess
}
from "../../utils/toast";

function TeacherStudentModal({

 open,
 onClose,
 classId,
 studentId,
 canManageStudents = false,
 onSuccess

}){

 const [
 data,
  setData
 ] = useState(null);

 const [
  studentForm,
  setStudentForm
 ] = useState({
  name:"",
  email:"",
  rollNumber:"",
  classSection:""
 });

 const [
  savingStudent,
  setSavingStudent
 ] = useState(false);

 useEffect(()=>{

  if(
   !open ||
   !studentId
  ){
   return;
  }

  const fetchData =
   async ()=>{

    try{

     const response =
      await api.get(

       `/teacher/classes/${classId}/students/${studentId}`

      );

     setData(
      response.data
     );

     setStudentForm({
      name:
       response.data.student
       .user.name,
      email:
       response.data.student
       .user.email,
      rollNumber:
       response.data.student
       .rollNumber,
      classSection:
       response.data.student
       .classSection || ""
     });

    }catch(error){

     console.error(error);

    }

   };

  fetchData();

 },[
  open,
  classId,
  studentId
 ]);

 const updateStudent =
  async ()=>{

   try{

    setSavingStudent(true);

    const response =
     await api.put(
      `/teacher/classes/${classId}/students/${studentId}`,
      studentForm
     );

    setData({
     ...data,
     student:
      response.data
    });

    setStudentForm({
     name:
      response.data.user.name,
     email:
      response.data.user.email,
     rollNumber:
      response.data.rollNumber,
     classSection:
      response.data.classSection || ""
    });

    if(onSuccess){
     await onSuccess();
    }

    notifySuccess(
     "Student updated"
    );

   }catch(error){

    console.error(error);

   }finally{

    setSavingStudent(false);

   }

  };

 if(
  !open ||
  !data
 ){

  return null;

 }

 return(

  <div
   className="
   fixed
   inset-0
   bg-black/50
   flex
   items-center
   justify-center
   z-50
   "
   onClick={onClose}
  >

   <div

    onClick={(e)=>
     e.stopPropagation()
    }

    className="
    bg-white
    rounded-3xl
    p-8
    w-full
    max-w-4xl
    max-h-[90vh]
    overflow-y-auto
    "

   >

    <div
     className="
     flex
     justify-between
     mb-6
     "
    >

     <h2
      className="
      text-2xl
      font-bold
      "
     >

      Student Performance

     </h2>

     <button
      onClick={onClose}
     >
      ✕
     </button>

    </div>

    <div className="mb-6">

     <h3
      className="
      text-xl
      font-semibold
      "
     >

      {
       data.student.user.name
      }

     </h3>

     {
      canManageStudents

      ? (

       <div
        className="
        grid
        md:grid-cols-2
        gap-4
        mt-4
        "
       >

        <input
         value={studentForm.name}
         onChange={(event)=>
          setStudentForm({
           ...studentForm,
           name:event.target.value
          })
         }
         placeholder="Name"
         className="border rounded-xl p-3"
        />

        <input
         value={studentForm.email}
         onChange={(event)=>
          setStudentForm({
           ...studentForm,
           email:event.target.value
          })
         }
         placeholder="Email"
         className="border rounded-xl p-3"
        />

        <input
         value={studentForm.rollNumber}
         onChange={(event)=>
          setStudentForm({
           ...studentForm,
           rollNumber:event.target.value
          })
         }
         placeholder="Roll Number"
         className="border rounded-xl p-3"
        />

        <input
         value={studentForm.classSection}
         onChange={(event)=>
          setStudentForm({
           ...studentForm,
           classSection:event.target.value
          })
         }
         placeholder="Class & Section"
         className="border rounded-xl p-3"
        />

        <button
         onClick={updateStudent}
         disabled={savingStudent}
         className="
         md:col-span-2
         bg-[#008C95]
         text-white
         px-4
         py-3
         rounded-xl
         disabled:opacity-60
         "
        >
         {
          savingStudent
          ? "Saving..."
          : "Save Student Details"
         }
        </button>

       </div>

      )

      : (

       <div className="mt-2 text-gray-600">
        <p>
         Email:
         {" "}
         {
          data.student.user.email
         }
        </p>

        <p>
         Roll Number:
         {" "}
         {
          data.student.rollNumber
         }
        </p>

        <p>
         Class & Section:
         {" "}
         {
          data.student.classSection ||
          "Not set"
         }
        </p>
       </div>

      )
     }

    </div>

    <div
     className="
     grid
     md:grid-cols-4
     gap-4
     mb-8
     "
    >

     <div className="bg-gray-100 p-4 rounded-xl">
      Average Grade
      <div className="font-bold text-xl">
       {data.averageGrade}
      </div>
     </div>

     <div className="bg-gray-100 p-4 rounded-xl">
      Submitted
      <div className="font-bold text-xl">
       {data.submittedCount}
       /
       {data.totalAssignments}
      </div>
     </div>

     <div className="bg-gray-100 p-4 rounded-xl">
      Missing
      <div className="font-bold text-xl">
       {data.missingCount}
      </div>
     </div>

     <div className="bg-gray-100 p-4 rounded-xl">
      Late
      <div className="font-bold text-xl">
       {data.lateCount}
      </div>
     </div>

    </div>

<h3
 className="
 text-lg
 font-bold
 mb-4
 "
>

 Performance Trend

</h3>

<PerformanceTrendChart
 history={
  data.history
 }
/>

    <h3
     className="
     text-lg
     font-bold
     mb-3
     "
    >

     Assignment History

    </h3>

    {

     data.history.map(
      item=>(

       <div

        key={
         item.title
        }

        className="
        border-b
        py-3
        "

       >

       <div
 className="
 font-medium
 mb-2
 "
>
 {item.title}
</div>

<input

 type="number"

 defaultValue={
  item.grade ?? ""
 }

 placeholder="Grade"

 id={`grade-${item.submissionId}`}

 className="
 w-full
 border
 rounded-xl
 p-2
 mb-2
 "

/>

<textarea

 defaultValue={
  item.feedback ?? ""
 }

 placeholder="Feedback"

 id={`feedback-${item.submissionId}`}

 className="
 w-full
 border
 rounded-xl
 p-2
 mb-2
 "

/>

<button

 onClick={async()=>{

  try{

   const grade =

    document.getElementById(

     `grade-${item.submissionId}`

    ).value;

   const feedback =

    document.getElementById(

     `feedback-${item.submissionId}`

    ).value;

   await api.post(

    `/teacher/submissions/${item.submissionId}/grade`,

    {
     grade:
      Number(grade),

     feedback
    }

   );

   notifySuccess(
    "Saved"
   );

  }catch(error){

   console.error(error);

  }

 }}

 className="
 bg-[#008C95]
 text-white
 px-4
 py-2
 rounded-xl
 "

>

 Save Grade

</button>

       </div>

      )
     )

    }

    <h3
     className="
     text-lg
     font-bold
     mt-8
     mb-3
     "
    >

     Missing Assignments

    </h3>

    {

     data.missingAssignments
     .length === 0

     ? (

      <div>
       No missing assignments
      </div>

     )

     : (

      data.missingAssignments
      .map(
       item=>(

        <div

         key={
          item.title
         }

         className="
         border-b
         py-3
         text-red-500
         "

        >

         {item.title}

        </div>

       )
      )

     )

    }

   </div>

  </div>

 );

}

export default TeacherStudentModal;
