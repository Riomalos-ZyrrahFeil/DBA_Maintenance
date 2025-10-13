<?php
include '../../db.php';

// Decode JSON input
$data = json_decode(file_get_contents("php://input"), true);

// ✅ Basic validation
if (
  empty($data['student_no']) ||
  empty($data['student_name']) ||
  empty($data['email']) ||
  empty($data['gender']) ||
  empty($data['birthdate']) ||
  empty($data['year_level']) ||
  empty($data['program_id'])
) {
  echo "Please fill out all required fields.";
  exit;
}

// ✅ Insert query with new column
$sql = "INSERT INTO tbl_student 
        (student_no, student_name, email, gender, birthdate, year_level, program_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
  "sssssss",
  $data['student_no'],
  $data['student_name'],
  $data['email'],
  $data['gender'],
  $data['birthdate'],
  $data['year_level'],
  $data['program_id']
);

if ($stmt->execute()) {
  echo "Student added successfully!";
} else {
  echo "Error adding student: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
