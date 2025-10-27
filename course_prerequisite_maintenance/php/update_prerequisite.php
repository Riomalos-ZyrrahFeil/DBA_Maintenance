<?php
include '../../db.php';
header('Content-Type: application/json');

$prerequisite_id_to_update = $_POST['original_prereq_id']; 

$new_course = $_POST['new_course_id'];
$new_prereq = $_POST['new_prereq_id'];
$stmt = $conn->prepare("UPDATE tbl_course_prerequisite 
    SET course_id = ?, prereq_course_id = ? 
    WHERE prerequisite_id = ?");

$stmt->bind_param("iii", $new_course, $new_prereq, $prerequisite_id_to_update);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}
?>