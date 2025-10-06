<?php
include '../../db.php';

header("Content-Type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=enrollments.xls");

echo "Enrollment ID\tStudent ID\tSection ID\tDate Enrolled\tStatus\tLetter Grade\n";

$result = $conn->query("SELECT * FROM tbl_enrollment ORDER BY enrollment_id DESC");

while ($row = $result->fetch_assoc()) {
    echo $row['enrollment_id'] . "\t" . $row['student_id'] . "\t" . $row['section_id'] . "\t" . $row['date_enrolled'] . "\t" . $row['status'] . "\t" . $row['letter_grade'] . "\n";
}
?>
