<?php
include '../../db.php';
header('Content-Type: application/json');

// Corrected column names: student_id and student_name
$result = $conn->query("SELECT student_id, student_name FROM tbl_student ORDER BY student_name ASC");

$students = [];
while ($row = $result->fetch_assoc()) {
    $students[] = $row;
}

echo json_encode($students);
?>
