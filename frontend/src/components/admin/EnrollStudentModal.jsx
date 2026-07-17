import {
 useEffect,
 useState
}
from "react";

import api
from "../../api/axios";

function EnrollStudentModal({
 open,
 onClose,
 classId,
 onSuccess,
 basePath = "/admin"
}){

 const [
  students,
  setStudents
 ] = useState([]);

 const [
  search,
  setSearch
 ] = useState("");

 const [
  selectedStudents,
  setSelectedStudents
 ] = useState([]);

 useEffect(()=>{

  if(!open){
   return;
  }

  const fetchStudents =
   async ()=>{

    try{

     const response =
      await api.get(
       `${basePath}/classes/${classId}/available-students`
      );

     const sortedStudents =

      response.data.sort(
       (a,b)=>

        `${a.classSection || ""}-${a.rollNumber}`
        .localeCompare(
         `${b.classSection || ""}-${b.rollNumber}`
        )
        ||
        a.rollNumber.localeCompare(
         b.rollNumber
        )
      );

     setStudents(
      sortedStudents
     );

    }catch(error){

     console.error(error);

    }

   };

  fetchStudents();

 },[
  open,
 classId
 ,
 basePath
 ]);

 if(!open){
  return null;
 }

 const filteredStudents =

  students.filter(
   student=>

    student.user.name
    .toLowerCase()
    .includes(
     search.toLowerCase()
    )

    ||

    student.rollNumber
    .toLowerCase()
    .includes(
     search.toLowerCase()
    )

    ||

    student.classSection
    ?.toLowerCase()
    .includes(
     search.toLowerCase()
    )
  );

 const toggleStudent =
  (studentId)=>{

   if(

    selectedStudents.includes(
     studentId
    )

   ){

    setSelectedStudents(

     selectedStudents.filter(
      id=>

       id !==
       studentId
     )

    );

   }else{

    setSelectedStudents([
     ...selectedStudents,
     studentId
    ]);

   }

  };

 const handleEnroll =
  async ()=>{

   if(
    selectedStudents.length === 0
   ){

    return;

   }

   try{

    await Promise.all(

     selectedStudents.map(
      studentId=>

       api.post(

        `${basePath}/classes/${classId}/enroll`,

        {
         studentId
        }

       )
     )

    );

    onSuccess();

    onClose();

   }catch(error){

    console.error(error);

   }

  };

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
  >

   <div
    className="
    bg-white
    p-8
    rounded-3xl
    w-full
    max-w-2xl
    "
   >

    <h2
     className="
     text-2xl
     font-bold
     mb-6
     "
    >
     Enroll Students
    </h2>

    <input

     value={search}

     onChange={(e)=>
      setSearch(
       e.target.value
      )
     }

     placeholder="
     Search by name, roll number, or class section...
     "

     className="
     w-full
     border
     rounded-xl
     p-3
     mb-4
     "

    />

    <div
     className="
     border
     rounded-xl
     max-h-80
     overflow-y-auto
     "
    >

     {

      filteredStudents.map(
       student=>(

        <label

         key={
          student.id
         }

         className="
         flex
         items-center
         gap-3
         p-4
         border-b
         cursor-pointer
         hover:bg-gray-50
         "

        >

         <input

          type="checkbox"

          checked={

           selectedStudents.includes(
            student.id
           )

          }

          onChange={()=>
           toggleStudent(
            student.id
           )
          }

         />

         <div>

          <div
           className="
           font-medium
           "
          >

           {
            student.user.name
           }

          </div>

          <div
           className="
           text-sm
           text-gray-500
           "
          >

           Roll No:
           {" "}
           {
            student.rollNumber
           }

           {" "}
           |
           {" "}
           Class & Section:
           {" "}
           {
            student.classSection ||
            "Not set"
           }

          </div>

         </div>

        </label>

       )
      )

     }

    </div>

    <div
     className="
     mt-4
     text-sm
     text-gray-500
     "
    >

     Selected:
     {" "}
     {
      selectedStudents.length
     }
     {" "}
     student(s)

    </div>

    <div
     className="
     flex
     gap-3
     mt-6
     "
    >

     <button

      onClick={
       onClose
      }

      className="
      flex-1
      border
      rounded-xl
      py-3
      "

     >

      Cancel

     </button>

     <button

      onClick={
       handleEnroll
      }

      className="
      flex-1
      bg-[#008C95]
      text-white
      rounded-xl
      py-3
      "

     >

      Enroll Selected

     </button>

    </div>

   </div>

  </div>

 );

}

export default EnrollStudentModal;
