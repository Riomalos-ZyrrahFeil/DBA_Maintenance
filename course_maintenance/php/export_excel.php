<?php
include '../../db.php';

header("Content-Type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=courses.xls");

echo "Course ID\tCourse Code\tTitle\tLecture Hours\tLab Hours\tUnits\n";

$result = $conn->query("SELECT * FROM tbl_course ORDER BY course_id DESC");

while ($row = $result->fetch_assoc()) {
    echo $row['course_id'] . "\t" . $row['course_code'] . "\t" . $row['title'] . "\t" . $row['lecture_hours'] . "\t" . $row['lab_hours'] . "\t" . $row['units'] . "\n";
}
?>
