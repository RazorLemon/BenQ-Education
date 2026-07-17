import prisma from "../prismaClient.js";
import { env } from "../config/env.js";

const settingsCache =
 new Map();

const normalizeSettings = (settings = {}) => ({
 saturdayOff:
  settings.saturdayOff ?? true,
 calendarDefaultView:
  settings.calendarDefaultView || "week",
 cacheEnabled:
  settings.cacheEnabled ?? env.CACHE_ENABLED,
 cacheTtlSeconds:
  settings.cacheTtlSeconds || env.CACHE_TTL_SECONDS
});

export const getDefaultSettings = () =>
 normalizeSettings();

export const clearSchoolSettingsCache = (schoolId) => {
 if(schoolId){
  settingsCache.delete(schoolId);
 }
};

export const getSchoolSettings = async (schoolId) => {
 if(!schoolId){
  return getDefaultSettings();
 }

 const cached =
  settingsCache.get(schoolId);

 if(cached){
  return cached;
 }

 let settings =
  await prisma.schoolSetting.findUnique({
   where:{
    schoolId
   }
  });

 if(!settings){
  settings =
   await prisma.schoolSetting.create({
    data:{
     schoolId,
     cacheEnabled:
      env.CACHE_ENABLED,
     cacheTtlSeconds:
      env.CACHE_TTL_SECONDS
    }
   });
 }

 const normalized =
  normalizeSettings(settings);

 settingsCache.set(
  schoolId,
  normalized
 );

 return normalized;
};

export const updateSchoolSettings = async (
 schoolId,
 data
) => {
 const settings =
  await prisma.schoolSetting.upsert({
   where:{
    schoolId
   },
   update:data,
   create:{
    schoolId,
    ...data
   }
  });

 const normalized =
  normalizeSettings(settings);

 settingsCache.set(
  schoolId,
  normalized
 );

 return normalized;
};
