<?php
error_reporting(E_ERROR | E_PARSE);
header('Content-Type: application/json');
include '../../db.php';

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['instructor_id'] ?? '';

if ($id) {
    // Soft delete instead of permanent delete
    $stmt = $conn->prepare("UPDATE tbl_instructor SET is_deleted = 1 WHERE instructor_id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Instructor deleted successfully."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to delete instructor."]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request."]);
}

$conn->close();
?>
