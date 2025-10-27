<?php
include '../../db.php';
header('Content-Type: application/json');

$prerequisite_id = $_POST['prerequisite_id_to_delete'];

$stmt = $conn->prepare("UPDATE tbl_course_prerequisite 
    SET is_deleted = 1 
    WHERE prerequisite_id = ?");
    
$stmt->bind_param("i", $prerequisite_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode([
        "status" => "error", 
        "message" => "Could not delete the prerequisite."
    ]);
}
?>