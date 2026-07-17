export const formatAcademicSession = (year)=>{
  const startYear =
    Number(year);

  if(
    !Number.isInteger(startYear) ||
    startYear < 0
  ){
    return year || "";
  }

  return `${startYear}-${String(startYear + 1).slice(-2)}`;
};

export const getCurrentAcademicSessionYear = ()=>
  new Date().getFullYear();

export const buildAcademicSessionOptions = ()=>{
  const currentYear =
    getCurrentAcademicSessionYear();

  return [
    currentYear - 1,
    currentYear,
    currentYear + 1
  ];
};
