<?php
include '../../db.php';

// Optional filters and sorting
$student_id = $_GET['student_id'] ?? null;
$search = $_GET['search'] ?? '';
$sort_by = $_GET['sort_by'] ?? 'student_id';
$order = strtoupper($_GET['order'] ?? 'DESC');

// Validate order to avoid SQL injection
if (!in_array($order, ['ASC', 'DESC'])) {
  $order = 'DESC';
}

// Allowed sortable columns (whitelist for security)
$allowed_sort_columns = ['student_id', 'student_no', 'student_name', 'email', 'gender', 'birthdate', 'year_level', 'program_id'];
if (!in_array($sort_by, $allowed_sort_columns)) {
  $sort_by = 'student_id';
}

if ($student_id) {
  // ✅ Fetch a single student by ID
  $sql = "SELECT * FROM tbl_student WHERE student_id = ?";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("i", $student_id);
  $stmt->execute();
  $result = $stmt->get_result();
  $student = $result->fetch_assoc();

  echo json_encode($student ?: ['error' => 'Student not found']);
  exit;
}

// ✅ Otherwise, fetch all students (with optional search + sort)
$sql = "SELECT * FROM tbl_student 
        WHERE student_name LIKE ? 
        ORDER BY $sort_by $order";

$stmt = $conn->prepare($sql);
$search_term = "%$search%";
$stmt->bind_param("s", $search_term);
$stmt->execute();
$result = $stmt->get_result();

$students = [];
while ($row = $result->fetch_assoc()) {
  $students[] = $row;
}

echo json_encode($students);
?>
