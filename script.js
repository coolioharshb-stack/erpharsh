// Local storage safe arrays
let classes = JSON.parse(localStorage.getItem("classes") || "[]");
if (!Array.isArray(classes)) classes = [];

let students = JSON.parse(localStorage.getItem("students") || "[]");
if (!Array.isArray(students)) students = [];

let attendance = JSON.parse(localStorage.getItem("attendance") || "{}");

function checkPassword() {
  const input = document.getElementById("password-input").value;
  const errorMsg = document.getElementById("login-error");

  if (input === "Harsh@109") {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app").style.display = "block";
  } else {
    errorMsg.textContent = "Incorrect password!";
  }
}


// Navigation
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(pageId).classList.remove('hidden');
  if (pageId === "classes") renderClasses();
  if (pageId === "students") renderStudents();
  if (pageId === "attendance") loadAttendanceClasses();
  if (pageId === "dashboard") loadDashboardClasses();
}

// ====== Classes ======
function addClass() {
  const className = document.getElementById("classInput").value.trim();
  const section = document.getElementById("sectionInput").value.trim();
  if (!className || !section) return alert("Enter class and section!");
  classes.push({ name: className, section });
  localStorage.setItem("classes", JSON.stringify(classes));
  document.getElementById("classInput").value = "";
  document.getElementById("sectionInput").value = "";
  renderClasses();
  loadClassOptions();
}

function renderClasses() {
  const list = document.getElementById("classList");
  list.innerHTML = "";
  classes.forEach((c, i) => {
    const li = document.createElement("li");
    li.textContent = `${c.name}-${c.section}`;
    const btn = document.createElement("button");
    btn.textContent = "X";
    btn.onclick = () => {
      classes.splice(i, 1);
      localStorage.setItem("classes", JSON.stringify(classes));
      renderClasses();
      loadClassOptions();
    };
    li.appendChild(btn);
    list.appendChild(li);
  });
}

// ====== Students ======
function addStudent() {
  const name = document.getElementById("studentNameInput").value.trim();
  const classSel = document.getElementById("studentClassSelect").value;
  if (!name || !classSel) return alert("Enter student name and class!");
  students.push({ name, class: classSel });
  localStorage.setItem("students", JSON.stringify(students));
  document.getElementById("studentNameInput").value = "";
  renderStudents();
}

function renderStudents() {
  const list = document.getElementById("studentList");
  list.innerHTML = "";
  students.forEach((s, i) => {
    const li = document.createElement("li");
    li.textContent = `${s.name} (${s.class})`;
    const btn = document.createElement("button");
    btn.textContent = "X";
    btn.onclick = () => {
      students.splice(i, 1);
      localStorage.setItem("students", JSON.stringify(students));
      renderStudents();
    };
    li.appendChild(btn);
    list.appendChild(li);
  });
  loadClassOptions();
}

// Populate dropdowns
function loadClassOptions() {
  const selects = [
    document.getElementById("studentClassSelect"),
    document.getElementById("attendanceClassSelect"),
    document.getElementById("dashClassFilter")
  ];
  selects.forEach(sel => {
    if (!sel) return;
    sel.innerHTML = "<option value=''>--Select--</option>";
    classes.forEach(c => {
      const opt = document.createElement("option");
      opt.value = `${c.name}-${c.section}`;
      opt.textContent = `${c.name}-${c.section}`;
      sel.appendChild(opt);
    });
  });
}

// ====== Attendance ======
function loadAttendanceClasses() {
  loadClassOptions();
  document.getElementById("attendanceList").innerHTML = "";
}

function loadAttendanceStudents() {
  const classSel = document.getElementById("attendanceClassSelect").value;
  const listDiv = document.getElementById("attendanceList");
  listDiv.innerHTML = "";
  students.filter(s => s.class === classSel).forEach(s => {
    const row = document.createElement("div");
    row.textContent = s.name;
    const btnP = document.createElement("button");
    btnP.textContent = "P";
    btnP.className = "attendance-btn present";
    btnP.onclick = () => btnP.classList.add("dark");
    const btnA = document.createElement("button");
    btnA.textContent = "A";
    btnA.className = "attendance-btn absent";
    btnA.onclick = () => btnA.classList.add("dark");
    row.appendChild(btnP);
    row.appendChild(btnA);
    listDiv.appendChild(row);
  });
}

function submitAttendance() {
  const date = document.getElementById("attendanceDate").value;
  const classSel = document.getElementById("attendanceClassSelect").value;
  if (!date || !classSel) return alert("Select date and class!");
  if (!attendance[date]) attendance[date] = {};
  attendance[date][classSel] = {};
  document.querySelectorAll("#attendanceList div").forEach(row => {
    const name = row.firstChild.textContent;
    const status = row.querySelector(".dark")?.textContent || "N";
    attendance[date][classSel][name] = status;
  });
  localStorage.setItem("attendance", JSON.stringify(attendance));
  alert("Saved!");
}

// ===== Export =====
function exportCSV() {
  let csv = "Date,Class,Student,Status\n";
  for (let date in attendance) {
    for (let cls in attendance[date]) {
      for (let stu in attendance[date][cls]) {
        csv += `${date},${cls},${stu},${attendance[date][cls][stu]}\n`;
      }
    }
  }
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "attendance.csv";
  a.click();
}

// ===== Dashboard =====
function loadDashboardClasses() {
  loadClassOptions();
  document.getElementById("dashboardData").innerHTML = "";
}

function loadDashboardStudents() {
  const classSel = document.getElementById("dashClassFilter").value;
  const stuSel = document.getElementById("dashStudentFilter");
  stuSel.innerHTML = "<option value=''>--Select--</option>";
  students.filter(s => !classSel || s.class === classSel).forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.name;
    opt.textContent = s.name;
    stuSel.appendChild(opt);
  });
  showStudentAttendance();
}

function showStudentAttendance() {
  const classSel = document.getElementById("dashClassFilter").value;
  const stuSel = document.getElementById("dashStudentFilter").value;
  const dateSel = document.getElementById("dashDateFilter").value;
  const div = document.getElementById("dashboardData");
  div.innerHTML = "";

  for (let date in attendance) {
    if (dateSel && date !== dateSel) continue;
    if (!attendance[date][classSel]) continue;
    for (let stu in attendance[date][classSel]) {
      if (stuSel && stu !== stuSel) continue;
      div.innerHTML += `${date} - ${stu} (${classSel}): ${attendance[date][classSel][stu]}<br>`;
    }
  }
}

// Load on start
loadClassOptions();
showPage('dashboard');
