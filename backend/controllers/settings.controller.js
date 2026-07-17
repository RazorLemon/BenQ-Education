import prisma from "../prismaClient.js";
import { env } from "../config/env.js";
import {
 clearSchoolSettingsCache,
 getSchoolSettings,
 updateSchoolSettings
} from "../services/settings.service.js";
import {
 invalidateSchoolCache
} from "../services/cache.service.js";

const getSchoolId = (req) =>
 req.user.schoolId;

const toSettingsResponse = ({
 school,
 settings,
 editable = false
}) => ({
 editable,
 school:{
  id:school.id,
  name:school.name,
  code:school.code
 },
 calendar:{
  saturdayOff:settings.saturdayOff,
  defaultView:settings.calendarDefaultView
 },
 cache:{
  enabled:settings.cacheEnabled,
  ttlSeconds:settings.cacheTtlSeconds,
  configuredBy:"settings",
  fallbackEnabled:env.CACHE_ENABLED,
  fallbackTtlSeconds:env.CACHE_TTL_SECONDS
 }
});

export const getSettings =
async (req,res)=>{
 try{
  const school =
   await prisma.school.findUnique({
    where:{
     id:getSchoolId(req)
    }
   });

  if(!school){
   return res.status(404).json({
    message:"School not found"
   });
  }

  const settings =
   await getSchoolSettings(school.id);

  res.json(
   toSettingsResponse({
    school,
    settings,
    editable:req.user.role === "ADMIN"
   })
  );
 }catch(error){
  console.error(error);
  res.status(500).json({
   message:"Server Error"
  });
 }
};

export const updateSettings =
async (req,res)=>{
 try{
  const schoolId =
   getSchoolId(req);

  const {
   schoolName,
   schoolCode,
   saturdayOff,
   calendarDefaultView,
   cacheEnabled,
   cacheTtlSeconds
  } = req.body;

  const school =
   await prisma.school.update({
    where:{
     id:schoolId
    },
    data:{
     name:schoolName,
     code:schoolCode
    }
   });

  const settings =
   await updateSchoolSettings(
    schoolId,
    {
     saturdayOff,
     calendarDefaultView,
     cacheEnabled,
     cacheTtlSeconds
    }
   );

  clearSchoolSettingsCache(
   schoolId
  );

  await invalidateSchoolCache(
   schoolId
  );

  res.json(
   toSettingsResponse({
    school,
    settings,
    editable:true
   })
  );
 }catch(error){
  console.error(error);

  if(error.code === "P2002"){
   return res.status(409).json({
    message:"School code is already in use"
   });
  }

  res.status(500).json({
   message:"Server Error"
  });
 }
};
