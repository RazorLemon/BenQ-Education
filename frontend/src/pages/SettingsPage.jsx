import {
 useContext,
 useEffect,
 useMemo,
 useState
}
from "react";

import {
 CalendarDays,
 Database,
 KeyRound,
 Save,
 School,
 Settings as SettingsIcon
}
from "lucide-react";

import {
 useNavigate
}
from "react-router-dom";

import AdminLayout
from "../layouts/AdminLayout";

import TeacherLayout
from "../layouts/TeacherLayout";

import StudentLayout
from "../layouts/StudentLayout";

import PageHeader
from "../components/ui/PageHeader";

import LoadingSpinner
from "../components/ui/LoadingSpinner";

import api
from "../api/axios";

import {
 notifySuccess
}
from "../utils/toast";

import {
 AuthContext
}
from "../context/auth-context";

const layoutByRole = {
 ADMIN:AdminLayout,
 TEACHER:TeacherLayout,
 STUDENT:StudentLayout
};

const endpointByRole = {
 ADMIN:"/admin/settings",
 TEACHER:"/teacher/settings",
 STUDENT:"/student/settings"
};

const viewLabels = {
 week:"Weekly",
 month:"Monthly",
 year:"Yearly"
};

function Toggle({
 checked,
 disabled,
 onChange,
 label,
 description
}) {
 return (
  <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
   <div>
    <p className="text-sm font-bold text-gray-900">
     {label}
    </p>

    <p className="mt-1 text-xs text-gray-500">
     {description}
    </p>
   </div>

   <button
    type="button"
    disabled={disabled}
    onClick={()=>
     onChange(!checked)
    }
    className={`
     relative
     h-8
     w-14
     rounded-full
     transition
     disabled:cursor-not-allowed
     disabled:opacity-60
     ${
      checked
      ? "bg-[#008C95]"
      : "bg-gray-300"
     }
    `}
    aria-pressed={checked}
   >
    <span
     className={`
      absolute
      top-1
      h-6
      w-6
      rounded-full
      bg-white
      shadow
      transition
      ${
       checked
       ? "left-7"
       : "left-1"
      }
     `}
    />
   </button>
  </div>
 );
}

function SettingsSection({
 icon:Icon,
 title,
 children
}) {
 return (
  <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
   <div className="mb-4 flex items-center gap-3">
    <div className="rounded-xl bg-[#E6F7F5] p-2 text-[#008C95]">
     <Icon size={18} />
    </div>

    <h2 className="text-lg font-bold text-gray-900">
     {title}
    </h2>
   </div>

   {children}
  </section>
 );
}

function SettingsPage() {
 const {
  user
 } = useContext(AuthContext);

 const navigate =
  useNavigate();

 const role =
  user?.role;

 const Layout =
  layoutByRole[role] ||
  AdminLayout;

 const endpoint =
  endpointByRole[role];

 const editable =
  role === "ADMIN";

 const [loading,setLoading] =
  useState(true);

 const [saving,setSaving] =
  useState(false);

 const [form,setForm] =
  useState({
   schoolName:"",
   schoolCode:"",
   saturdayOff:true,
   calendarDefaultView:"week",
   cacheEnabled:true,
   cacheTtlSeconds:60
  });

 const [runtime,setRuntime] =
  useState(null);

 const title =
  useMemo(
   ()=>
    editable
    ? "Settings"
    : "School Settings",
   [
    editable
   ]
  );

 useEffect(()=>{
  const fetchSettings =
   async ()=>{
    if(!endpoint){
     return;
    }

    try{
     const response =
      await api.get(endpoint);

     setForm({
      schoolName:
       response.data.school?.name || "",
      schoolCode:
       response.data.school?.code || "",
      saturdayOff:
       response.data.calendar?.saturdayOff ?? true,
      calendarDefaultView:
       response.data.calendar?.defaultView || "week",
      cacheEnabled:
       response.data.cache?.enabled ?? true,
      cacheTtlSeconds:
       response.data.cache?.ttlSeconds || 60
     });

     setRuntime(
      response.data.cache || null
     );
    }catch(error){
     console.error(error);
    }finally{
     setLoading(false);
    }
   };

  fetchSettings();
 },[
  endpoint
 ]);

 const updateField =
  (
   field,
   value
  )=>{
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

   if(!editable){
    return;
   }

   try{
    setSaving(true);

    const response =
     await api.put(
      endpoint,
      form
     );

    setRuntime(
     response.data.cache || null
    );

    notifySuccess(
     "Settings updated"
    );
   }catch(error){
    console.error(error);
   }finally{
    setSaving(false);
   }
  };

 if(loading){
  return (
   <Layout title={title}>
    <LoadingSpinner />
   </Layout>
  );
 }

 return (
  <Layout title={title}>
   <PageHeader
    title={title}
    subtitle={
     editable
     ? "Manage school-wide defaults and operational settings"
     : "View the school defaults used across your portal"
    }
   />

   <form
    onSubmit={handleSubmit}
    className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]"
   >
    <div className="space-y-5">
     <SettingsSection
      icon={School}
      title="School"
     >
      <div className="grid gap-4 md:grid-cols-2">
       <label>
        <span className="text-sm font-semibold text-gray-700">
         School name
        </span>

        <input
         value={form.schoolName}
         disabled={!editable}
         onChange={(event)=>
          updateField(
           "schoolName",
           event.target.value
          )
         }
         className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-[#008C95] disabled:bg-gray-50 disabled:text-gray-500"
        />
       </label>

       <label>
        <span className="text-sm font-semibold text-gray-700">
         School code
        </span>

        <input
         value={form.schoolCode}
         disabled={!editable}
         onChange={(event)=>
          updateField(
           "schoolCode",
           event.target.value
          )
         }
         className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-[#008C95] disabled:bg-gray-50 disabled:text-gray-500"
        />
       </label>
      </div>
     </SettingsSection>

     <SettingsSection
      icon={CalendarDays}
      title="Academic Calendar"
     >
      <div className="space-y-4">
       <Toggle
        checked={form.saturdayOff}
        disabled={!editable}
        onChange={(value)=>
         updateField(
          "saturdayOff",
          value
         )
        }
        label="Keep Saturdays off"
        description="When enabled, Saturdays are marked as off-days along with Sundays."
       />

       <label className="block">
        <span className="text-sm font-semibold text-gray-700">
         Default calendar view
        </span>

        <select
         value={form.calendarDefaultView}
         disabled={!editable}
         onChange={(event)=>
          updateField(
           "calendarDefaultView",
           event.target.value
          )
         }
         className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-[#008C95] disabled:bg-gray-50 disabled:text-gray-500"
        >
         {
          Object.entries(viewLabels).map(
           ([value,label])=>(
            <option
             key={value}
             value={value}
            >
             {label}
            </option>
           )
          )
         }
        </select>
       </label>
      </div>
     </SettingsSection>

     <SettingsSection
      icon={Database}
      title="Read Cache"
     >
      <div className="space-y-4">
       <Toggle
        checked={form.cacheEnabled}
        disabled={!editable}
        onChange={(value)=>
         updateField(
          "cacheEnabled",
          value
         )
        }
        label="Enable Redis caching"
        description="Repeated dashboard, analytics, calendar, and list reads can be served from Redis."
       />

       <label className="block">
        <span className="text-sm font-semibold text-gray-700">
         Cache TTL seconds
        </span>

        <input
         type="number"
         min="5"
         max="3600"
         value={form.cacheTtlSeconds}
         disabled={!editable || !form.cacheEnabled}
         onChange={(event)=>
          updateField(
           "cacheTtlSeconds",
           Number(event.target.value)
          )
         }
         className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-[#008C95] disabled:bg-gray-50 disabled:text-gray-500"
        />
       </label>
      </div>
     </SettingsSection>
    </div>

    <aside className="space-y-5">
     <SettingsSection
      icon={SettingsIcon}
      title="Current Defaults"
     >
      <dl className="space-y-3 text-sm">
       <div className="flex items-center justify-between gap-3">
        <dt className="text-gray-500">
         Saturdays
        </dt>
        <dd className="font-bold text-gray-900">
         {form.saturdayOff ? "Off" : "Working"}
        </dd>
       </div>

       <div className="flex items-center justify-between gap-3">
        <dt className="text-gray-500">
         Calendar opens to
        </dt>
        <dd className="font-bold text-gray-900">
         {viewLabels[form.calendarDefaultView]}
        </dd>
       </div>

       <div className="flex items-center justify-between gap-3">
        <dt className="text-gray-500">
         Redis cache
        </dt>
        <dd className="font-bold text-gray-900">
         {form.cacheEnabled ? "Enabled" : "Disabled"}
        </dd>
       </div>

       <div className="flex items-center justify-between gap-3">
        <dt className="text-gray-500">
         TTL
        </dt>
        <dd className="font-bold text-gray-900">
         {form.cacheTtlSeconds}s
        </dd>
       </div>
      </dl>

      {
       runtime && (
        <p className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
         If a school has no saved setting yet, the backend falls back to {runtime.fallbackEnabled ? "enabled" : "disabled"} caching with a {runtime.fallbackTtlSeconds}s TTL.
        </p>
       )
      }
     </SettingsSection>

     <SettingsSection
      icon={KeyRound}
      title="Account"
     >
      <button
       type="button"
       onClick={()=>
        navigate("/change-password")
       }
       className="w-full rounded-xl bg-[#008C95] px-4 py-3 text-sm font-bold text-white"
      >
       Change Password
      </button>
     </SettingsSection>

     {
      editable && (
       <button
        type="submit"
        disabled={saving}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#008C95] px-5 py-3 text-sm font-bold text-white shadow-sm disabled:opacity-60"
       >
        <Save size={18} />
        {saving ? "Saving..." : "Save settings"}
       </button>
      )
     }
    </aside>
   </form>
  </Layout>
 );
}

export default SettingsPage;
