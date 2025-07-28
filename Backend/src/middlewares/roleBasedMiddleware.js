const isPatient = (req, res, next) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({ message: "Access denied: Patients only" });
  }
  next();
};

const isCaretaker = (req, res, next) => {
  if (req.user.role !== "caretaker") {
    return res.status(403).json({ message: "Access denied: Caretakers only" });
  }
  next();
};

const isPatientOrCaretaker = (req, res, next) => {
  const { role } = req.user;

  if (role === "patient" || role === "caretaker") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied: only for patients or caretakers" });
  }
};


module.exports = {
  isPatient,
  isCaretaker,
  isPatientOrCaretaker
};
