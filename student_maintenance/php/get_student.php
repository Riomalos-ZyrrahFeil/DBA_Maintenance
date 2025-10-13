<?php
include '../../db.php';

$student_id = $_GET['student_id'] ?? null;

if (!$student_id) {
  echo json_encode(['error' => 'Missing student_id']);
  exit;
}

$sql = "SELECT * FROM tbl_student WHERE student_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $student_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
  echo json_encode($row);
} else {
  echo json_encode(['error' => 'Student not found']);
}
?>
