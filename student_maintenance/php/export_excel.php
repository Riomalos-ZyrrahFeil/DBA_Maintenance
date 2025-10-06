<?php
include '../../db.php';

header("Content-Type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=students.xls");

$result = $conn->query("SELECT * FROM tbl_student");

echo "ID\tName\tEmail\tGender\tBirthdate\tYear Level\tProgram ID\n";
while ($row = $result->fetch_assoc()) {
  echo "{$row['student_id']}\t{$row['student_name']}\t{$row['email']}\t{$row['gender']}\t{$row['birthdate']}\t{$row['year_level']}\t{$row['program_id']}\n";
}
?>
