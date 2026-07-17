import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
}
from "react";

import {
  motion
}
from "framer-motion";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  X
}
from "lucide-react";

import api
from "../../api/axios";

import {
  notifySuccess
}
from "../../utils/toast";

const typeMeta = {
 HOLIDAY:{
  label:"Holiday",
  color:"#009B8C",
  bg:"#ECFDF5"
 },
 EVENT:{
  label:"Event",
  color:"#2563EB",
  bg:"#EFF6FF"
 },
 ASSIGNMENT:{
  label:"Assignment",
  color:"#F59E0B",
  bg:"#FFFBEB"
 },
 QUIZ:{
  label:"Quiz",
  color:"#EAB308",
  bg:"#FEFCE8"
 },
 TEST:{
  label:"Test",
  color:"#F97316",
  bg:"#FFF7ED"
 },
 EXAM:{
  label:"Exam",
  color:"#DC2626",
  bg:"#FEF2F2"
 },
 ANNOUNCEMENT:{
  label:"Announcement",
  color:"#0F766E",
  bg:"#ECFDF5"
 },
 MEETING:{
  label:"Meeting",
  color:"#4F46E5",
  bg:"#EEF2FF"
 },
 WEEKEND:{
  label:"Weekend",
  color:"#64748B",
  bg:"#F8FAFC"
 }
};

const calendarCreateTypes = [
 "EVENT",
 "HOLIDAY",
 "EXAM"
];

const views = {
 week:"Weekly",
 month:"Monthly",
 year:"Yearly"
};

const dayNames = [
 "Sun",
 "Mon",
 "Tue",
 "Wed",
 "Thu",
 "Fri",
 "Sat"
];

const monthNames = [
 "January",
 "February",
 "March",
 "April",
 "May",
 "June",
 "July",
 "August",
 "September",
 "October",
 "November",
 "December"
];

const toInputDate = (date) => {
 const value =
  new Date(date);

 return [
  value.getFullYear(),
  `${value.getMonth() + 1}`.padStart(2, "0"),
  `${value.getDate()}`.padStart(2, "0")
 ].join("-");
};

const normalizeDate = (date) => {
 const value =
  new Date(date);

 value.setHours(0,0,0,0);

 return value;
};

const addDays = (
 date,
 days
) => {
 const value =
  new Date(date);

 value.setDate(
  value.getDate() + days
 );

 return value;
};

const isSameDay = (
 first,
 second
) =>
 toInputDate(first) === toInputDate(second);

const isOffDay = (
 date,
 settings
) =>
 date.getDay() === 0 ||
 (
  settings.saturdayOff !== false &&
  date.getDay() === 6
 );

const startOfWeek = (date) => {
 const value =
  normalizeDate(date);

 value.setDate(
  value.getDate() - value.getDay()
 );

 return value;
};

const getMonthDates = (date) => {
 const year =
  date.getFullYear();

 const month =
  date.getMonth();

 const days =
  new Date(
   year,
   month + 1,
   0
  ).getDate();

 return Array.from(
  {
   length:days
  },
  (_,index)=>
   new Date(
    year,
    month,
    index + 1
   )
 );
};

const eventTouchesDate = (
 event,
 date
) => {
 const start =
  normalizeDate(event.startDate);

 const end =
  normalizeDate(event.endDate || event.startDate);

 const day =
  normalizeDate(date);

 return day >= start && day <= end;
};

const getClassLabel = (classItem) => {
 if(!classItem){
  return "";
 }

 return `${classItem.subject || "Subject"} (${classItem.name || "Class"})`;
};

const getGradeLabel = (classItem) => {
 const name =
  classItem?.name || "";

 const match =
  name.match(/\d+[A-Za-z]?/);

 return match
  ? `Grade ${match[0]}`
  : name.split(/[-\s]/)[0] || "Grade";
};

const getSectionLabel = (classItem) => {
 const name =
  classItem?.name || "";

 const match =
  name.match(/(?:section\s*)?([A-Za-z])$/i) ||
  name.match(/[-\s]([A-Za-z])$/);

 return match
  ? `Section ${match[1].toUpperCase()}`
  : "Section";
};

const formatFullDate = (date) =>
 new Date(date).toLocaleDateString(
  undefined,
  {
   weekday:"long",
   day:"2-digit",
   month:"long"
  }
 );

const formatShortDate = (date) =>
 new Date(date).toLocaleDateString(
  undefined,
  {
   month:"short",
   day:"numeric"
  }
 );

const hasTime = (date) => {
 const value =
  new Date(date);

 return value.getHours() !== 0 ||
  value.getMinutes() !== 0;
};

const formatTime = (date) =>
 new Date(date).toLocaleTimeString(
  undefined,
  {
   hour:"numeric",
   minute:"2-digit",
   hour12:true
  }
 );

const hours12 =
 Array.from(
  {
   length:12
  },
  (_,index)=>
   `${index + 1}`
 );

const minutes =
 [
  "00",
  "15",
  "30",
  "45"
 ];

const to24HourTime = (
 hour,
 minute,
 period
) => {
 const numericHour =
  Number(hour);

 const hour24 =
  period === "AM"
  ? numericHour === 12
   ? 0
   : numericHour
  : numericHour === 12
  ? 12
  : numericHour + 12;

 return `${`${hour24}`.padStart(2, "0")}:${minute}:00`;
};

const buildDateTime = (
 date,
 hour,
 minute,
 period
) =>
 `${date}T${to24HourTime(hour,minute,period)}`;

function EventCard({
 event
}) {
 const meta =
  typeMeta[event.eventType] ||
  typeMeta.EVENT;

 const classLabel =
  event.classes
  ?.map(getClassLabel)
  .filter(Boolean)
  .join(", ");

 return (
  <div
   className="
    overflow-hidden
    rounded-xl
    bg-white
    shadow-sm
    ring-1
    ring-gray-100
   "
  >
   <div
    className="
     flex
     items-center
     gap-2
     px-4
     py-3
     text-sm
     font-bold
     text-white
    "
    style={{
     backgroundColor:meta.color
    }}
   >
    <CalendarDays size={16} />
    {formatFullDate(event.startDate)}
   </div>

   <div className="flex items-start justify-between gap-4 px-4 py-4">
    <div className="min-w-0">
     <p className="truncate text-sm font-bold text-gray-900">
      {event.title}
     </p>

     <p className="mt-1 text-xs text-gray-500">
      {
       hasTime(event.startDate)
       ? formatTime(event.startDate)
       : "All day"
      }
      {
       classLabel &&
       ` - ${classLabel}`
      }
     </p>

     {
      event.description && (
       <p className="mt-2 line-clamp-2 text-sm text-gray-600">
        {event.description}
       </p>
      )
     }
    </div>

    <span
     className="
      shrink-0
      rounded-full
      border
      px-3
      py-1
      text-xs
      font-bold
     "
     style={{
      borderColor:meta.color,
      color:meta.color
     }}
    >
     {meta.label}
    </span>
   </div>
  </div>
 );
}

function EmptyState({
 label = "No events"
}) {
 return (
  <div className="rounded-xl bg-white p-5 text-sm text-gray-500 shadow-sm ring-1 ring-gray-100">
   {label}
  </div>
 );
}

const getEventColor = (event) =>
 (typeMeta[event.eventType] || typeMeta.EVENT).color;

const getMultiEventGradient = (events) => {
 const colors =
  [
   ...new Set(
    events.map(getEventColor)
   )
  ].slice(0,4);

 const slice =
  100 / colors.length;

 return `conic-gradient(${
  colors.map(
   (color,index)=>
    `${color} ${index * slice}% ${(index + 1) * slice}%`
  ).join(", ")
 })`;
};

function DateCircle({
 day,
 dayEvents,
 offDay,
 selected,
 compactYear = false,
 compactMonth = false
}) {
 const firstEvent =
  dayEvents[0];

 const multipleEvents =
  dayEvents.length > 1;

 const highlighted =
  firstEvent ||
  offDay;

 const meta =
  firstEvent
  ? typeMeta[firstEvent.eventType] || typeMeta.EVENT
  : typeMeta.WEEKEND;

 const sizeClass =
  compactYear
  ? "h-6 w-6 text-[11px]"
  : compactMonth
  ? "h-7 w-7 text-xs"
  : "h-9 w-9 text-sm";

 const innerSizeClass =
  compactYear
  ? "h-4 w-4"
  : compactMonth
  ? "h-5 w-5"
  : "h-6 w-6";

 const badgeClass =
  compactYear
  ? "h-3.5 min-w-3.5 px-0.5 text-[8px]"
  : compactMonth
  ? "h-4 min-w-4 px-0.5 text-[8px]"
  : "h-[18px] min-w-[18px] px-1 text-[9px]";

 return (
  <span
   className={`
    relative
    mx-auto
    my-1
    flex
    items-center
    justify-center
    rounded-full
    font-bold
    transition
    ${sizeClass}
   `}
   style={{
    background:
     multipleEvents
     ? getMultiEventGradient(dayEvents)
     : highlighted
     ? meta.color
     : selected
     ? "#E6F7F5"
     : "transparent",
    color:
     highlighted && !multipleEvents
     ? "#FFFFFF"
     : "#374151",
    outline:
     selected && !highlighted
     ? "2px solid #008C95"
     : "none"
   }}
  >
   {
    multipleEvents
    ? (
     <>
      <span
       className={`
        flex
        items-center
        justify-center
        rounded-full
        bg-white
        text-gray-900
        ${innerSizeClass}
       `}
      >
       {day.getDate()}
      </span>

      <span
       className={`
        absolute
        ${
         compactMonth || compactYear
         ? "-right-0.5 -top-0.5"
         : "-right-1 -top-1"
        }
        flex
        items-center
        justify-center
        rounded-full
        bg-gray-900
        font-black
        leading-none
        text-white
        ring-2
        ring-white
        ${badgeClass}
       `}
      >
       {dayEvents.length}
      </span>
     </>
    )
    : day.getDate()
   }
  </span>
 );
}

function AcademicCalendar({
 endpoint,
 createEndpoint,
 allowCreate = false,
 compact = false
}) {
 const [events,setEvents] =
  useState([]);

 const [classes,setClasses] =
  useState([]);

 const [canCreate,setCanCreate] =
  useState(false);

 const [settings,setSettings] =
  useState({
   saturdayOff:true,
   calendarDefaultView:"week"
  });

 const [loading,setLoading] =
  useState(true);

 const [view,setView] =
  useState("week");

 const defaultViewApplied =
  useRef(false);

 const [currentDate,setCurrentDate] =
  useState(new Date());

 const [selectedDate,setSelectedDate] =
  useState(new Date());

 const [monthSelectedDate,setMonthSelectedDate] =
  useState(null);

 const [showForm,setShowForm] =
  useState(false);

 const todayInput =
  toInputDate(new Date());

 const [form,setForm] =
  useState({
   title:"",
   description:"",
  eventType:"EVENT",
  visibility:"SCHOOL",
  targetValue:"",
  multipleDates:false,
  dates:[
   todayInput
  ],
  dateDraft:todayInput,
  wholeDay:false,
  startHour:"9",
  startMinute:"00",
  startPeriod:"AM",
  endHour:"10",
  endMinute:"00",
  endPeriod:"AM",
  classIds:[]
 });

 const fetchCalendar =
  useCallback(async ()=>{
   setLoading(true);

   try{
    const response =
     await api.get(endpoint);

    setEvents(
     Array.isArray(response.data.events)
     ? response.data.events
     : []
    );

    setClasses(
     Array.isArray(response.data.classes)
     ? response.data.classes
     : []
    );

    setCanCreate(
     allowCreate ||
     response.data.canCreate === true
    );

    const nextSettings = {
     saturdayOff:
      response.data.settings?.saturdayOff ?? true,
     calendarDefaultView:
      response.data.settings?.calendarDefaultView ||
      "week"
    };

    setSettings(
     nextSettings
    );

    if(!defaultViewApplied.current){
     setView(
      nextSettings.calendarDefaultView
     );
     defaultViewApplied.current = true;
    }
   }catch(error){
    console.error(error);
   }finally{
    setLoading(false);
   }
  },[
   allowCreate,
   endpoint
  ]);

 useEffect(()=>{
  fetchCalendar();
 },[
  fetchCalendar
 ]);

 const sortedEvents =
  useMemo(
   ()=>
    [
     ...events
    ].sort(
     (a,b)=>
      new Date(a.startDate) -
      new Date(b.startDate)
    ),
   [
    events
   ]
  );

 const gradeOptions =
  useMemo(
   ()=>
    [
     ...new Set(
      classes.map(getGradeLabel)
     )
    ].filter(Boolean),
   [
    classes
   ]
  );

 const sectionOptions =
  useMemo(
   ()=>
    [
     ...new Set(
      classes.map(getSectionLabel)
     )
    ].filter(Boolean),
   [
    classes
   ]
  );

 const eventsForDate =
  (date)=>
   sortedEvents.filter(
    event=>
     eventTouchesDate(
      event,
      date
     )
   );

 const monthEvents =
  sortedEvents.filter(
   event=>{
    const date =
     new Date(event.startDate);

    return date.getFullYear() === currentDate.getFullYear() &&
     date.getMonth() === currentDate.getMonth();
   }
  );

 const weekStart =
  startOfWeek(currentDate);

 const weekDays =
  Array.from(
   {
    length:7
   },
   (_,index)=>
    addDays(weekStart,index)
  );

 const movePeriod =
  (direction)=>{
   const next =
    new Date(currentDate);

   if(view === "week"){
    next.setDate(
     next.getDate() + direction * 7
    );
   }

   if(view === "month"){
    next.setMonth(
     next.getMonth() + direction
    );
   }

   if(view === "year"){
    next.setFullYear(
     next.getFullYear() + direction
    );
   }

   setCurrentDate(next);
   setSelectedDate(next);
   setMonthSelectedDate(null);
  };

 const toggleClass =
  (classId)=>{
   setForm(
    value=>({
     ...value,
     classIds:
      value.classIds.includes(classId)
      ? value.classIds.filter(
       id=>id !== classId
      )
      : [
       ...value.classIds,
       classId
      ]
    })
   );
  };

 const toggleFormDate = (date) => {
  setForm(
   value=>({
    ...value,
    dates:
     value.dates.includes(date)
     ? value.dates.length <= 1
      ? value.dates
      : value.dates.filter(
       item=>item !== date
      )
     : [
      ...value.dates,
      date
     ].sort()
   })
  );
 };

 const removeFormDate = (date) => {
  setForm(
   value=>({
    ...value,
    dates:
     value.dates.length <= 1
     ? value.dates
     :
     value.dates.filter(
      item=>item !== date
     )
   })
  );
 };

 const moveFormMonth = (direction) => {
  setForm(
   value=>{
    const next =
     new Date(`${value.dateDraft}T00:00:00`);

    next.setMonth(
     next.getMonth() + direction
    );

    return {
     ...value,
     dateDraft:toInputDate(next)
    };
   }
  );
 };

 const updateTimeField = (
  field,
  value
 ) => {
  setForm(
   current=>({
    ...current,
    [field]:value
   })
  );
 };

 const handleSubmit =
  async (event)=>{
   event.preventDefault();

   const scopedClassIds =
    form.visibility === "CLASS"
    ? form.classIds
    : form.visibility === "GRADE"
    ? classes
     .filter(
      classItem=>
       getGradeLabel(classItem) === form.targetValue
     )
     .map(
      classItem=>classItem.id
     )
    : form.visibility === "SECTION"
    ? classes
     .filter(
      classItem=>
       getSectionLabel(classItem) === form.targetValue
     )
     .map(
      classItem=>classItem.id
     )
    : [];

   const scope =
    form.visibility === "TEACHER"
    ? "TEACHER"
    : form.visibility === "SCHOOL"
    ? "SCHOOL"
    : "CLASS";

   await Promise.all(
    form.dates.map(
     date=>
      api.post(
       createEndpoint,
       {
        title:form.title,
        description:form.description,
        eventType:form.eventType,
        scope,
        startDate:
         form.wholeDay
         ? `${date}T00:00:00`
         : buildDateTime(
           date,
           form.startHour,
           form.startMinute,
           form.startPeriod
          ),
        endDate:
         form.wholeDay
         ? `${date}T00:00:00`
         : buildDateTime(
           date,
           form.endHour,
           form.endMinute,
           form.endPeriod
          ),
        classIds:scopedClassIds
       }
      )
    )
   );

   notifySuccess(
    form.dates.length === 1
    ? "Calendar item created"
    : "Calendar items created"
   );

   setShowForm(false);
   setForm({
    title:"",
    description:"",
    eventType:"EVENT",
    visibility:"SCHOOL",
    targetValue:"",
    multipleDates:false,
    dates:[
     todayInput
    ],
    dateDraft:todayInput,
    wholeDay:false,
    startHour:"9",
    startMinute:"00",
    startPeriod:"AM",
    endHour:"10",
    endMinute:"00",
    endPeriod:"AM",
    classIds:[]
   });

   fetchCalendar();
  };

 const renderMonthGrid =
  (date,{
   compactYear = false
  } = {}) => {
   const dates =
    getMonthDates(date);

   const leading =
    new Date(
     date.getFullYear(),
     date.getMonth(),
     1
    ).getDay();

   return (
    <div>
     <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500">
      {
       dayNames.map(
        day=>(
         <span
          key={day}
          className={compactYear ? "py-1" : "py-2"}
         >
          {compactYear ? day[0] : day}
         </span>
        )
       )
      }
     </div>

     <div className="grid grid-cols-7 text-center">
      {
       Array.from({
        length:leading
       }).map(
        (_,index)=>(
         <span
          key={`blank-${index}`}
          className={compactYear ? "h-7" : "h-12"}
         />
        )
       )
      }

      {
       dates.map(
        day=>{
         const dayEvents =
          eventsForDate(day);

         const selected =
          monthSelectedDate &&
          isSameDay(day,monthSelectedDate);

         return (
          <button
           type="button"
           key={toInputDate(day)}
           onClick={()=>{
            if(compactYear){
             setCurrentDate(day);
             setView("month");
             setMonthSelectedDate(null);
             return;
            }

            setMonthSelectedDate(
             monthSelectedDate &&
             isSameDay(day,monthSelectedDate)
             ? null
             : day
            );
           }}
           className="block w-full"
          >
         <DateCircle
            day={day}
            dayEvents={dayEvents}
            offDay={isOffDay(day,settings)}
            selected={selected}
            compactYear={compactYear}
            compactMonth={!compactYear}
           />
          </button>
         );
        }
       )
      }
     </div>
    </div>
   );
  };

 const renderWeek = () => (
  <div className="space-y-4">
   <div className="grid grid-cols-7 gap-1">
    {
     weekDays.map(
     day=>{
       const dayEvents =
        eventsForDate(day);

       return (
        <button
         type="button"
         key={toInputDate(day)}
         onClick={()=>
          setSelectedDate(day)
         }
         className="rounded-xl px-1 py-2 text-center transition hover:bg-gray-50"
        >
         <p className="text-xs font-semibold text-gray-500">
          {dayNames[day.getDay()]}
         </p>

         <DateCircle
          day={day}
          dayEvents={dayEvents}
          offDay={isOffDay(day,settings)}
          selected={isSameDay(day,selectedDate)}
         />
        </button>
       );
      }
     )
    }
   </div>

   <div className="space-y-3">
    <h4 className="text-sm font-bold text-[#008C95]">
     Events
    </h4>

    {
     selectedEvents.length === 0
     ? <EmptyState label="No events for this day" />
     : selectedEvents.map(
      event=>(
       <EventCard
        key={event.id}
        event={event}
       />
      )
     )
    }
   </div>
  </div>
 );

 const selectedEvents =
  eventsForDate(selectedDate);

 const selectedMonthEvents =
  monthSelectedDate
  ? eventsForDate(monthSelectedDate)
  : monthEvents;

 const renderMonth = () => (
  <div className="space-y-5">
   <div className="rounded-xl bg-white p-4 shadow-md ring-1 ring-gray-100">
    {renderMonthGrid(currentDate)}
   </div>

   <div className="space-y-3">
   <h4 className="text-sm font-bold text-[#008C95]">
     {
      monthSelectedDate
      ? `Events on ${formatShortDate(monthSelectedDate)}`
      : "Events this month"
     }
    </h4>

    {
     selectedMonthEvents.length === 0
     ? (
      <EmptyState
       label={
        monthSelectedDate
        ? "No events for this day"
        : "No events this month"
       }
      />
     )
     : selectedMonthEvents.map(
      event=>(
       <EventCard
        key={event.id}
        event={event}
       />
      )
     )
    }
   </div>
  </div>
 );

 const renderYear = () => (
  <div
   className={
    compact
    ? "grid gap-4"
    : "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
   }
  >
   {
    monthNames.map(
     (month,index)=>(
      <div
       key={month}
       className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100"
      >
       <button
        type="button"
        onClick={()=>{
         setCurrentDate(
          new Date(
           currentDate.getFullYear(),
           index,
           1
          )
         );
         setView("month");
        }}
        className="mb-2 w-full text-left text-sm font-bold text-gray-900"
       >
        {month}
       </button>

       {renderMonthGrid(
        new Date(
         currentDate.getFullYear(),
         index,
         1
        ),
        {
         compactYear:true
        }
       )}
      </div>
     )
    )
   }
  </div>
 );

 const monthTitle =
  currentDate.toLocaleDateString(
   undefined,
   {
    month:"long",
    year:"numeric"
   }
  );

 const weekTitle =
  `${formatShortDate(weekStart)} - ${formatShortDate(addDays(weekStart,6))}`;

 const title =
  view === "week"
  ? weekTitle
  : view === "year"
  ? `${currentDate.getFullYear()}`
  : monthTitle;

 return (
  <div className="relative">
   <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
    <div className="bg-[#008C95] px-5 py-4 text-white">
     <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
       <CalendarDays size={19} />
       <h3 className="truncate text-lg font-bold">
        Academic Calendar
       </h3>
      </div>

      {
       canCreate &&
       createEndpoint && (
        <button
         type="button"
         onClick={()=>
          setShowForm(true)
         }
         className="rounded-full bg-white/15 p-2 transition hover:bg-white/25"
         aria-label="Add calendar item"
        >
         <Plus size={20} />
        </button>
       )
      }
     </div>
    </div>

    <div className="grid grid-cols-3 border-b border-gray-200 text-center">
     {
      Object.entries(views).map(
       ([key,label])=>(
        <button
         type="button"
         key={key}
         onClick={()=>{
          setView(key);
          if(key !== "week"){
           setMonthSelectedDate(null);
          }
         }}
         className={`
          py-3
          text-sm
          font-bold
          transition
          ${
           view === key
           ? "border-b-4 border-[#008C95] text-[#008C95]"
           : "text-gray-600 hover:bg-gray-50"
          }
         `}
        >
         {label}
        </button>
       )
      )
     }
    </div>

    <div className="p-4">
     <div className="mb-5 flex items-center justify-between gap-3">
      <button
       type="button"
       onClick={()=>
        movePeriod(-1)
       }
       className="rounded-md bg-[#008C95] p-2 text-white shadow-sm"
       aria-label="Previous period"
      >
       <ChevronLeft size={18} />
      </button>

      <h4 className="text-center text-lg font-bold text-gray-800">
       {title}
      </h4>

      <button
       type="button"
       onClick={()=>
        movePeriod(1)
       }
       className="rounded-md bg-[#008C95] p-2 text-white shadow-sm"
       aria-label="Next period"
      >
       <ChevronRight size={18} />
      </button>
     </div>

     <motion.div
      key={`${view}-${title}-${toInputDate(selectedDate)}-${events.length}-${settings.saturdayOff}`}
      initial={{
       opacity:0,
       y:8
      }}
      animate={{
       opacity:1,
       y:0
      }}
      transition={{
       duration:0.18
      }}
      className={compact ? "max-h-[620px] overflow-y-auto pr-1" : ""}
     >
      {
       loading
       ? <EmptyState label="Loading calendar..." />
       : view === "week"
       ? renderWeek()
       : view === "month"
       ? renderMonth()
       : renderYear()
      }
     </motion.div>
    </div>
   </div>

   {
    showForm && (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <motion.form
       initial={{
        opacity:0,
        scale:0.98
       }}
       animate={{
        opacity:1,
        scale:1
       }}
       onSubmit={handleSubmit}
       className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl"
      >
       <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">
         Add Calendar Item
        </h3>

        <button
         type="button"
         onClick={()=>
          setShowForm(false)
         }
         className="rounded-full bg-gray-100 p-2 text-gray-600"
         aria-label="Close"
        >
         <X size={18} />
        </button>
       </div>

       <div className="grid gap-3 md:grid-cols-2">
        <label className="md:col-span-2">
         <span className="text-sm font-semibold text-gray-700">
          Title
         </span>

         <input
          value={form.title}
          onChange={(event)=>
           setForm({
            ...form,
            title:event.target.value
           })
          }
          required
          className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-[#008C95]"
         />
        </label>

        <label>
         <span className="text-sm font-semibold text-gray-700">
          Type
         </span>

         <select
          value={form.eventType}
          onChange={(event)=>
           setForm({
            ...form,
            eventType:event.target.value
           })
          }
          className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-[#008C95]"
         >
          {
           calendarCreateTypes.map(
            type=>(
             <option
              key={type}
              value={type}
             >
              {typeMeta[type].label}
             </option>
            )
           )
          }
         </select>
        </label>

        <div className="md:col-span-2">
         <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-gray-700">
           Date
          </span>

          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
           <input
            type="checkbox"
            checked={form.multipleDates}
            onChange={(event)=>
             setForm({
              ...form,
              multipleDates:event.target.checked,
              dates:event.target.checked
               ? form.dates
               : [
                form.dateDraft
               ]
             })
            }
           />
           Multiple dates
          </label>
         </div>

         {
          !form.multipleDates
          ? (
           <input
            type="date"
            value={form.dateDraft}
            onChange={(event)=>
             setForm({
              ...form,
              dateDraft:event.target.value,
              dates:[
               event.target.value
              ]
             })
            }
            className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-[#008C95]"
           />
          )
          : (
           <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="mb-3 flex items-center justify-between">
             <button
              type="button"
              onClick={()=>
               moveFormMonth(-1)
              }
              className="rounded-md bg-white p-2 text-[#008C95] shadow-sm"
              aria-label="Previous month"
             >
              <ChevronLeft size={16} />
             </button>

             <p className="text-sm font-bold text-gray-900">
              {new Date(`${form.dateDraft}T00:00:00`).toLocaleDateString(
               undefined,
               {
                month:"long",
                year:"numeric"
               }
              )}
             </p>

             <button
              type="button"
              onClick={()=>
               moveFormMonth(1)
              }
              className="rounded-md bg-white p-2 text-[#008C95] shadow-sm"
              aria-label="Next month"
             >
              <ChevronRight size={16} />
             </button>
            </div>

            <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-gray-500">
             {
              dayNames.map(
               day=>(
                <span
                 key={day}
                 className="py-1"
                >
                 {day[0]}
                </span>
               )
              )
             }
            </div>

            <div className="grid grid-cols-7 text-center">
             {
              Array.from({
               length:
                new Date(
                 new Date(`${form.dateDraft}T00:00:00`).getFullYear(),
                 new Date(`${form.dateDraft}T00:00:00`).getMonth(),
                 1
                ).getDay()
              }).map(
               (_,index)=>(
                <span
                 key={`form-blank-${index}`}
                 className="h-8"
                />
               )
              )
             }

             {
              getMonthDates(
               new Date(`${form.dateDraft}T00:00:00`)
              ).map(
               day=>{
                const value =
                 toInputDate(day);

                const selected =
                 form.dates.includes(value);

                return (
                 <button
                  type="button"
                  key={value}
                  onClick={()=>
                   toggleFormDate(value)
                  }
                  className={`
                   mx-auto
                   my-1
                   flex
                   h-8
                   w-8
                   items-center
                   justify-center
                   rounded-full
                   text-xs
                   font-bold
                   transition
                   ${
                    selected
                    ? "bg-[#008C95] text-white"
                    : "text-gray-700 hover:bg-white"
                   }
                  `}
                 >
                  {day.getDate()}
                 </button>
                );
               }
              )
             }
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
             {
              form.dates.map(
               date=>(
                <span
                 key={date}
                 className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#008C95] shadow-sm"
                >
                 {new Date(`${date}T00:00:00`).toLocaleDateString()}
                 <button
                  type="button"
                  onClick={()=>
                   removeFormDate(date)
                  }
                  className="text-[#008C95]"
                  aria-label={`Remove ${date}`}
                 >
                  <X size={12} />
                 </button>
                </span>
               )
              )
             }
            </div>
           </div>
          )
         }
        </div>

        <label className="flex items-center gap-2 md:col-span-2">
         <input
          type="checkbox"
          checked={form.wholeDay}
          onChange={(event)=>
           setForm({
            ...form,
            wholeDay:event.target.checked
           })
          }
         />
         <span className="text-sm font-semibold text-gray-700">
          Whole day
         </span>
        </label>

        {
         !form.wholeDay && (
          <>
           <div>
            <span className="text-sm font-semibold text-gray-700">
             Start time
            </span>

            <div className="mt-1 grid grid-cols-[1fr_1fr_1.1fr] gap-2">
             <select
              value={form.startHour}
              onChange={(event)=>
               updateTimeField(
                "startHour",
                event.target.value
               )
              }
              className="h-10 rounded-xl border border-gray-200 px-2 outline-none focus:border-[#008C95]"
             >
              {
               hours12.map(
                hour=>(
                 <option
                  key={hour}
                  value={hour}
                 >
                  {hour}
                 </option>
                )
               )
              }
             </select>

             <select
              value={form.startMinute}
              onChange={(event)=>
               updateTimeField(
                "startMinute",
                event.target.value
               )
              }
              className="h-10 rounded-xl border border-gray-200 px-2 outline-none focus:border-[#008C95]"
             >
              {
               minutes.map(
                minute=>(
                 <option
                  key={minute}
                  value={minute}
                 >
                  {minute}
                 </option>
                )
               )
              }
             </select>

             <select
              value={form.startPeriod}
              onChange={(event)=>
               updateTimeField(
                "startPeriod",
                event.target.value
               )
              }
              className="h-10 rounded-xl border border-gray-200 px-2 outline-none focus:border-[#008C95]"
             >
              <option value="AM">
               AM
              </option>
              <option value="PM">
               PM
              </option>
             </select>
            </div>
           </div>

           <div>
            <span className="text-sm font-semibold text-gray-700">
             End time
            </span>

            <div className="mt-1 grid grid-cols-[1fr_1fr_1.1fr] gap-2">
             <select
              value={form.endHour}
              onChange={(event)=>
               updateTimeField(
                "endHour",
                event.target.value
               )
              }
              className="h-10 rounded-xl border border-gray-200 px-2 outline-none focus:border-[#008C95]"
             >
              {
               hours12.map(
                hour=>(
                 <option
                  key={hour}
                  value={hour}
                 >
                  {hour}
                 </option>
                )
               )
              }
             </select>

             <select
              value={form.endMinute}
              onChange={(event)=>
               updateTimeField(
                "endMinute",
                event.target.value
               )
              }
              className="h-10 rounded-xl border border-gray-200 px-2 outline-none focus:border-[#008C95]"
             >
              {
               minutes.map(
                minute=>(
                 <option
                  key={minute}
                  value={minute}
                 >
                  {minute}
                 </option>
                )
               )
              }
             </select>

             <select
              value={form.endPeriod}
              onChange={(event)=>
               updateTimeField(
                "endPeriod",
                event.target.value
               )
              }
              className="h-10 rounded-xl border border-gray-200 px-2 outline-none focus:border-[#008C95]"
             >
              <option value="AM">
               AM
              </option>
              <option value="PM">
               PM
              </option>
             </select>
            </div>
           </div>
          </>
         )
        }

        <label className="md:col-span-2">
         <span className="text-sm font-semibold text-gray-700">
          Visibility
         </span>

         <select
          value={form.visibility}
          onChange={(event)=>
           setForm({
            ...form,
            visibility:event.target.value,
            targetValue:"",
            classIds:[]
           })
          }
          className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-[#008C95]"
         >
          <option value="SCHOOL">
           Entire School
          </option>
          <option value="GRADE">
           Grade
          </option>
          <option value="CLASS">
           Class
          </option>
          <option value="SECTION">
           Section
          </option>
          <option value="TEACHER">
           Teachers
          </option>
         </select>
        </label>

        {
         form.visibility === "GRADE" && (
          <label className="md:col-span-2">
           <span className="text-sm font-semibold text-gray-700">
            Grade
           </span>

           <select
            value={form.targetValue}
            onChange={(event)=>
             setForm({
              ...form,
              targetValue:event.target.value
             })
            }
            required
            className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-[#008C95]"
           >
            <option value="">
             Select grade
            </option>
            {
             gradeOptions.map(
              grade=>(
               <option
                key={grade}
                value={grade}
               >
                {grade}
               </option>
              )
             )
            }
           </select>
          </label>
         )
        }

        {
         form.visibility === "SECTION" && (
          <label className="md:col-span-2">
           <span className="text-sm font-semibold text-gray-700">
            Section
           </span>

           <select
            value={form.targetValue}
            onChange={(event)=>
             setForm({
              ...form,
              targetValue:event.target.value
             })
            }
            required
            className="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-[#008C95]"
           >
            <option value="">
             Select section
            </option>
            {
             sectionOptions.map(
              section=>(
               <option
                key={section}
                value={section}
               >
                {section}
               </option>
              )
             )
            }
           </select>
          </label>
         )
        }

        {
         form.visibility === "CLASS" && (
          <div className="md:col-span-2">
           <p className="mb-2 text-sm font-semibold text-gray-700">
            Classes
           </p>

           <div className="grid max-h-36 gap-2 overflow-y-auto rounded-xl bg-gray-50 p-3 md:grid-cols-2">
            {
             classes.map(
              classItem=>(
               <label
                key={classItem.id}
                className="flex items-center gap-2 text-sm text-gray-700"
               >
                <input
                 type="checkbox"
                 checked={form.classIds.includes(classItem.id)}
                 onChange={()=>
                  toggleClass(classItem.id)
                 }
                />
                <span className="truncate">
                 {getClassLabel(classItem)}
                </span>
               </label>
              )
             )
            }
           </div>
          </div>
         )
        }

        <label className="md:col-span-2">
         <span className="text-sm font-semibold text-gray-700">
          Description
         </span>

         <textarea
          value={form.description}
          onChange={(event)=>
           setForm({
            ...form,
            description:event.target.value
           })
          }
          rows={3}
          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-[#008C95]"
         />
        </label>
       </div>

       <div className="mt-5 flex justify-end gap-3">
        <button
         type="button"
         onClick={()=>
          setShowForm(false)
         }
         className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600"
        >
         Cancel
        </button>

        <button
         type="submit"
         className="rounded-xl bg-[#008C95] px-4 py-2 text-sm font-semibold text-white"
        >
         Save
        </button>
       </div>
      </motion.form>
     </div>
    )
   }
  </div>
 );
}

export default AcademicCalendar;
