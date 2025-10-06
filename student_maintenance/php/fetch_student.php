<?php
include '../../db.php';

$search = $_GET['search'] ?? '';

$sql = "SELECT * FROM tbl_student WHERE student_name LIKE '%$search%' ORDER BY student_id DESC";
$result = $conn->query($sql);

$students = [];
while ($row = $result->fetch_assoc()) {
  $students[] = $row;
}

echo json_encode($students);
?>
