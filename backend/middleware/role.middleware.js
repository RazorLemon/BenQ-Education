export const requireAdmin = (
  req,
  res,
  next
) => {

  if (
    req.user.role !== "ADMIN"
  ) {
    return res.status(403).json({
      message: "Admin only"
    });
  }

  next();
};

export const requireTeacher = (
  req,
  res,
  next
) => {

  if (
    req.user.role !== "TEACHER"
  ) {
    return res.status(403).json({
      message: "Teacher only"
    });
  }

  next();
};

export const requireStudent = (
  req,
  res,
  next
) => {

  if (
    req.user.role !== "STUDENT"
  ) {
    return res.status(403).json({
      message: "Student only"
    });
  }

  next();
};