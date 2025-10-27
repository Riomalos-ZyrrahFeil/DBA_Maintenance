<?php
include '../../db.php';
header('Content-Type: application/json'); // Ensure JSON header is set

// We are assuming the original_prereq_id variable/input is now being used 
// to pass the unique ID of the row being updated (the prerequisite_id).
$prerequisite_id_to_update = $_POST['original_prereq_id']; 

$new_course = $_POST['new_course_id'];
$new_prereq = $_POST['new_prereq_id'];

// The query now updates the row based on the unique prerequisite_id, 
// rather than the composite key (old_course, old_prereq).
$stmt = $conn->prepare("UPDATE tbl_course_prerequisite 
    SET course_id = ?, prereq_course_id = ? 
    WHERE prerequisite_id = ?");

// The binding is simplified: (new_course_id, new_prereq_id, prerequisite_id_to_update)
$stmt->bind_param("iii", $new_course, $new_prereq, $prerequisite_id_to_update);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    // Return error message for debugging
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}
?>