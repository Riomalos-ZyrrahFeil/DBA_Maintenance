<?php
include '../../db.php';

// Optional filters and sorting
$student_id = $_GET['student_id'] ?? null;
$search = trim($_GET['search'] ?? '');
$sort_by = $_GET['sort_by'] ?? 'student_id';
$order = strtoupper($_GET['order'] ?? 'DESC');

// ✅ Validate sorting direction
if (!in_array($order, ['ASC', 'DESC'])) {
  $order = 'DESC';
}

// ✅ Whitelist sortable columns
$allowed_sort_columns = ['student_id', 'student_no', 'student_name', 'email', 'gender', 'birthdate', 'year_level', 'program_id'];
if (!in_array($sort_by, $allowed_sort_columns)) {
  $sort_by = 'student_id';
}

if ($student_id) {
  // ✅ Fetch a single student by ID (skip deleted ones)
  $sql = "SELECT * FROM tbl_student WHERE student_id = ? AND is_deleted = 0";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("i", $student_id);
  $stmt->execute();
  $result = $stmt->get_result();
  $student = $result->fetch_assoc();

  echo json_encode($student ?: ['error' => 'Student not found']);
  exit;
}

// ✅ Fetch all students (skip deleted ones)
if ($search !== '') {
  $sql = "SELECT * FROM tbl_student 
          WHERE is_deleted = 0
            AND (student_name LIKE ? OR student_no LIKE ?)
          ORDER BY $sort_by $order";
  $stmt = $conn->prepare($sql);
  $search_term = "%$search%";
  $stmt->bind_param("ss", $search_term, $search_term);
} else {
  $sql = "SELECT * FROM tbl_student 
          WHERE is_deleted = 0
          ORDER BY $sort_by $order";
  $stmt = $conn->prepare($sql);
}

$stmt->execute();
$result = $stmt->get_result();

$students = [];
while ($row = $result->fetch_assoc()) {
  $students[] = $row;
}

echo json_encode($students);
?>
