<?php
include '../../db.php';

$old_course = $_POST['original_course_id'];
$old_prereq = $_POST['original_prereq_id'];
$new_course = $_POST['new_course_id'];
$new_prereq = $_POST['new_prereq_id'];

$stmt = $conn->prepare("UPDATE tbl_course_prerequisite 
    SET course_id = ?, prereq_course_id = ? 
    WHERE course_id = ? AND prereq_course_id = ?");
$stmt->bind_param("iiii", $new_course, $new_prereq, $old_course, $old_prereq);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}
?>
