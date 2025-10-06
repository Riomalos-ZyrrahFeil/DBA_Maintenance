<?php
include '../../db.php';
header('Content-Type: application/json');

$sql = "SELECT course_id, course_code, title FROM tbl_course";
$result = $conn->query($sql);
$courses = [];

if($result->num_rows > 0){
    while($row = $result->fetch_assoc()){
        $courses[] = $row;
    }
}
echo json_encode($courses);
$conn->close();
?>
